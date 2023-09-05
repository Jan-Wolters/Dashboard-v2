import axios from 'axios';
import { DBManager } from './DB';
import { Company } from './Company';

export class Repository {
  constructor(public company: Company) {
    // Initialize sessions related properties or functionality
  }

  private async fetchRepositoriesData(): Promise<any> {
    const accessToken = await this.company.getToken();

    const headers = {
      Accept: "application/json",
      "x-api-version": "1.0-rev1",
      Authorization: `Bearer ${accessToken}`,
    };

    const repositoriesApiUrl = `https://${this.company.url}:${this.company.port}/api/v1/backupInfrastructure/repositories/states`; // Replace with the actual API URL

    const response = await axios.get(repositoriesApiUrl, {
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

  public async insertRepositoriesData(): Promise<void> {
    try {
      const repositoriesData = await this.fetchRepositoriesData();

      const dbConnection = await DBManager.getDatabase();
      const insertPromises = repositoriesData.map(async (repository: any) => {
        const { id, type, name, description, hostId, hostName, path, capacityGB, freeGB, usedSpaceGB } = repository;
        const insertQuery = `INSERT INTO repositories(company_id, id, type, name, description, hostId, hostName, path, capacityGB, freeGB, usedSpaceGB)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await dbConnection.query(insertQuery, [this.company.company_id, id, type, name, description, hostId, hostName, path, capacityGB, freeGB, usedSpaceGB]);
      });
      await Promise.all(insertPromises);

      dbConnection.end();
    } catch (error) {
      console.error("Error inserting repositories data:", error);
      throw error;
    }
  }
}



