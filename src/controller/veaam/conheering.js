const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
import { createConnection } from "mysql2/promise";

const port = 9419;
const baseUrl = "https://192.168.28.22";
const tokenUrl = `${baseUrl}:${port}/api/oauth2/token`;
const sessionApiUrl = `${baseUrl}:${port}/api/v1/sessions?limit=3`;
const repositoryApiUrl = `${baseUrl}:${port}/api/v1/backupInfrastructure/repositories/states`;
const username = "restapi";
const password = '-$$k9OKe2bOlC?$0"fBZ';
/*

const username = "restapi";
const password = "UDVuaDUoPUO2dyLfVHof";
*/

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // Disable certificate verification

class AccessTokenManager {
  constructor(serverURL, port, username, password) {
    this.serverURL = serverURL;
    this.port = port;
    this.username = username;
    this.password = password;
    this.access_token = null;
    this.refresh_token = null;
    this.tokenExpiryTime = null;
  }

  async fetchAccessToken() {
    const requestData = {
      grant_type: "password",
      username: this.username,
      password: this.password,
    };

    const response = await fetch(
      `https://${this.serverURL}:${this.port}/api/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "1.0-rev1",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }

    const data = await response.json();

    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    this.tokenExpiryTime = new Date().getTime() + data.expires_in * 1000;
    console.log(`Access token refreshed: Bearer ${this.access_token}`);
  }

  async getAccessToken() {
    if (!this.access_token || this.tokenExpiryTime <= new Date().getTime()) {
      await this.fetchAccessToken();
    }
    return this.access_token;
  }
}

(async () => {
  try {
    const accessTokenManager = new AccessTokenManager(
      "192.168.28.22",
      9419,
      username,
      password
    );

    const accessToken = await accessTokenManager.getAccessToken();

    const headers = {
      Accept: "application/json",
      "x-api-version": "1.0-rev1",
      Authorization: `Bearer ${accessToken}`,
    };

    // Fetch and insert session data
    const fetchAndInsertSessions = async () => {
      const response = await fetch(sessionApiUrl, {
        headers: headers,
        agent: new (
          await import("https")
        ).Agent({
          rejectUnauthorized: false,
        }), // Ignore self-signed certificate
      });

      if (!response.ok) {
        throw new Error("Error fetching JSON data from the API");
      }

      const data = await response.json();

      // Establish a connection to the MySQL database
      const connection = await createConnection({
        /*  host: "10.0.11.196",
        user: "root",
        password: "Test@10!",
        database: "new_schema" */
        host: "localhost",
        user: "root",
        password: "",
        database: "hallotest",
      });

      const deleteSql = `DELETE FROM sessions`;
      await connection.query(deleteSql); // Clear existing session data

      // Example: Insert data into a MySQL database
      const insertData = async (record) => {
        const sql = `INSERT INTO sessions (id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
          record.id,
          record.name,
          record.activityId,
          record.sessionType,
          record.creationTime,
          record.endTime,
          record.state,
          record.progressPercent,
          record.result.result,
          record.result.message,
          record.result.isCanceled,
          record.resourceId,
          record.resourceReference,
          record.parentSessionId,
          record.usn,
        ];

        await connection.query(sql, values);
      };

      for (const record of data.data) {
        await insertData(record);
        console.log("Inserted session record:", record);
      }

      await connection.end();
    };

    // Fetch and insert repository data
    const fetchAndInsertRepositories = async () => {
      const response = await fetch(repositoryApiUrl, {
        headers: headers,
        agent: new (
          await import("https")
        ).Agent({
          rejectUnauthorized: false,
        }), // Ignore self-signed certificate
      });

      if (!response.ok) {
        throw new Error("Error fetching JSON data from the API");
      }

      const data = await response.json();

      // Establish a connection to the MySQL database
      const connection = await createConnection({
        /* host: "10.0.11.196",
        user: "root",
        password: "Test@10!",
        database: "new_schema" */
        host: "localhost",
        user: "root",
        password: "",
        database: "hallotest",
      });

      const deleteSql = `DELETE FROM repositories`;
      await connection.query(deleteSql); // Clear existing session data
      // Example: Insert data into a MySQL database
      const insertData = async (record) => {
        const sql = `INSERT INTO repositories(id, type, name, description, hostId, hostName, path, capacityGB, freeGB, usedSpaceGB)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
          record.id,
          record.type,
          record.name,
          record.description,
          record.hostId,
          record.hostName,
          record.path,
          record.capacityGB,
          record.freeGB,
          record.usedSpaceGB,
        ];

        await connection.query(sql, values);
      };

      for (const record of data.data) {
        await insertData(record);
        console.log("Inserted repository record:", record);
      }

      await connection.end();
    };

    await fetchAndInsertSessions();
    await fetchAndInsertRepositories();

    console.log("Success");
  } catch (error) {
    console.error(error);
    console.log("Failed");
  }
})();
