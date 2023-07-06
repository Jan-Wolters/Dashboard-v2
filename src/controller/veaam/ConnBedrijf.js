const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
import { resolveObjectURL } from "buffer";
import { createConnection } from "mysql2/promise";

class ApiManager {
  constructor(companyname, serverURL, port, username, password) {
    this.companyname = this.companyname;
    this.serverURL = serverURL;
    this.port = port;
    this.username = username;
    this.password = password;
    this.access_token = null;
    this.refresh_token = null;
    this.tokenExpiryTime = null;
  }

  async fetchAccessToken() {
    try {
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // Trust self-signed certificate

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
    } catch (error) {
      // Handle the error
    }
  }

  async getAccessToken() {
    if (!this.access_token || this.tokenExpiryTime <= new Date().getTime()) {
      await this.fetchAccessToken();
    }
    return this.access_token;
  }

  async insertRepositories() {
    try {
      const accessToken = await this.getAccessToken();

      const headers = {
        Accept: "application/json",
        "x-api-version": "1.0-rev1",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch(
        `https://${this.serverURL}:${this.port}/api/v1/backupInfrastructure/repositories/states`,
        {
          headers: headers,
          agent: new (
            await import("https")
          ).Agent({ rejectUnauthorized: false }), // Ignore self-signed certificate
        }
      );

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

      // Insert data, values are in order same as API provides it back.
      const insertData = async (record) => {
        const sql = `INSERT INTO repositories (type, id, name, description, hostId, hostName, path, capacityGB, freeGB, usedSpaceGB)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     type = VALUES(type),
                     name = VALUES(name),
                     description = VALUES(description),
                     hostId = VALUES(hostId),
                     hostName = VALUES(hostName),
                     path = VALUES(path),
                     capacityGB = VALUES(capacityGB),
                     freeGB = VALUES(freeGB),
                     usedSpaceGB = VALUES(usedSpaceGB)`;
        const values = [
          record.type,
          record.id,
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

      if (!Array.isArray(data.data)) {
        throw new Error("No data records found");
      }

      if (data.data.length === 0) {
        console.log("No data records found"); // Display error message
        return; // Exit the function
      }

      // For each record, insert to database
      for (const record of data.data) {
        await insertData(record);
        console.log("Success in Repositories");
      }

      await connection.end();

      setTimeout(() => this.insertRepositories(), 15 * 1000);
    } catch (error) {
      console.error(error);
      console.log("Failed");
    }
  }

  async insertSessions() {
    try {
      const accessToken = await this.getAccessToken();

      const headers = {
        Accept: "application/json",
        "x-api-version": "1.0-rev1",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch(
        `https://${this.serverURL}:${this.port}/api/v1/sessions?limit=5`,
        {
          headers: headers,
          agent: new (
            await import("https")
          ).Agent({ rejectUnauthorized: false }), // Ignore self-signed certificate
        }
      );

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

      // Insert data, values are in order same as API provides it back.
      // Result is null till progressPercent is 100!
      const insertData = async (record) => {
        const sql = `INSERT INTO sessions (id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      activityId = VALUES(activityId),
      sessionType = VALUES(sessionType),
      creationTime = VALUES(creationTime),
      endTime = VALUES(endTime),
      state = VALUES(state),
      progressPercent = VALUES(progressPercent),
      resultResult = IF(VALUES(progressPercent) < 100, NULL, VALUES(resultResult)),
      resultMessage = IF(VALUES(progressPercent) < 100, NULL, VALUES(resultMessage)),
      resultIsCanceled = IF(VALUES(progressPercent) < 100, NULL, VALUES(resultIsCanceled)),
      resourceId = VALUES(resourceId),
      resourceReference = VALUES(resourceReference),
      parentSessionId = VALUES(parentSessionId),
      usn = VALUES(usn)`;
        const values = [
          record.id,
          record.name,
          record.activityId,
          record.sessionType,
          record.creationTime,
          record.endTime,
          record.state,
          record.progressPercent,
          record.progressPercent < 100 ? null : record.result.result,
          record.progressPercent < 100 ? null : record.result.message,
          record.progressPercent < 100 ? null : record.result.isCanceled,
          record.resourceId,
          record.resourceReference,
          record.parentSessionId,
          record.usn,
        ];

        await connection.query(sql, values);
      };

      if (!Array.isArray(data.data)) {
        throw new Error("No data records found");
      }

      if (data.data.length === 0) {
        console.log("No data records found"); // Display error message
        return; // Exit the function
      }

      // For each record, insert to database
      for (const record of data.data) {
        await insertData(record);
        console.log("Success in ALL SESSIONS");
      }

      await connection.end();
      setTimeout(() => this.insertSessions(), 15 * 1000);
    } catch (error) {
      console.error(error);
      console.log("Failed");
    }
  }
}

const HeeringManager = new ApiManager(
  "Heering",
  "192.168.28.22",
  9419,
  "restapi",
  '-$$k9OKe2bOlC?$0"fBZ'
);

HeeringManager.insertRepositories();
HeeringManager.insertSessions();

const ProlazerManager = new ApiManager(
  "profilelazer",
  "fw-profilelaser.spdns.org",
  9419,
  "restapi",
  "UDVuaDUoPUO2dyLfVHof"
);

ProlazerManager.insertRepositories();
ProlazerManager.insertSessions();

const BearOptimarManager = new ApiManager(
  "BearOptima",
  "fw-bear.spdns.org",
  9419,
  "restapi",
  "DbVUTs8c2KGPSyF5pVrw"
);

BearOptimarManager.insertRepositories();
BearOptimarManager.insertSessions();