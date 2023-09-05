import axios, { AxiosRequestConfig } from "axios";
import { createConnection, ConnectionOptions } from "mysql2/promise";
import { Company } from "./peter.ts";

const processEnv = process.env as { [key: string]: string };
processEnv["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // Disable certificate verification

class AccessTokenManager {
  private serverURL: string;
  private port: number;
  private username: string;
  private password: string;
  private access_token: string | null;
  private refresh_token: string | null;
  private tokenExpiryTime: number | null;

  constructor(serverURL: string, port: number, username: string, password: string) {
    this.serverURL = serverURL;
    this.port = port;
    this.username = username;
    this.password = password;
    this.access_token = null;
    this.refresh_token = null;
    this.tokenExpiryTime = null;
  }

  async fetchAccessToken(): Promise<void> {
    const requestData = {
      grant_type: "password",
      username: this.username,
      password: this.password,
    };

    const response = await axios.post(`https://${this.serverURL}:${this.port}/api/oauth2/token`, requestData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "1.0-rev1",
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch access token");
    }

    const data = response.data;

    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    this.tokenExpiryTime = new Date().getTime() + data.expires_in * 1000;
    console.log(`Access token refreshed: Bearer ${this.access_token}`);
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.access_token || this.tokenExpiryTime <= new Date().getTime()) {
      await this.fetchAccessToken();
    }
    return this.access_token;
  }
}

const main = async () => {
  try {
    const company = new Company();
    const companies = await company.getCompanies();

    for (const companyData of companies) {
      const manager = new AccessTokenManager(
        companyData.serverURL,
        companyData.port,
        companyData.username,
        companyData.password
      );

      const accessToken = await manager.getAccessToken();

      const headers: AxiosRequestConfig["headers"] = {
        Accept: "application/json",
        "x-api-version": "1.0-rev1",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(companyData.apiUrl, {
        headers: headers,
        httpsAgent: new (await import("https")).Agent({ rejectUnauthorized: false }), // Ignore self-signed certificate
      });

      if (response.status !== 200) {
        throw new Error("Error fetching JSON data from the API");
      }

      const data = response.data;

      // Establish a connection to the MySQL database
      const connection = await createConnection(companyData.databaseOptions);

      // Example: Insert data into a MySQL database
      const insertData = async (record: any) => {
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
        console.log("Inserted record:", record);
      }

      console.log(`Success - ${companyData.name}`);
      await connection.end();
    }
  } catch (error) {
    console.error(error);
    console.log("Failed");
  }
};

main();