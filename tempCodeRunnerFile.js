import express from "express";
import mysql from "mysql2";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
const port = 3003;

app.use(cors());

// Database configuration
const dbConfig = {
  /* host: "10.0.11.196",
  user: "root",
  password: "Test@10!",
  database: "new_schema",
  */
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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

  query(query, callback) {
    this.pool.query(query, callback);
  }
}

const databaseManager = new DatabaseManager(dbConfig);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Routes
app.get("/repositories", getRepositories);
app.get("/sessions", getSessions);
app.get("/repositoriespro", getRepositoriesPro);
app.get("/sessionspro", getSessionsPro);
app.get("/repositoriesbear", getRepositoriesBear);
app.get("/sessionsbear", getSessionsBear);

function getRepositories(req, res) {
  const query = "SELECT * FROM repositories WHERE name IN ('HE-NAs01','NASA3')";

  databaseManager.query(query, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    console.log("Fetched data:", results);
    if (results.length === 0) {
      res.json({ message: "No data found." });
    } else {
      res.json(results);
    }
  });
}

function getSessions(req, res) {
  const query =
    "SELECT * FROM sessions WHERE name = 'hyper-v backup' ORDER BY endTime DESC LIMIT 3";

  databaseManager.query(query, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    if (results.length === 0) {
      res.json({ message: "No sessions found." });
    } else {
      const formattedResults = results.map((session) => ({
        ...session,
        name: session.name.toLowerCase(),
        endTime: formatDateTime(session.endTime),
      }));

      console.log("Fetched sessions:", formattedResults);
      res.json(formattedResults);
    }
  });
}

function getRepositoriesPro(req, res) {
  const query =
    "SELECT * FROM repositories WHERE name IN ('Profile Laser - NAS (Synology)', 'Synology NAS')";

  databaseManager.query(query, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    console.log("Fetched repositoriespro:", results);
    if (results.length === 0) {
      res.json({ message: "No data found." });
    } else {
      res.json(results);
    }
  });
}

function getSessionsPro(req, res) {
  const query =
    "SELECT * FROM sessions WHERE name = 'Backup HV01' ORDER BY endTime DESC LIMIT 3";

  databaseManager.query(query, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    if (results.length === 0) {
      res.json({ message: "No sessionspro found." });
    } else {
      const formattedResults = results.map((session) => ({
        ...session,
        name: session.name.toLowerCase(),
        endTime: formatDateTime(session.endTime),
      }));

      console.log("Fetched sessions:", formattedResults);
      res.json(formattedResults);
    }
  });
}

function getRepositoriesBear(req, res) {
  const query = "SELECT * FROM repositories WHERE name IN ('Bear-BACKUP')";

  databaseManager.query(query, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching bear." });
    }

    console.log("Fetched repositoriesbear:", results);
    if (results.length === 0) {
      res.json({ message: "No bear found." });
    } else {
      res.json(results);
    }
  });
}

function getSessionsBear(req, res) {
  const query =
    "SELECT * FROM sessions WHERE name = 'Back-up Bear-HV01' ORDER BY endTime DESC LIMIT 3";

  databaseManager.query(query, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }

    if (results.length === 0) {
      res.json({ message: "No sessionsbear found." });
    } else {
      const formattedResults = results.map((session) => ({
        ...session,
        name: session.name.toLowerCase(),
        endTime: formatDateTime(session.endTime),
      }));

      console.log("Fetched sessions:", formattedResults);
      res.json(formattedResults);
    }
  });
}

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Europe/Paris",
  };

  return date.toLocaleString("en-GB", options);
}

app.post("/company", saveCompany);

function saveCompany(req, res) {
  const { name, ip, port, veaamUsername, veaamPassword } = req.body;

  // Save the form data to the database
  const query = `INSERT INTO companies (name, ip, port, veaamUsername, veaamPassword) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, ip, port, veaamUsername, veaamPassword];

  databaseManager.query(query, values, (error, results) => {
    if (error) {
      console.error("Error executing INSERT query:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while saving company information." });
    }

    console.log("Company information saved successfully");
    res.json({ message: "Company information saved successfully" });
  });
}

/*
endpoints
http://localhost:3000/repositories
http://localhost:3000/backups
http://localhost:3000/jobs

 */
