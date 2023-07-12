import fetch, { Headers } from "node-fetch";
import { createConnection } from "mysql2/promise";

class ApiManager {
  private companyname: string;
  private serverURL: string;
  private port: number;
  private username: string;
  private password: string;
  private access_token: string | null;
  private refresh_token: string | null;
  private tokenExpiryTime: number | null;

  constructor(
    companyname: string,
    serverURL: string,
    port: number,
    username: string,
    password: string
  ) {
    this.companyname = companyname;
    this.serverURL = serverURL;
    this.port = port;
    this.username = username;
    this.password = password;
    this.access_token = null;
    this.refresh_token = null;
    this.tokenExpiryTime = null;
  }

  private async fetchAccessToken(): Promise<void> {
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

  private async getAccessToken(): Promise<string | null> {
    if (!this.access_token || this.tokenExpiryTime <= new Date().getTime()) {
      await this.fetchAccessToken();
    }
    return this.access_token;
  }

  public async insertRepositories(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const headers: Headers = new Headers({
        Accept: "application/json",
        "x-api-version": "1.0-rev1",
        Authorization: `Bearer ${accessToken}`,
      });

      const response = await fetch(
        `https://${this.serverURL}:${this.port}/api/v1/backupInfrastructure/repositories/states`,
        {
          headers: headers,
          agent: new (await import("https")).Agent({
            rejectUnauthorized: false, // Ignore self-signed certificate
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching JSON data from the API");
      }

      const data = await response.json();

      // Establish a connection to the MySQL database
      const connection = await createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "hallotest",
      });

      // Insert data, values are in order same as API provides it back.
      const insertData = async (record: Record<string, any>): Promise<void> => {
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

  public async insertSessions(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const headers: Headers = new Headers({
        Accept: "application/json",
        "x-api-version": "1.0-rev1",
        Authorization: `Bearer ${accessToken}`,
      });

      const response = await fetch(
        `https://${this.serverURL}:${this.port}/api/v1/sessions?limit=5`,
        {
          headers: headers,
          agent: new (await import("https")).Agent({
            rejectUnauthorized: false, // Ignore self-signed certificate
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching JSON data from the API");
      }

      const data = await response.json();

      // Establish a connection to the MySQL database
      const connection = await createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "hallotest",
      });

      // Insert data, values are in order same as API provides it back.
      // Result is null till progressPercent is 100!
      const insertData = async (record: Record<string, any>): Promise<void> => {
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

// Retrieve company information from server.ts
import { companyInfo } from "./server.ts";

const HeeringManager = new ApiManager(
  companyInfo.heering.name,
  companyInfo.heering.serverURL,
  companyInfo.heering.port,
  companyInfo.heering.username,
  companyInfo.heering.password
);

HeeringManager.insertRepositories();
HeeringManager.insertSessions();

const ProlazerManager = new ApiManager(
  companyInfo.prolazer.name,
  companyInfo.prolazer.serverURL,
  companyInfo.prolazer.port,
  companyInfo.prolazer.username,
  companyInfo.prolazer.password
);

ProlazerManager.insertRepositories();
ProlazerManager.insertSessions();

const BearOptimarManager = new ApiManager(
  companyInfo.bearOptima.name,
  companyInfo.bearOptima.serverURL,
  companyInfo.bearOptima.port,
  companyInfo.bearOptima.username,
  companyInfo.bearOptima.password
);

BearOptimarManager.insertRepositories();
BearOptimarManager.insertSessions();