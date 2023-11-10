/* eslint-env node */
import express, { Request, Response } from "express";
import https from "https"; // Import http module
import { PoolOptions, createPool } from "mysql2";
import cors from "cors";

import jwt from "jsonwebtoken";
import path from "path";
import dotenv from "dotenv";
console.log("helloa")
// import { setUpVeeam } from "./ApiCon.mjs";
// import { setUpSNMP } from "./SNMPCon.mjs";

// // await setUpVeeam(), setUpSNMP();
// // setInterval(() => {
// //   setUpVeeam(), setUpSNMP();
// // }, 0.05 * 60 * 1000); //15seconden

// Construct the absolute path to the .env file using the current module's directory
const dotenvPath = path.resolve(__dirname, "../.env");

// Load environment variables from the .env file
dotenv.config({ path: dotenvPath });

const app = express();
const ip = process.env.PROJECT_IP; // Change the IP address here
const port = process.env.PROJECT_PORT;
const VITE_PORT = process.env.VITE_PORT;

app.use(cors());

app.use(express.json());
app.use(express.static(path.resolve(__dirname, "./dist")));

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

	constructor(config: PoolOptions) {
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

	query(query: string, values: any[] = []) {
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

app.use(async (req, _res, next) => {
	console.time(req.url);
	next();
	req.on("end", () => console.timeEnd(req.url));
});

// Routes
app.get("/api/info", getInfo);
app.get("/api/infocon", getInfoCon);
app.get("/api/Commag", getCom);
app.delete("/api/companies/:companyId", deleteCompany);
app.post("/api/companies", saveCompany);
app.post("/api/SNMPCompany", saveSNMPCompany);
app.post("/api/loginEN", login);

app.get("/", (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get("/api/checkStatus", (req: Request, res: Response) => {
	checkStatus()
		.then((statusCode) => {
			// Further processing can be done based on the status code here
			console.log("Status code from checkStatus:", statusCode);
			res.status(statusCode).send(`3CX Status Code: ${statusCode}`);
		})
		.catch((error) => {
			console.error("Error in checkStatus:", error);
			res.status(500).send("Failed to retrieve 3CX status.");
		});
});


// Define a server route for your '/Login' route
app.get("/api/Login", (req: Request, res: Response) => {
	// Handle the '/Login' route here
	// This is where you can send the login page or handle login logic on the server
});

// Define server routes for '/COMUP' and '/COMAD' routes in a similar way
app.get("/api/COMUP", (req: Request, res: Response) => {
	// Handle the '/COMUP' route here
});

app.get("/api/COMAD", (req: Request, res: Response) => {
	// Handle the '/COMAD' route here
});
const sessionsByActivity: any = {};

function processSessions(sessions: any) {
	sessions.forEach((session: any) => {
		const activityId = session.activityId;

		if (
			!sessionsByActivity[activityId] ||
			sessionsByActivity[activityId].session.creationTime < session.creationTime
		) {
			if (session.resultResult === "Success") {
				sessionsByActivity[activityId] = {
					status: "Success",
					session: session,
				};
			} else {
				sessionsByActivity[activityId] = {
					status: session.resultResult,
					session: session,
				};
			}
		}
	});

	// Log the current status for each activity ID
	Object.keys(sessionsByActivity).forEach((activityId) => {
		console.log(
			`Activity ID: ${activityId} - Current Status: ${sessionsByActivity[activityId].status}`
		);
	});
}

async function getInfo(req: Request, res: Response) {
	const companies = await getCompanies();

	const rows = await Promise.all(
		companies.map(async (company: any) => {
			company.sessions = await getSessions(company.company_id);
			company.sessiontracker = processSessions(company.sessions);
			console.log(company.sessiontracker);
			company.repositories = await getRepos(company.company_id);
			company.snmp = await getSnmp(company.company_id);
			company.snmpf = await getSnmpF(company.company_id);
			return company;
		})
	);

	res.json(rows);
}

async function getCompanies(): Promise<any> {
	const companyQuery = `SELECT company_id , name, ip, port FROM companies`;
	return databaseManager.query(companyQuery);
}

async function getSessions(companyId: number): Promise<any> {
	const sessionsQuery = `SELECT * FROM sessions WHERE company_id = ${companyId} ORDER BY endTime DESC LIMIT 5;`;
	return databaseManager.query(sessionsQuery);
}

async function getRepos(companyId: number): Promise<any> {
	const reposQuery = `SELECT * FROM repositories WHERE company_id = ${companyId}`;
	return databaseManager.query(reposQuery);
}

async function getSnmp(companyId: number): Promise<any> {
	const snmpQuery = `
    SELECT * 
    FROM snmpdatawalk AS walk
    INNER JOIN snmpdataget AS get ON walk.company_id = get.company_id
    WHERE walk.company_id = ${companyId};
  `;
	return databaseManager.query(snmpQuery);
}
async function getSnmpF(companyId: number) {
	const reposQuery = `SELECT * FROM firewallsnmpdata WHERE company_id = ${companyId}`;
	return databaseManager.query(reposQuery);
}
async function getCom(req: Request, res: Response) {
	const companyQuery = `SELECT company_id, name FROM companies`;

	try {
		const result = await databaseManager.query(companyQuery);
		console.log(result); // Log the result to the console

		// Send the result as a JSON response
		res.status(200).json(result);
	} catch (error) {
		// Handle any errors and send an error response
		res
			.status(500)
			.json({ error: "An error occurred while fetching companies" });
	}
}

async function getInfoCon(req: Request, res: Response) {
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

// login function

async function login(req: Request, res: Response) {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res
				.status(400)
				.json({ error: "Username and password are required." });
		}

		const userQuery =
			"SELECT * FROM users WHERE BINARY Username = ? AND BINARY Password = ?";
		const userRows: any = await databaseManager.query(userQuery, [
			username,
			password,
		]);

		if (userRows.length === 0) {
			return res.status(401).json({ error: "Invalid username or password." });
		}

		const user = userRows[0];

		// Set the token expiration to 30 minutes (in seconds)
		const tokenExpiration = Math.floor(Date.now() / 1000) + 0.25 * 60; // 15 sec

		// Create a token with user information and the calculated expiration time
		const token = jwt.sign(
			{ username: user.Username },
			process.env.JWT_SECRET,
			{
				expiresIn: tokenExpiration,
			}
		); // Change 'your-secret-key' to a secure secret key

		res.json({ token, expiresIn: tokenExpiration }); // Send the token and expiration time to the client
	} catch (error) {
		console.error("Error during authentication:", error);

		// Log the specific error details
		if (error instanceof SyntaxError) {
			console.error("JSON parsing error:", error);
			return res
				.status(500)
				.json({ error: "Invalid JSON data in the request body." });
		}

		// Handle other potential errors
		return res
			.status(500)
			.json({ error: "An error occurred while logging in." });
	}
}

console.log("Starting ApiCon.js...");

const CXUrl = "https://vpbx49.qonnected.net/webclient/#/login"; // Change to HTTP

function checkStatus() {
	return new Promise<number>((resolve, reject) => {
		const statusRequest = https.get(CXUrl, (statusResponse) => {
			if (statusResponse.statusCode === 200) {
				// Successfully retrieved the status with a 200 status code
				console.log("3CX Status Code:", 200);
				resolve(200);
			} else {
				// Returned an unexpected status code when requesting the status
				console.log("3CX Status Code:", statusResponse.statusCode);
				reject(statusResponse.statusCode);
			}
		});

		statusRequest.on("error", (error) => {
			console.error("Failed to retrieve 3CX status. Error:", error);
			reject(error);
		});

		// End the status request
		statusRequest.end();
	});
}

// Start the server
app.listen(port, () => {
	if(process.env.NODE_ENV === "development")
		console.log(`Server listening at http://${ip}:${VITE_PORT}`);
	else
		console.log(`Server listening at https://${ip}:${port}`);
});

function saveCompany(req: Request, res: Response) {
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
function saveSNMPCompany(req: Request, res: Response) {
	const { company_id, ip, port, community, type } = req.body;

	// Save the form data to the database
	const query = `INSERT INTO companysnmp (company_id, ip, port, community, type) VALUES (?, ?, ?, ?, ?)`;
	const values = [company_id, ip, port, community, type];

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

function deleteCompany(req: Request, res: Response) {
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
			connection.query(deleteCompanyQuery, [companyId], (err, results: any) => {
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
