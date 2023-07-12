
/*
import { createConnection, ConnectionOptions } from 'mysql2/promise';

export class DBManager {
  private static instance: DBManager | null = null;
  private readonly databaseInfo: {
    [databaseID: number]: { host: string, user: string, password: string, database: string };
  } = {
    1: {
      host: "localhost",
      user: "root",
      password: "",
      database: "hallotest"
    }
  };

  private constructor() {}

  public static async getDatabase() {
    if (!this.instance) {
      this.instance = new DBManager();
    }
    try {
      return await this.instance.connectDatabase();
    } catch (e) {
      console.warn("Fail Database Connection");
      throw e;
    }
  }

  private async connectDatabase() {
    const access: ConnectionOptions = this.databaseInfo[1];

    try {
      return createConnection(access);
    } catch (e) {
      throw e;
    }
  }
}

async function testConnection() {
  try {
    const dbConnection = await DBManager.getDatabase();
    // Use the connection to perform database operations

    // For example, execute a sample query
    const [rows] = await dbConnection.query(`
    SELECT
      companies.company_id AS company_id,
      companies.name AS company_name,
      GROUP_CONCAT(DISTINCT repositories.id) AS repository_ids,
      GROUP_CONCAT(DISTINCT repositories.name) AS repository_names,
      GROUP_CONCAT(repositories.capacityGB) AS repository_capacities,
      GROUP_CONCAT(repositories.freeGB) AS repository_frees,
      GROUP_CONCAT(repositories.usedSpaceGB) AS repository_usedSpaces,
      latest_session.session_name AS session_name,
      latest_session.session_endTime AS session_endTime,
      latest_session.session_resultResult AS session_resultResult,
      latest_session.session_resultMessage AS session_resultMessage
    FROM
      companies
    JOIN
      repositories ON companies.company_id = repositories.company_id
    LEFT JOIN (
      SELECT
        sessions.company_id,
        sessions.name AS session_name,
        sessions.endTime AS session_endTime,
        sessions.resultResult AS session_resultResult,
        sessions.resultMessage AS session_resultMessage
      FROM
        sessions
      INNER JOIN (
        SELECT
          company_id,
          MAX(endTime) AS max_endTime
        FROM
          sessions
        GROUP BY
          company_id
      ) AS latest ON sessions.company_id = latest.company_id AND sessions.endTime = latest.max_endTime
    ) AS latest_session ON companies.company_id = latest_session.company_id
    WHERE
      companies.company_id = companies.company_id
    GROUP BY
      companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;`);
    console.log('Query results:', rows);

    // Remember to close the connection when done
    dbConnection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection(); 

*/
import { createConnection, ConnectionOptions, RowDataPacket } from 'mysql2/promise';

interface Repository {
  repository_id: number;
  repository_name: string;
  repository_capacityGB: number;
  repository_freeGB: number;
  repository_usedSpaceGB: number;
}

interface Session {
  session_id: string;
  session_name: string;
  session_endTime: string;
  session_resultResult: string;
  session_resultMessage: string;
}

interface Company {
  company_id: number;
  company_name: string;
  repositories: Repository[];
  sessions: Session[];
}

export class DBManager {
  private static instance: DBManager | null = null;
  private readonly databaseInfo: {
    [databaseID: number]: { host: string, user: string, password: string, database: string };
  } = {
    1: {
      host: "localhost",
      user: "root",
      password: "",
      database: "hallotest"
    }
  };

  private constructor() {}

  public static async getDatabase() {
    if (!this.instance) {
      this.instance = new DBManager();
    }
    try {
      return await this.instance.connectDatabase();
    } catch (e) {
      console.warn("Fail Database Connection");
      throw e;
    }
  }

  private async connectDatabase() {
    const access: ConnectionOptions = this.databaseInfo[1];

    try {
      return createConnection(access);
    } catch (e) {
      throw e;
    }
  }

  public async getCompanyData(companyId: string): Promise<Company[]> {
    const dbConnection = await DBManager.getDatabase();

    const query = `
      SELECT
        companies.company_id AS company_id,
        companies.name AS company_name,
        GROUP_CONCAT(DISTINCT repositories.id) AS repository_ids,
        GROUP_CONCAT(DISTINCT repositories.name) AS repository_names,
        GROUP_CONCAT(repositories.capacityGB) AS repository_capacities,
        GROUP_CONCAT(repositories.freeGB) AS repository_frees,
        GROUP_CONCAT(repositories.usedSpaceGB) AS repository_usedSpaces,
        latest_session.session_name AS session_name,
        latest_session.session_endTime AS session_endTime,
        latest_session.session_resultResult AS session_resultResult,
        latest_session.session_resultMessage AS session_resultMessage
      FROM
        companies
      JOIN
        repositories ON companies.company_id = repositories.company_id
      LEFT JOIN (
        SELECT
          sessions.company_id,
          sessions.name AS session_name,
          sessions.endTime AS session_endTime,
          sessions.resultResult AS session_resultResult,
          sessions.resultMessage AS session_resultMessage
        FROM
          sessions
        INNER JOIN (
          SELECT
            company_id,
            MAX(endTime) AS max_endTime
          FROM
            sessions
          GROUP BY
            company_id
        ) AS latest ON sessions.company_id = latest.company_id AND sessions.endTime = latest.max_endTime
      ) AS latest_session ON companies.company_id = latest_session.company_id
      WHERE
        companies.company_id = companies.company_id
      GROUP BY
        companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;`;

    try {
      const [rows] = await dbConnection.query<RowDataPacket[]>(query, [companyId]);
      dbConnection.end();

      const repositoriesData: Company[] = [];
      if (Array.isArray(rows)) {
        for (const row of rows) {
          const company_id = row.company_id as number;

          const repositoryIds = (row.repository_ids as string).split(",");
          const repositoryNames = (row.repository_names as string).split(",");
          const repositoryCapacities = (row.repository_capacities as string).split(",");
          const repositoryFrees = (row.repository_frees as string).split(",");
          const repositoryUsedSpaces = (row.repository_usedSpaces as string).split(",");

          const repositories: Repository[] = repositoryIds.map((_, index) => ({
            repository_id: Number(repositoryIds[index]),
            repository_name: repositoryNames[index],
            repository_capacityGB: parseFloat(repositoryCapacities[index]),
            repository_freeGB: parseFloat(repositoryFrees[index]),
            repository_usedSpaceGB: parseFloat(repositoryUsedSpaces[index]),
          }));

          const session: Session = {
            session_id: row.session_id as string,
            session_name: row.session_name as string,
            session_endTime: row.session_endTime as string,
            session_resultResult: row.session_resultResult as string,
            session_resultMessage: row.session_resultMessage as string,
          };

          const company: Company = {
            company_id,
            company_name: row.company_name as string,
            repositories,
            sessions: [session],
          };

          repositoriesData.push(company);
        }
      } else {
        console.error("Invalid response from the database. Expected an array.");
        throw new Error("An error occurred while fetching data.");
      }

      return repositoriesData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("An error occurred while fetching data.");
    }
  }
}

async function testConnection() {
  try {
    const dbManager = new DBManager();
    const company_Id = ''; // Replace with the desired company ID
    const companyData = await dbManager.getCompanyData(company_Id);
    console.log('Company data:', companyData);
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();