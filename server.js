import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "hallotest",
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
app.get("/data", (req, res) => {
  pool.query("SELECT * FROM data", (error, results) => {
    if (error) {
      console.error("Error executing SELECT query:", error);
      res.status(500).json({ error: "An error occurred while fetching data." });
      return;
    }
    console.log("Fetched data:", results); // Log the fetched data

    if (results.length === 0) {
      res.json({ message: "No data found." });
    } else {
      res.json(results); // Send data as a JSON response
    }
  });
});

app.get("/sessions", (req, res) => {
  pool.query(
    "SELECT * FROM sessions WHERE name = 'hyper-v backup'ORDER BY endTime DESC LIMIT 5",
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

app.get("/backup", (req, res) => {
  pool.query(
    "SELECT * FROM backup WHERE platformName IN ('HyperV', 'CustomPlatform')",
    (error, results) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data." });
        return;
      }

      if (results.length === 0) {
        res.json({ message: "No backup data found." });
      } else {
        console.log("Fetched backup:", results); // Log the fetched data
        res.json(results); // Send backup data as a JSON response
      }
    }
  );
});
/* endpoints
http://localhost:3000/repositories
http://localhost:3000/backups
http://localhost:3000/jobs

 */
