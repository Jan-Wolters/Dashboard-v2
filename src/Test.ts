/*
import * as express from "express";
import * as mysql from "mysql2";
import * as cors from "cors";

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

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

const dbConfig: mysql.PoolOptions = {
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest",
  waitForConnections: true,
};

class DatabaseManager {
  pool: mysql.Pool;

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool(config);
    this.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to MySQL database:", err);
        return;
      }
      console.log("Connected to MySQL database!");
      connection.release();
    });
  }

  query<T>(query: string, values: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as T[]);
        }
      });
    });
  }
}

const databaseManager = new DatabaseManager(dbConfig);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get("/info", getInfo);
app.post("/companies", saveCompany);

async function getInfo(req: express.Request, res: express.Response) {
  try {
    const companyId = req.query.companyId as string;

    const companiesQuery = `
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
        companies.company_id = ?
      GROUP BY
        companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;`;

    const companiesRows: unknown[] = await databaseManager.query(companiesQuery, [
      companyId,
    ]);

    const repositoriesData: Company[] = [];
    if (Array.isArray(companiesRows)) {
      for (const companiesRow of companiesRows) {
        const company_id = (companiesRow as Record<string, unknown>).company_id as number;

        const repositoryIds = ((companiesRow as Record<string, unknown>).repository_ids as string).split(",");
        const repositoryNames = ((companiesRow as Record<string, unknown>).repository_names as string).split(",");
        const repositoryCapacities = ((companiesRow as Record<string, unknown>).repository_capacities as string).split(",");
        const repositoryFrees = ((companiesRow as Record<string, unknown>).repository_frees as string).split(",");
        const repositoryUsedSpaces = ((companiesRow as Record<string, unknown>).repository_usedSpaces as string).split(",");

        const repositories: Repository[] = repositoryIds.map((_, index) => ({
          repository_id: Number(repositoryIds[index]),
          repository_name: repositoryNames[index],
          repository_capacityGB: parseFloat(repositoryCapacities[index]),
          repository_freeGB: parseFloat(repositoryFrees[index]),
          repository_usedSpaceGB: parseFloat(repositoryUsedSpaces[index]),
        }));

        const session: Session = {
          session_id: (companiesRow as Record<string, unknown>).session_id as string,
          session_name: (companiesRow as Record<string, unknown>).session_name as string,
          session_endTime: (companiesRow as Record<string, unknown>).session_endTime as string,
          session_resultResult: (companiesRow as Record<string, unknown>).session_resultResult as string,
          session_resultMessage: (companiesRow as Record<string, unknown>).session_resultMessage as string,
        };

        const company: Company = {
          company_id,
          company_name: (companiesRow as Record<string, unknown>).company_name as string,
          repositories,
          sessions: [session],
        };

        repositoriesData.push(company);
      }
    } else {
      console.error("Invalid response from the database. Expected an array.");
      console.error("Response:", companiesRows);
      return res.status(500).json({ error: "An error occurred while fetching data." });
    }

    res.json(repositoriesData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

function saveCompany(req: express.Request, res: express.Response) {
  const { name, ip, port, veaamUsername, veaamPassword } = req.body;

  const query = `INSERT INTO companies (name, ip, port, veaamUsername, veaamPassword) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, ip, port, veaamUsername, veaamPassword];

  databaseManager
    .query(query, values)
    .then(() => {
      console.log("Company information saved successfully");
      res.json({ message: "Company information saved successfully" });
    })
    .catch((error) => {
      console.error("Error executing INSERT query:", error);
      res.status(500).json({ error: "An error occurred while saving company information." });
    });
}

import * as express from "express";
import * as mysql from "mysql2";
import * as cors from "cors";

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

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

const dbConfig: mysql.PoolOptions = {
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest",
  waitForConnections: true,
};

class DatabaseManager {
  pool: mysql.Pool;

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool(config);
    this.pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to MySQL database:", err);
        return;
      }
      console.log("Connected to MySQL database!");
      connection.release();
    });
  }

  query<T>(query: string, values: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as T[]);
        }
      });
    });
  }
}

const databaseManager = new DatabaseManager(dbConfig);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get("/info", getInfo);
app.post("/companies", saveCompany);

async function getInfo(req: express.Request, res: express.Response) {
  try {
    const companyId = req.query.companyId as string;

    const companiesQuery = `
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
        companies.company_id = ?
      GROUP BY
        companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;`;

    const companiesRows: unknown[] = await databaseManager.query(companiesQuery, [
      companyId,
    ]);

    if (Array.isArray(companiesRows) && companiesRows.length > 0) {
      const companiesData: Company[] = [];

      for (const companiesRow of companiesRows) {
        const company_id = (companiesRow as Record<string, unknown>).company_id as number;

        const repositoryIds = ((companiesRow as Record<string, unknown>).repository_ids as string).split(",");
        const repositoryNames = ((companiesRow as Record<string, unknown>).repository_names as string).split(",");
        const repositoryCapacities = ((companiesRow as Record<string, unknown>).repository_capacities as string).split(",");
        const repositoryFrees = ((companiesRow as Record<string, unknown>).repository_frees as string).split(",");
        const repositoryUsedSpaces = ((companiesRow as Record<string, unknown>).repository_usedSpaces as string).split(",");

        const repositories: Repository[] = repositoryIds.map((_, index) => ({
          repository_id: Number(repositoryIds[index]),
          repository_name: repositoryNames[index],
          repository_capacityGB: parseFloat(repositoryCapacities[index]),
          repository_freeGB: parseFloat(repositoryFrees[index]),
          repository_usedSpaceGB: parseFloat(repositoryUsedSpaces[index]),
        }));

        const session: Session = {
          session_id: (companiesRow as Record<string, unknown>).session_id as string,
          session_name: (companiesRow as Record<string, unknown>).session_name as string,
          session_endTime: (companiesRow as Record<string, unknown>).session_endTime as string,
          session_resultResult: (companiesRow as Record<string, unknown>).session_resultResult as string,
          session_resultMessage: (companiesRow as Record<string, unknown>).session_resultMessage as string,
        };

        const company: Company = {
          company_id,
          company_name: (companiesRow as Record<string, unknown>).company_name as string,
          repositories,
          sessions: [session],
        };

        companiesData.push(company);
      }

      console.log("Companies data:", companiesData);
      res.json(companiesData);
    } else {
      console.error("Invalid response from the database. Expected an array.");
      console.error("Response:", companiesRows);
      return res.status(500).json({ error: "An error occurred while fetching data." });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

function saveCompany(req: express.Request, res: express.Response) {
  const { name, ip, port, veaamUsername, veaamPassword } = req.body;

  const query = `INSERT INTO companies (name, ip, port, veaamUsername, veaamPassword) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, ip, port, veaamUsername, veaamPassword];

  databaseManager
    .query(query, values)
    .then(() => {
      console.log("Company information saved successfully");
      res.json({ message: "Company information saved successfully" });
    })
    .catch((error) => {
      console.error("Error executing INSERT query:", error);
      res.status(500).json({ error: "An error occurred while saving company information." });
    });
}*/



import { DBManager } from "./DBmaneger";