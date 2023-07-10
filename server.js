import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

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
app.get("/info", getInfo);

app.post("/companies", saveCompany);

async function getInfo(req, res) {
  try {
    const companiesQuery = "SELECT * FROM companies";
    const [companiesRows] = await databaseManager.query(companiesQuery);

    const repositoriesData = [];
    for (const companiesRow of companiesRows) {
      const companyId = companiesRow.company_id;

      const repositoriesQuery = `
        SELECT
          companies.company_id AS company_id,
          companies.name AS company_name,
          repositories.id AS repository_id,
          repositories.name AS repository_name,
          repositories.description AS repository_description,
          repositories.hostId AS repository_hostId,
          repositories.hostName AS repository_hostName,
          repositories.path AS repository_path,
          repositories.capacityGB AS repository_capacityGB,
          repositories.freeGB AS repository_freeGB,
          repositories.usedSpaceGB AS repository_usedSpaceGB
        FROM
          companies
        JOIN
          repositories ON companies.company_id = repositories.company_id
        WHERE
          companies.company_id = ${companyId};
      `;

      const [repositoriesRows] = await databaseManager.query(repositoriesQuery);

      for (const repositoriesRow of repositoriesRows) {
        repositoriesData.push(repositoriesRow);
      }
    }

    res.json(repositoriesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

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
