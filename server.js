import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const port = 3003;

app.use(cors());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database!");
  connection.release();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get("/repositories", (req, res) => {
  const query = "SELECT * FROM repositories WHERE name IN ('HE-NAs01','NASA3')";

  pool.query(query, (error, results) => {
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
});

app.get("/sessions", (req, res) => {
  const query =
    "SELECT * FROM sessions WHERE name = 'hyper-v backup' ORDER BY endTime DESC LIMIT 3";

  pool.query(query, (error, results) => {
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
        endTime: new Date(session.endTime).toLocaleString(),
      }));

      console.log("Fetched sessions:", formattedResults);
      res.json(formattedResults);
    }
  });
});

app.get("/repositoriespro", (req, res) => {
  const query =
    "SELECT * FROM repositories WHERE name IN ('Profile Laser - NAS (Synology)', 'Synology NAS')";

  pool.query(query, (error, results) => {
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
});

app.get("/sessionspro", (req, res) => {
  const query =
    "SELECT * FROM sessions WHERE name = 'Backup HV01' ORDER BY endTime DESC LIMIT 3";

  pool.query(query, (error, results) => {
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
        endTime: new Date(session.endTime).toLocaleString(),
      }));

      console.log("Fetched sessions:", formattedResults);
      res.json(formattedResults);
    }
  });
});

app.get("/repositoriesbear", (req, res) => {
  const query = "SELECT * FROM repositories WHERE name IN ('Bear-BACKUP')";

  pool.query(query, (error, results) => {
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
});

app.get("/sessionsbear", (req, res) => {
  const query =
    "SELECT * FROM sessions WHERE name = 'Back-up Bear-HV01' ORDER BY endTime DESC LIMIT 3";

  pool.query(query, (error, results) => {
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
        endTime: new Date(session.endTime).toLocaleString(),
      }));

      console.log("Fetched sessions:", formattedResults);
      res.json(formattedResults);
    }
  });
});

/* endpoints
http://localhost:3000/repositories
http://localhost:3000/backups
http://localhost:3000/jobs

 */
