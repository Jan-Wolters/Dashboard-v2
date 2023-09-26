import express from "express";
import { json } from "express";
import { createPool } from "mysql2";
import cors from "cors";
import { exec } from "child_process";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { useNavigate } from "react-router-dom"; // Import useNavigate for client-side routing

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the .env file using the current module's directory
const dotenvPath = path.resolve(__dirname, ".env");

// Load environment variables from the .env file
dotenv.config({ path: dotenvPath });

const app = express();
const port = 3008;
let scriptCount = 0;
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

// Function Declarations
function runScript() {
  function onScriptExit(error, stdout, stderr) {
    if (error) {
      console.error(`Error executing script: ${error}`);
    }
    console.log(`Script output: ${stdout}`);
    console.error(`Script error: ${stderr}`);

    // Increment the script count
    scriptCount++;
    console.log(`Script count: ${scriptCount}`);

    // Set the delay for the next run (10 minutes)
    const delayInMilliseconds = parseInt(100 * 60 * 1000);

    // Call the runScript function again after the delay
    setTimeout(runScript, delayInMilliseconds);
  }

  exec(`node ${scriptPath}`, onScriptExit);
}
app.use(
  session({
    secret: "y", // Replace with a secure secret
    resave: false,
    saveUninitialized: false,
    // Add any other session configuration options as needed
  })
);

// Routes
app.get("/info", getInfo);
app.get("/infocon", getInfoCon);
app.delete("/companies/:companyId", deleteCompany);
app.post("/companies", saveCompany);
app.post("/login", login);

async function getInfo(req, res) {
  try {
    const companyId = req.query.companyId;

    // Your SQL query here...
    const combinedQuery = `
      SELECT
        'Session' AS record_type,
        s.id AS record_id,
        s.company_id AS company_id,
        c.name AS company_name,
        s.name AS record_name,
        s.activityID AS record_activityID,
        s.sessionType AS record_sessionType,
        s.creationTime AS record_creationTime,
        s.endTime AS record_endTime,
        s.state AS record_state,
        s.progressPercent AS record_progressPercent,
        s.resultResult AS record_resultResult,
        s.resultMessage AS record_resultMessage,
        s.resultIsCanceled AS record_resultIsCanceled,
        s.resourceId AS record_resourceId,
        s.resourceReference AS record_resourceReference,
        s.parentSessionId AS record_parentSessionId,
        s.usn AS record_usn,
        NULL AS repository_id,
        NULL AS repository_name,
        NULL AS repository_type,
        NULL AS repository_description,
        NULL AS repository_hostId,
        NULL AS repository_hostName,
        NULL AS repository_path,
        NULL AS repository_capacityGB,
        NULL AS repository_freeGB,
        NULL AS repository_usedSpaceGB
      FROM
        sessions s
      INNER JOIN
        companies c ON s.company_id = c.company_id
      WHERE
        s.company_id = s.company_id
      UNION ALL
      SELECT
        'Repository' AS record_type,
        NULL AS record_id,
        r.company_id AS company_id,
        c.name AS company_name,
        NULL AS record_name,
        NULL AS record_activityID,
        NULL AS record_sessionType,
        NULL AS record_creationTime,
        NULL AS record_endTime,
        NULL AS record_state,
        NULL AS record_progressPercent,
        NULL AS record_resultResult,
        NULL AS record_resultMessage,
        NULL AS record_resultIsCanceled,
        NULL AS record_resourceId,
        NULL AS record_resourceReference,
        NULL AS record_parentSessionId,
        NULL AS record_usn,
        r.id AS repository_id,
        r.name AS repository_name,
        r.type AS repository_type,
        r.description AS repository_description,
        r.hostId AS repository_hostId,
        r.hostName AS repository_hostName,
        r.path AS repository_path,
        r.capacityGB AS repository_capacityGB,
        r.freeGB AS repository_freeGB,
        r.usedSpaceGB AS repository_usedSpaceGB
      FROM
        repositories r
      INNER JOIN
        companies c ON r.company_id = c.company_id
      WHERE
        r.company_id = r.company_id
    `;

    const combinedRows = await databaseManager.query(combinedQuery, [
      companyId,
      companyId,
    ]);

    if (Array.isArray(combinedRows)) {
      // Create a map to store companies grouped by company_id and company_name
      const companiesMap = new Map();

      for (const combinedRow of combinedRows) {
        const company_id = combinedRow.company_id;
        const company_name = combinedRow.company_name;

        // Check if the company_id is already in the map; if not, add it
        if (!companiesMap.has(company_id)) {
          companiesMap.set(company_id, {
            company_id,
            company_name,
            repositories: [],
            sessions: [],
          });
        }

        const currentCompany = companiesMap.get(company_id);

        // Determine if the row is a "Session" or "Repository" based on recordType
        if (combinedRow.record_type === "Session") {
          // Process and add session-related data to the current company
          const sessionData = {
            session_id: combinedRow.record_id,
            session_name: combinedRow.record_name,
            session_endTime: combinedRow.record_endTime,
            session_resultResult: combinedRow.record_resultResult,
            session_resultMessage: combinedRow.record_resultMessage,
          };
          currentCompany.sessions.push(sessionData);
        } else if (combinedRow.record_type === "Repository") {
          // Process and add repository-related data to the current company
          const repositoryData = {
            repository_id: combinedRow.repository_id,
            repository_name: combinedRow.repository_name,
            repository_type: combinedRow.repository_type,
            repository_description: combinedRow.repository_description,
            repository_hostId: combinedRow.repository_hostId,
            repository_hostName: combinedRow.repository_hostName,
            repository_path: combinedRow.repository_path,
            repository_capacityGB: combinedRow.repository_capacityGB,
            repository_freeGB: combinedRow.repository_freeGB,
            repository_usedSpaceGB: combinedRow.repository_usedSpaceGB,
          };
          currentCompany.repositories.push(repositoryData);
        }
      }

      // Sort sessions within each company by endTime (newest to latest)
      companiesMap.forEach((company) => {
        company.sessions.sort(
          (a, b) => new Date(b.session_endTime) - new Date(a.session_endTime)
        );
      });

      // Convert the map values (grouped companies) to an array
      const repositoriesData = [...companiesMap.values()];

      // Send the grouped data as a JSON response
      res.json(repositoriesData);
    } else {
      console.error("Invalid response from the database. Expected an array.");
      console.error("Response:", combinedRows);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
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

    // Check if the user exists in the database
    const userQuery = "SELECT * FROM users WHERE Username = ?";
    const userRows = await databaseManager.query(userQuery, [username]);

    if (userRows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = userRows[0];

    // Check if the password matches (You should hash and salt the passwords in production)
    if (password !== user.Password) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Successful login
    // Set session properties
    req.session.isloggedIn = true;
    req.session.user = user; // Store user information in the session if needed

    // Send a JSON response indicating a successful login
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred while logging in." });
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

// Set script path and start the initial run
const scriptPath = "src/controller/veaam/ApiCon.mjs"; // Replace with the actual path

console.log("Starting ApiCon.js...");

runScript(); // Start the initial run without any delay

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
