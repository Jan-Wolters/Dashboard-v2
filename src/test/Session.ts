import axios from 'axios';
import { DBManager } from './DB';
import { Company } from './Company';

export class Session {
  constructor(public company: Company) {
    // Initialize sessions related properties or functionality
  }

  private async fetchSessionsData(): Promise<any> {
    const accessToken = await this.company.getToken();

    const headers = {
      Accept: "application/json",
      "x-api-version": "1.0-rev1",
      Authorization: `Bearer ${accessToken}`,
    };

    const sessionApiUrl = `https://${this.company.url}:${this.company.port}/sessions`; // Replace with the actual API URL

    const response = await axios.get(sessionApiUrl, {
      headers: headers,
      httpsAgent: new (await import("https")).Agent({
        rejectUnauthorized: false,
      }), // Ignore self-signed certificate
    });

    if (!response.status === 200) {
      throw new Error("Error fetching JSON data from the API");
    }

    const data = response.data;
    return data;
  }

  public async insertSessionsData(): Promise<void> {
    try {
      const sessionsData = await this.fetchSessionsData();

      const dbConnection = await DBManager.getDatabase();
      const insertPromises = sessionsData.map(async (session: any) => {
        const { id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn } = session;
        const insertQuery = `INSERT INTO sessions (id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await dbConnection.query(insertQuery, [this.company.company_id, id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn]);
      });
      await Promise.all(insertPromises);

      dbConnection.end();
    } catch (error) {
      console.error("Error inserting sessions data:", error);
      throw error;
    }
  }
}