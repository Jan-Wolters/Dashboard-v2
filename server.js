import { createConnection } from "mysql2/promise";
import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest",
  waitForConnections: true,
};

// Database manager
class DatabaseManager {
  pool;

  constructor(config) {
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

  query(query, values = []) {
    return new Promise((resolve, reject) => {
      this.pool.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}

const databaseManager = new DatabaseManager(dbConfig);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Routes
app.get("/info", getInfo);

app.post("/companies", saveCompany);

async function getInfo(req, res) {
  try {
    const companyId = req.query.companyId;

    const companiesQuery = `
    SELECT DISTINCT
  companies.company_id AS company_id,
  companies.name AS company_name,
  repositories.name AS repository_name,
  repositories.capacityGB AS repository_capacityGB,
  repositories.freeGB AS repository_freeGB,
  repositories.usedSpaceGB AS repository_usedSpaceGB,
  sessions.name AS session_name,
  sessions.endTime AS session_endTime,
  sessions.resultResult AS session_resultResult,
  sessions.resultMessage AS session_resultMessage
FROM
  companies
JOIN
  repositories ON companies.company_id = repositories.company_id
LEFT JOIN
  sessions ON companies.company_id = sessions.company_id
WHERE
      companies.company_id =  companies.company_id`;

    console.log("companiesQuery:", companiesQuery);
    const companiesRows = await databaseManager.query(companiesQuery, [
      companyId,
    ]);
    console.log("companiesRows:", companiesRows);

    const repositoriesData = [];
    if (Array.isArray(companiesRows)) {
      for (const companiesRow of companiesRows) {
        const companyId = companiesRow.company_id;

        const query = `
          SELECT
            companies.company_id AS company_id,
            companies.name AS company_name,
            repositories.name AS repository_name,
            repositories.capacityGB AS repository_capacityGB,
            repositories.freeGB AS repository_freeGB,
            repositories.usedSpaceGB AS repository_usedSpaceGB,
            sessions.name AS session_name,
            sessions.endTime AS session_endTime,
            sessions.resultResult AS session_resultResult,
            sessions.resultMessage AS session_resultMessage
          FROM
            companies
          JOIN
            repositories ON companies.company_id = repositories.company_id
          LEFT JOIN
            sessions ON companies.company_id = sessions.company_id
          WHERE
            companies.company_id =  ?`;

        console.log("query:", query);
        const [rows] = await databaseManager.query(query, [companyId]);
        console.log("rows:", rows);

        if (Array.isArray(rows)) {
          for (const row of rows) {
            repositoriesData.push(row);
          }
        } else {
          repositoriesData.push(rows); // Push the single row as an array element
        }
      }
    } else {
      console.error("Invalid response from the database. Expected an array.");
      console.error("Response:", companiesRows); // Log the response
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    res.json(repositoriesData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

function saveCompany(req, res) {
  const { name, ip, port, veaamUsername, veaamPassword } = req.body;

  // Save the form data to the database
  const query = `INSERT INTO companies (name, ip, port, veaamUsername, veaamPassword) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, ip, port, veaamUsername, veaamPassword];

  databaseManager
    .query(query, values)
    .then((results) => {
      console.log("Company information saved successfully");
      res.json({ message: "Company information saved successfully" });
    })
    .catch((error) => {
      console.error("Error executing INSERT query:", error);
      res
        .status(500)
        .json({ error: "An error occurred while saving company information." });
    });
}
