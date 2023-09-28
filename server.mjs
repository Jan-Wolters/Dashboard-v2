/* eslint-env node */
import express from "express";
import { json } from "express";
import { createPool } from "mysql2";
import cors from "cors";

import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { setUpVeeam } from "./ApiCon.mjs";
await setUpVeeam();
setInterval(() => {
  setUpVeeam();
}, 5000);
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the .env file using the current module's directory
const dotenvPath = path.resolve(__dirname, ".env");

// Load environment variables from the .env file
dotenv.config({ path: dotenvPath });

const app = express();
const port = 3008;

app.use(cors());
app.use(json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Database manager
class DatabaseManager {
  pool;

  constructor(config) {
    this.pool = createPool(config);
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

app.use(async (req, res, next) => {
  console.time(req.url);
  next();
  req.on("end", () => console.timeEnd(req.url));
});

// Routes
app.get("/info", getInfo);
app.get("/infocon", getInfoCon);
app.delete("/companies/:companyId", deleteCompany);
app.post("/companies", saveCompany);
app.post("/login", login);

async function getInfo(req, res) {
  const companies = await getCompanies();

  const rows = await Promise.all(
    companies.map(async (company) => {
      company.sessions = await getSessions(company.company_id);
      company.repositories = await getRepos(company.company_id);
      return company;
    })
  );

  res.send(rows);
}

async function getCompanies() {
  const companyQuery = `SELECT * FROM companies`;
  return databaseManager.query(companyQuery);
}

async function getSessions(companyId) {
  const sessionsQuery = `SELECT * FROM sessions WHERE company_id = ${companyId} ORDER BY endTime DESC;`;
  return databaseManager.query(sessionsQuery);
}

async function getRepos(companyId) {
  const reposQuery = `SELECT * FROM repositories WHERE company_id = ${companyId}`;
  return databaseManager.query(reposQuery);
}

async function getInfoCon(req, res) {
  try {
    const companieQuery = `
    SELECT
    company_id,
    name AS company_name,
    ip AS company_ip,
    port AS company_port,
    veaamUsername,
    veaamPassword
  FROM companies
    `;

    const companieRows = await databaseManager.query(companieQuery);

    if (Array.isArray(companieRows) && companieRows.length > 0) {
      const companiesData = companieRows.map((companyRow) => ({
        company_id: companyRow.company_id,
        company_name: companyRow.company_name,
        company_ip: companyRow.company_ip,
        company_port: companyRow.company_port,
        veaamUsername: companyRow.veaamUsername,
        veaamPassword: companyRow.veaamPassword,
      }));

      console.log("Companies Data:", companiesData); // Log the company data

      res.json(companiesData);
    } else {
      console.error(
        "No companies found or invalid response from the database."
      );
      return res.status(404).json({
        error: "No companies found or an error occurred while fetching data.",
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    // Query the database to retrieve user credentials
    const userQuery = "SELECT * FROM users WHERE Username = ?";
    const userRows = await databaseManager.query(userQuery, [username]);

    // Check if the user exists
    if (userRows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = userRows[0];

    // Debugging: Print the retrieved user data
    console.log("Retrieved user:", user);

    // Compare the provided password with the hashed password from the database
    if (password !== user.Password) {
      // Debugging: Print the password comparison result
      console.log("Password comparison failed");
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Successful login
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ error: "An error occurred while logging in." });
  }
}

console.log("Starting ApiCon.js...");

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

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

function deleteCompany(req, res) {
  const companyId = req.params.companyId; // Assuming companyId is part of the request parameters

  // Define SQL queries to delete related records from other tables
  const deleteCompanyQuery = `DELETE FROM companies WHERE company_id = ?`;
  const deleteRepositoriesQuery = `DELETE FROM repositories WHERE company_id = ?`;
  const deleteSessionsQuery = `DELETE FROM sessions WHERE company_id = ?`;

  // Start a database transaction
  databaseManager.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the company." });
      return;
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        res
          .status(500)
          .json({ error: "An error occurred while deleting the company." });
        connection.release();
        return;
      }

      // Execute queries in a transaction
      connection.query(deleteCompanyQuery, [companyId], (err, results) => {
        if (err) {
          console.error("Error deleting company:", err);
          connection.rollback(() => {
            connection.release();
            res
              .status(500)
              .json({ error: "An error occurred while deleting the company." });
          });
          return;
        }

        // Check if any rows were deleted from the company table
        if (results.affectedRows === 0) {
          connection.rollback(() => {
            connection.release();
            res
              .status(404)
              .json({ error: "Company not found or already deleted" });
          });
          return;
        }

        // Continue with deleting related records
        connection.query(deleteRepositoriesQuery, [companyId], (err) => {
          if (err) {
            console.error("Error deleting repositories:", err);
            connection.rollback(() => {
              connection.release();
              res.status(500).json({
                error: "An error occurred while deleting the company.",
              });
            });
            return;
          }

          connection.query(deleteSessionsQuery, [companyId], (err) => {
            if (err) {
              console.error("Error deleting sessions:", err);
              connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: "An error occurred while deleting the company.",
                });
              });
              return;
            }

            // Commit the transaction if all queries were successful
            connection.commit((err) => {
              if (err) {
                console.error("Error committing transaction:", err);
                connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    error: "An error occurred while deleting the company.",
                  });
                });
                return;
              }

              console.log("Company and related data deleted successfully");
              res.json({
                message: "Company and related data deleted successfully",
              });

              // Release the database connection
              connection.release();
            });
          });
        });
      });
    });
  });
}
