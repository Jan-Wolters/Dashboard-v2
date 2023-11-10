import fetch from "node-fetch";
import { createConnection } from "mysql2/promise";
import path from "path";
import dotenv from "dotenv";

// Construct the absolute path to the .env file using the current module's directory
const dotenvPath = path.resolve(__dirname, "../.env");

// Load environment variables from the .env file
dotenv.config({ path: dotenvPath });

// Add this line to disable SSL certificate validation
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const mysqlConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
};

class AccessTokenManager {
	access_token: null | string;
	tokenExpiryTime: null | number;
	formatter: Intl.DateTimeFormat;
	constructor() {
		this.access_token = null;
		this.tokenExpiryTime = null;

		this.formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "Europe/Paris", // Use the timeZone identifier for CET
			hour12: false, // Set to 24-hour format (optional)
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	}

	async fetchAccessToken(ip: string, port: number, veaamUsername: string, veaamPassword: string) {
		try {
			const requestData = {
				grant_type: "password",
				username: veaamUsername,
				password: veaamPassword,
			};
			const Veaam_Token_URL = process.env.VEEAM_TOKENURL;
			const apiUrl = `https://${ip}:${port}${Veaam_Token_URL}`;

			// Debugging: Log the request URL
			console.log("Request URL:", apiUrl);

			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-version": "1.0-rev1",
				},
				body: JSON.stringify(requestData),
				agent: new (await import("https")).Agent({ rejectUnauthorized: false }),
			});

			console.log("Response Status:", response.status); // Log HTTP status code

			if (!response.ok) {
				console.error(
					"Failed to fetch access token. Response:",
					response.status,
					response.statusText
				);
				const responseText = await response.text(); // Log the response content
				console.error("Response Content:", responseText);

				if (response.status === 503) {
					// Change to the appropriate status code
					console.error("Service unavailable, stopping the process.");
					process.exit(1); // Stop the process with a non-zero exit code
				} else {
					throw new Error("Failed to fetch access token from APICON");
				}
			}

			const data = await response.json() as object;

			// Set the access token and its expiry time
			if (!("access_token" in data))
				throw new Error("could not get access_token from response!");

			if (!("expires_in" in data))
				throw new Error("could not get expires_in from response!");

			if (typeof data.access_token !== "string")
				throw new Error("access_token is not a string!");

			this.access_token = data.access_token;

			if (typeof data.expires_in !== "number")
				throw new Error("expires_in is not a number!");

			this.tokenExpiryTime = new Date().getTime() + data.expires_in * 1000;

			//console.log(`Access token refreshed: Bearer ${this.access_token}`);
		} catch (error: any) {
			if (error.code === "EHOSTUNREACH") {
				console.error("EHOSTUNREACH error. Stopping the process.");
				process.exit(1); // Stop the process with a non-zero exit code
			} else {
				console.error("Error fetching access token:", error);
				throw error;
			}
		}
	}

	async getAccessToken() {
		if(typeof this.tokenExpiryTime !== "number")
		throw new Error('tokenExpiriyTime is not numeric');
		if (!this.access_token || this.tokenExpiryTime <= new Date().getTime()) {
			throw new Error("Access token is not available or expired.");
		}
		return this.access_token;
	}

	async getApiCredentialsFromDB() {
		try {
			const connection = await createConnection(mysqlConfig);

			// Fetch all API credentials from the database
			const [rows] = await connection.execute(
				"SELECT company_id, port, ip, veaamUsername, veaamPassword FROM companies WHERE company_id = company_id"
			) as any;

			await connection.end();

			if (rows.length === 0) {
				console.error("No companies found in the database.");
				return [];
			}

			const apiCredentialsList = [];

			for (const row of rows) {
				const apiCredentials = {
					company_id: row.company_id,
					ip: row.ip,
					port: row.port,
					username: row.veaamUsername,
					password: row.veaamPassword,
				};
				apiCredentialsList.push(apiCredentials);
			}

			// Debugging: Log the retrieved API credentials
			console.log("API Credentials List:", apiCredentialsList);

			return apiCredentialsList;
		} catch (error) {
			console.error("Error fetching API credentials from the database:", error);
			throw error;
		}
	}

	async fetchDataFromApi(apiUrl: any, ignoreSSLValidation: any) {
		try {
			const accessToken = await this.getAccessToken(); // Get the access token

			const headers = {
				Accept: "application/json",
				"x-api-version": "1.0-rev1",
				Authorization: `Bearer ${accessToken}`,
			};

			// Create an options object with headers and agent settings
			const options = {
				headers: headers,
				agent: new (await import("https")).Agent({
					rejectUnauthorized: ignoreSSLValidation ? false : true, // Toggle SSL certificate validation
				}),
			};

			const response = await fetch(apiUrl, options);

			if (!response.ok) {
				console.error("Failed to fetch API data. Status:", response.status);
				const errorText = await response.text();
				console.error("Error Response:", errorText);
				throw new Error(`Failed to fetch API data. Status: ${response.status}`);
			}

			const apiData = await response.json();

			// Log the API data to the console
			//console.log("API Data:", apiData);

			return apiData;
		} catch (error) {
			console.error("Error fetching data from the API:", error);
			throw error;
		}
	}

	async createSessionsTableIfNotExists(connection: any) {
		try {
			// Create a table for sessions if it doesn't exist (you can modify this SQL query based on your table structure)
			await connection.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(255) PRIMARY KEY,
          company_id INT,
          name VARCHAR(255),
          activityId VARCHAR(255),
          sessionType VARCHAR(255),
          creationTime DATETIME,
          endTime DATETIME,
          state VARCHAR(255),
          progressPercent INT,
          resultResult VARCHAR(255),
          resultMessage VARCHAR(255),
          resultIsCanceled BOOLEAN,
          resourceId VARCHAR(255),
          resourceReference VARCHAR(255),
          parentSessionId INT,
          usn INT,
          UNIQUE KEY unique_record (company_id, id)
        )
      `);
		} catch (error) {
			console.error("Error creating sessions table:", error);
			throw error;
		}
	}

	async createRepositoriesTableIfNotExists(connection: any) {
		try {
			// Create a table for repositories if it doesn't exist (you can modify this SQL query based on your table structure)
			await connection.execute(`
        CREATE TABLE IF NOT EXISTS repositories (
          type VARCHAR(255),
          id VARCHAR(255),
          company_id INT,
          name VARCHAR(255),
          description TEXT,
          hostId VARCHAR(255),
          hostName VARCHAR(255),
          path VARCHAR(255),
          capacityGB FLOAT,
          freeGB FLOAT,
          usedSpaceGB FLOAT,
          PRIMARY KEY (id, type, company_id) -- Define a unique key on both id and type columns
        )
      `);
		} catch (error) {
			console.error("Error creating repositories table:", error);
			throw error;
		}
	}

	// Create a DateTimeFormat object and specify the timeZone option

	async saveDataToDatabase(records: any, company_id: any, tableName: any) {
		try {
			const connection = await createConnection(mysqlConfig);

			if (tableName === "sessions") {
				await this.createSessionsTableIfNotExists(connection);
			} else if (tableName === "repositories") {
				await this.createRepositoriesTableIfNotExists(connection);
			} else {
				console.error("Invalid table name:", tableName);
				throw new Error("Invalid table name");
			}

			for (const record of records.data) {
				let sql = "";
				let values = [];

				if (tableName === "sessions") {
					// Parse creationTime and endTime as ISO dates
					const creationTimeDate = new Date(record.creationTime);
					const endTimeDate = new Date(record.endTime);

					sql = `INSERT INTO sessions (id, company_id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            activityId = VALUES(activityId),
            sessionType = VALUES(sessionType),
            creationTime = VALUES(creationTime),
            endTime = VALUES(endTime),
            state = VALUES(state),
            progressPercent = VALUES(progressPercent),
            resultResult = IF(VALUES(progressPercent) < 100, NULL, VALUES(resultResult)),
            resultMessage = IF(VALUES(progressPercent) < 100, NULL, VALUES(resultMessage)),
            resultIsCanceled = IF(VALUES(progressPercent) < 100, NULL, VALUES(resultIsCanceled)),
            resourceId = VALUES(resourceId),
            resourceReference = VALUES(resourceReference),
            parentSessionId = VALUES(parentSessionId),
            usn = VALUES(usn)`;

					values = [
						record.id,
						company_id,
						record.name,
						record.activityId,
						record.sessionType,
						creationTimeDate.toISOString(), // Use ISO formatted dates
						endTimeDate.toISOString(), // Use ISO formatted dates
						record.state,
						record.progressPercent,
						record.progressPercent < 100 ? null : record.result.result,
						record.progressPercent < 100 ? null : record.result.message,
						record.progressPercent < 100 ? null : record.result.isCanceled,
						record.resourceId,
						record.resourceReference,
						record.parentSessionId,
						record.usn,
					];
				} else if (tableName === "repositories") {
					sql = `INSERT INTO repositories (type, id, company_id, name, description, hostId, hostName, path, capacityGB, freeGB, usedSpaceGB)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            type = VALUES(type),
            name = VALUES(name),
            description = VALUES(description),
            hostId = CASE WHEN id = VALUES(id) THEN VALUES(hostId) ELSE hostId END,
            hostName = CASE WHEN id = VALUES(id) THEN VALUES(hostName) ELSE hostName END,
            path = VALUES(path),
            capacityGB = VALUES(capacityGB),
            freeGB = VALUES(freeGB),
            usedSpaceGB = VALUES(usedSpaceGB)`;

					values = [
						record.type,
						record.id,
						company_id,
						record.name,
						record.description,
						record.hostId,
						record.hostName,
						record.path,
						record.capacityGB,
						record.freeGB,
						record.usedSpaceGB,
					];
				} else {
					console.error("Invalid table name:", tableName);
					throw new Error("Invalid table name");
				}

				if (sql && values.length > 0) {
					await connection.execute(sql, values);
				}
			}

			await connection.end();
		} catch (error) {
			console.error("Error saving data to the database:", error);
			throw error;
		}
	}

	async executeApiRequests() {
		try {
			const apiCredentialsList = await this.getApiCredentialsFromDB();
			for (let i = 0; i < apiCredentialsList.length; i++) {
				const apiCredentials = apiCredentialsList[i];
				console.log(`Processing Company ID: ${apiCredentials.company_id}`);

				// Check if `ip` and `port` are valid
				if (!apiCredentials.ip || !apiCredentials.port) {
					console.error(
						`Invalid IP or port for Company ID ${apiCredentials.company_id}. Skipping...`
					);
					continue;
				}

				let success = false; // Track if processing was successful

				try {
					await this.fetchAccessToken(
						apiCredentials.ip,
						apiCredentials.port,
						apiCredentials.username,
						apiCredentials.password
					);

					const Veaam_Session_URL = process.env.VEAAM_SESSIONSURL;
					const Veaam_Repositories_URL = process.env.VEEAM_REPOSITORIEURL;

					const sessionsApiUrl = `https://${apiCredentials.ip}:${apiCredentials.port}${Veaam_Session_URL}`;
					const repositoriesApiUrl = `https://${apiCredentials.ip}:${apiCredentials.port}${Veaam_Repositories_URL}`;

					// Fetch data from the sessions API and log it to the console
					console.log("Fetching sessions data...");
					const sessionsData = await this.fetchDataFromApi(
						sessionsApiUrl,
						true
					); // Pass true to ignore SSL certificate validation

					// Save the sessions data to the database along with the company_id
					console.log("Saving sessions data...");
					await this.saveDataToDatabase(
						sessionsData,
						apiCredentials.company_id,
						"sessions"
					);

					// Fetch data from the repositories API and log it to the console
					console.log("Fetching repositories data...");
					const repositoriesData = await this.fetchDataFromApi(
						repositoriesApiUrl,
						true
					); // Pass true to ignore SSL certificate validation

					// Save the repositories data to the database
					console.log("Saving repositories data...");
					await this.saveDataToDatabase(
						repositoriesData,
						apiCredentials.company_id,
						"repositories"
					);

					console.log(
						`Processing Company ID ${apiCredentials.company_id} completed.`
					);

					// Set success to true if the processing was successful
					success = true;
				} catch (error: any) {
					if (error.code === "ERR_INVALID_URL") {
						console.error(
							`ERR_INVALID_URL error for Company ID ${apiCredentials.company_id}. Deleting company...`
						);

						// Delete the company from the database
						await this.deleteCompany(apiCredentials.company_id);
					} else if (
						error.code === "ENOTFOUND" &&
						error.erroredSysCall === "getaddrinfo"
					) {
						console.error(
							`ENOTFOUND error for Company ID ${apiCredentials.company_id}. Skipping...`
						);

						await this.deleteCompany(apiCredentials.company_id);
						// You can add some additional handling here if needed
					} else if (error.code === "ENETUNREACH") {
						console.error(
							`ENETUNREACH error for Company ID ${apiCredentials.company_id}. Deleting company...`
						);

						// Delete the company from the database
						await this.deleteCompany(apiCredentials.company_id);
					} else {
						console.error(
							`Error processing Company ID ${apiCredentials.company_id}:`,
							error
						);
					}
				}

				if (!success) {
					console.error(
						`All retry attempts failed for Company ID ${apiCredentials.company_id}. Skipping...`
					);
				}
			}

			// Delete companies that are no longer in the apiCredentialsList
			await this.deleteCompaniesNotInList(apiCredentialsList);

			console.log("Success");
		} catch (error) {
			console.error("Error executing API requests:", error);
			console.log("Failed");
		}
	}

	async deleteCompaniesNotInList(apiCredentialsList: any) {
		try {
			const connection = await createConnection(mysqlConfig);
			const existingCompanies = await this.getExistingCompanies(connection);

			for (const company of existingCompanies) {
				if (
					!apiCredentialsList.some(
						(credentials: any) => credentials.company_id === company.company_id
					)
				) {
					// Delete the company from the database
					await this.deleteCompany(company.company_id);

					// Reload data for the deleted company
					await this.executeApiRequests();
				}
			}

			await connection.end();
		} catch (error) {
			console.error("Error deleting companies not in the list:", error);
			throw error;
		}
	}

	async getExistingCompanies(connection: any) {
		const [rows, fields] = await connection.execute(
			"SELECT company_id FROM companies"
		);
		return rows;
	}

	async deleteCompany(company_id: any) {
		try {
			const connection = await createConnection(mysqlConfig); // Create a new connection here

			const [result] = await connection.execute(
				"DELETE FROM companies WHERE company_id = ?",
				[company_id]
			) as any;

			if (result.affectedRows === 0) {
				console.error(`Company ID ${company_id} not found in the database.`);
			} else {
				console.log(`Company ID ${company_id} deleted from the database.`);
			}

			// Close the connection after the operation is complete
			await connection.end();
		} catch (error) {
			console.error(
				`Error deleting Company ID ${company_id} from the database:`,
				error
			);
			throw error;
		}
	}
}

export async function setUpVeeam() {
	const accessTokenManager = new AccessTokenManager();
	console.log("Starting ApiCon.js...");

	try {
		await accessTokenManager.executeApiRequests();
		console.log("ApiCon.js execution completed.");
	} catch (error: any) {
		if (error.message === "Failed to fetch access token from APICON") {
			// Handle the specific error here
			console.error(
				"Failed to fetch access token from APICON: Retrying or taking other actions..."
			);
		} else {
			// Handle other errors
			console.error("Error in setUpVeeam:", error);

			if (error.code === "EHOSTUNREACH" || error.code === "ENETUNREACH") {
				// Handle the case where a connection cannot be made
				console.error("Connection error, deleting the company and its data...");

				// Get the list of companies from the database
				const apiCredentialsList =
					await accessTokenManager.getApiCredentialsFromDB();

				for (const apiCredentials of apiCredentialsList) {
					if (apiCredentials.ip && apiCredentials.port) {
						try {
							// Attempt to delete the company and its data
							await accessTokenManager.deleteCompany(apiCredentials.company_id);
						} catch (deleteError) {
							console.error(
								"Error deleting the company and its data:",
								deleteError
							);
						}
					}
				}
			}
		}
	}
}
