import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const port = 3002;

app.use(cors()); // Enable CORS

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest" /*
  host: "10.0.11.196",
  user: "root",
  password: "Test@10!",
  database: "new_schema",*/,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database!");

  // Release the connection
  connection.release();
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Define a route
app.get("/repositories", (req, res) => {
  pool.query(
    "SELECT * FROM repositories where name IN ('HE-NAs01','NASA3') ",
    (error, results) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data." });
        return;
      }
      console.log("Fetched data:", results); // Log the fetched data

      if (results.length === 0) {
        res.json({ message: "No data found." });
      } else {
        res.json(results); // Send data as a JSON response
      }
    }
  );
});

app.get("/sessions", (req, res) => {
  pool.query(
    "SELECT * FROM sessions WHERE name = 'hyper-v backup' ORDER BY endTime DESC LIMIT 5 ",
    (error, results) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data." });
        return;
      }

      if (results.length === 0) {
        res.json({ message: "No sessions found." });
      } else {
        const formattedResults = results.map((session) => ({
          ...session,
          name: session.name.toLowerCase(), // Format the name to lowercase
          endTime: new Date(session.endTime).toLocaleString(), // Format the date and time
        }));

        console.log("Fetched sessions:", formattedResults); // Log the fetched data
        res.json(formattedResults); // Send sessions as a JSON response
      }
    }
  );
});

// Define a route
app.get("/repositoriespro", (req, res) => {
  pool.query(
    "SELECT * FROM repositories WHERE name IN ('Profile Laser - NAS (Synology)', 'Synology NAS')",
    (error, results) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data." });
        return;
      }
      console.log("Fetched repositoriespro:", results); // Log the fetched data

      if (results.length === 0) {
        res.json({ message: "No data found." });
      } else {
        res.json(results); // Send data as a JSON response
      }
    }
  );
});

app.get("/sessionspro", (req, res) => {
  pool.query(
    "SELECT * FROM sessions WHERE name = 'Backup HV01' ORDER BY endTime DESC LIMIT 5 ",
    (error, results) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data." });
        return;
      }

      if (results.length === 0) {
        res.json({ message: "No sessionspro found." });
      } else {
        const formattedResults = results.map((session) => ({
          ...session,
          name: session.name.toLowerCase(), // Format the name to lowercase
          endTime: new Date(session.endTime).toLocaleString(), // Format the date and time
        }));

        console.log("Fetched sessions:", formattedResults); // Log the fetched data
        res.json(formattedResults); // Send sessions as a JSON response
      }
    }
  );
});

/* endpoints
http://localhost:3000/repositories
http://localhost:3000/backups
http://localhost:3000/jobs

 */
