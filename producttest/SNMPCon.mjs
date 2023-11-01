import { Session } from "snmp-native";
import mysql from "mysql2/promise";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the .env file using the current module's directory
const dotenvPath = path.resolve(__dirname, ".env");

// Load environment variables from the .env file
dotenv.config({ path: dotenvPath });

// Add this line to disable SSL certificate validation
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

class SNMPProcessor {
  constructor() {
    this.companySnmpResults = {};
    this.sizeOid = ".1.3.6.1.2.1.25.2.3.1.5";
    this.usedOid = ".1.3.6.1.2.1.25.2.3.1.6";
    this.descrOid = ".1.3.6.1.2.1.25.2.3.1.3"; // Disk Description OID
    this.sysUptimeOid = ".1.3.6.1.2.1.1.3.0"; // System Uptime OID
    this.sysNameOid = ".1.3.6.1.2.1.1.5.0"; // System Name OID
    this.firewallOids = {
      name: ".1.3.6.1.2.1.1.5.0", // Appliance name
      product: ".1.3.6.1.4.1.28553.1.1", // Product Name
      uptime: ".1.3.6.1.2.1.25.1.1.0", // Uptime
      systemTime: ".1.3.6.1.4.1.2021.100.4.0", // System Time
    };

    // Initialize the MySQL configuration
    this.mysqlConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    };
  }

  async initialize() {
    try {
      const companies = await this.getCompaniesFromDatabase();

      // Iterate over each company, but only for the first two companies (index 0 and index 1)
      for (let i = 0; i < 2 && i < companies.length; i++) {
        const company = companies[i];
        await this.performSnmpForCompany(company);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getCompaniesFromDatabase() {
    const connection = await mysql.createConnection(this.mysqlConfig);

    try {
      const [rows] = await connection.query(
        "SELECT company_id, name, port, ip, veaamUsername, veaamPassword, ipfirewall FROM companies"
      );
      return rows;
    } finally {
      await connection.end();
    }
  }

  async performSnmpForCompany(company) {
    const { company_id, ip, name, ipfirewall } = company;
    const options = {
      host: ip,
      port: 161,
      community: "dashboard",
      retries: 1,
      timeout: 5000,
    };
    const session = new Session(options);

    // Initialize SNMP results for the company
    this.companySnmpResults[name] = {};

    try {
      // Perform SNMP walks and gets for this IP address
      const [sizeValues, usedValues, descValues] = await Promise.all([
        this.performSnmpWalk(session, this.sizeOid),
        this.performSnmpWalk(session, this.usedOid),
        this.performSnmpWalk(session, this.descrOid),
      ]);

      this.companySnmpResults[name][this.sizeOid] = sizeValues;
      this.companySnmpResults[name][this.usedOid] = usedValues;
      this.companySnmpResults[name][this.descrOid] = descValues;

      // Continue with the rest of the SNMP data retrieval
      this.companySnmpResults[name][this.sysNameOid] =
        await this.performSnmpGet(session, this.sysNameOid);
      this.companySnmpResults[name][this.sysUptimeOid] =
        await this.performSnmpGet(session, this.sysUptimeOid);
      // Add other OIDs here

      // Insert SNMP data into the database
      await this.saveDataToDatabase(
        this.companySnmpResults[name],
        company_id,
        name
      );

      // Perform SNMP GET operations for firewall data
      await this.performFirewallSnmpGet(ipfirewall, company_id, name);
    } catch (error) {
      console.error(error);
    } finally {
      // Close the SNMP session for this IP address
      session.close();
    }
  }

  async saveDataToDatabase(data, company_id, name) {
    const connection = await mysql.createConnection(this.mysqlConfig);

    try {
      // Create the snmpdatawalk table if it doesn't exist
      await this.createSnmpDataWalkTableIfNotExists(connection);
      // Insert System Name and System Uptime into the snmpdatawalk table
      await this.insertDataIntoTable(
        connection,
        "snmpdatawalk",
        company_id,
        data[this.sysNameOid],
        data[this.sysUptimeOid]
      );

      // Create the snmpdataget table if it doesn't exist
      await this.createSnmpDataGetTableIfNotExists(connection);

      // Ensure that the SNMP data for sizeOid, usedOid, and descrOid are valid arrays
      const sizeDataArray = data[this.sizeOid] || [];
      const usedDataArray = data[this.usedOid];
      const descDataArray = data[this.descrOid];

      if (
        sizeDataArray.length >= 1 &&
        usedDataArray.length >= 1 &&
        descDataArray.length >= 1
      ) {
        // Loop through the arrays and insert each value into the snmpdataget table as a separate row
        for (let i = 0; i < sizeDataArray.length; i++) {
          const sizeValue = sizeDataArray[i].toString();
          const usedValue = usedDataArray[i].toString();
          const descValue = descDataArray[i].toString();

          // Insert Size, Used, and Description values into the snmpdataget table as separate rows
          await this.insertDataIntoTable(
            connection,
            "snmpdataget",
            company_id,
            sizeValue,
            usedValue,
            descValue
          );
          console.log(`Successfully processed SNMP data for company: ${name}`);
        }
      } else {
        // Log the data for further analysis if needed
        console.error(`Unexpected SNMP data format for company: ${name}`);
        console.error(`Size Data: ${sizeDataArray}`);
        console.error(`Used Data: ${usedDataArray}`);
        console.error(`Description Data: ${descDataArray}`);
      }
    } catch (error) {
      console.error("Error saving data to the database:", error);
      throw error;
    } finally {
      // Close the database connection
      await connection.end();
    }
  }

  async createSnmpDataWalkTableIfNotExists(connection) {
    try {
      // Create a table for snmpdatawalk if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS snmpdatawalk (
          company_id int(11) NOT NULL,
          system_name varchar(255) NOT NULL,
          system_uptime int(11) DEFAULT NULL,
          PRIMARY KEY (company_id)
        )
      `);
    } catch (error) {
      console.error("Error creating snmpdatawalk table:", error);
      throw error;
    }
  }

  async createSnmpDataGetTableIfNotExists(connection) {
    try {
      // Create a table for snmpdataget if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS snmpdataget (
          company_id int(11) NOT NULL,
          disk_size varchar(255) DEFAULT NULL,
          disk_used varchar(255) DEFAULT NULL,
          disk_description varchar(255) NOT NULL,
          PRIMARY KEY (company_id, disk_description)
        )
      `);
    } catch (error) {
      console.error("Error creating snmpdataget table:", error);
      throw error;
    }
  }

  async insertDataIntoTable(connection, tableName, ...values) {
    try {
      let placeholders = values.map(() => "?").join(", ");
      let columns;
      if (tableName === "snmpdatawalk") {
        columns = "(company_id, system_name, system_uptime)";
      } else if (tableName === "snmpdataget") {
        columns = "(company_id, disk_size, disk_used, disk_description)";
      }

      let query = "";
      if (tableName === "snmpdatawalk") {
        columns = "(company_id, system_name, system_uptime)";
        query = `INSERT INTO ${tableName} ${columns} VALUES (${placeholders}) ON DUPLICATE KEY UPDATE system_name = VALUES(system_name), system_uptime = VALUES(system_uptime)`;
      } else if (tableName === "snmpdataget") {
        columns = "(company_id, disk_size, disk_used, disk_description)";
        query = `INSERT INTO ${tableName} ${columns} VALUES (${placeholders}) ON DUPLICATE KEY UPDATE disk_description = VALUES(disk_description), disk_size = VALUES(disk_size), disk_used = VALUES(disk_used)`;
      }

      await connection.execute(query, values);
    } catch (error) {
      console.error("Error inserting data into the table:", error);
      throw error;
    }
  }

  displayCompanyResults(companyName) {
    console.log(`SNMP Results for Company: ${companyName}`);
    console.log(
      `System Name: ${this.companySnmpResults[companyName][this.sysNameOid]}`
    );
    console.log(
      `System Uptime: ${
        this.companySnmpResults[companyName][this.sysUptimeOid]
      }`
    );
    console.log(
      `Size OID: ${this.companySnmpResults[companyName][this.sizeOid]}`
    );
    console.log(
      `Used OID: ${this.companySnmpResults[companyName][this.usedOid]}`
    );
    console.log(
      `Description OID: ${this.companySnmpResults[companyName][this.descrOid]}`
    );
    console.log("----------------------------------");
  }

  async performSnmpWalk(session, oid) {
    return new Promise((resolve, reject) => {
      session.getSubtree({ oid }, (error, varbinds) => {
        if (error) {
          console.error(`SNMP walk for ${oid} failed: ${error}`);
          reject(`SNMP walk for ${oid} failed: ${error}`);
          return;
        }

        // Filter and store the values for index 0 and index 1
        const values = varbinds
          .filter((varbind, index) => index === 0 || index === 1)
          .map((varbind) => varbind.value);
        resolve(values);
      });
    });
  }

  async performSnmpGet(session, oid) {
    return new Promise((resolve, reject) => {
      session.get({ oid: oid }, (error, varbinds) => {
        if (error) {
          console.error(`SNMP GET for ${oid} failed: ${error}`);
          reject(`SNMP GET for ${oid} failed: ${error}`);
        } else {
          // Store the value
          const value = varbinds[0].value;
          resolve(value);
        }
      });
    });
  }

  async performFirewallSnmpGet(ipfirewall, company_id, name) {
    const options = {
      host: ipfirewall,
      port: 161,
      community: "dashboard",
      retries: 1,
      timeout: 5000,
    };
    const firewallSession = new Session(options);

    this.companySnmpResults[ipfirewall] = {};

    try {
      for (const oid in this.firewallOids) {
        const value = await this.performSnmpGet(
          firewallSession,
          this.firewallOids[oid]
        );
        this.companySnmpResults[ipfirewall][oid] = value;
      }

      // Log the 'data' object to check its structure
      console.log(
        "Data before saving to the database:",
        this.companySnmpResults[ipfirewall]
      );

      // Insert firewall SNMP data into the database
      await this.saveFirewallDataToDatabase(
        this.companySnmpResults[ipfirewall],
        company_id,
        name
      );
    } catch (error) {
      console.error(
        `Error performing SNMP for firewall (${ipfirewall}):`,
        error
      );
    } finally {
      firewallSession.close();
    }
  }

  async createFirewallSnmpDataTableIfNotExists(connection) {
    try {
      // Create the firewallsnmpdata table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS firewallsnmpdata (
          company_id int(11) NOT NULL,
          name varchar(255) DEFAULT NULL,
          product varchar(255) DEFAULT NULL,
          uptime  varchar(255) DEFAULT NULL,
          systemtime  varchar(255) DEFAULT NULL,
          PRIMARY KEY (company_id)
        )
      `);
    } catch (error) {
      console.error("Error creating firewallsnmpdata table:", error);
      throw error;
    }
  }

  async saveFirewallDataToDatabase(data, company_id, name) {
    const connection = await mysql.createConnection(this.mysqlConfig);

    try {
      // Create the firewallsnmpdata table if it doesn't exist
      await this.createFirewallSnmpDataTableIfNotExists(connection);

      const query = `
      INSERT INTO firewallsnmpdata (company_id, name, product, uptime, systemtime)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name), product = VALUES(product), uptime = VALUES(uptime), systemtime = VALUES(systemTime)`;

      // Destructure the 'data' object and use a different variable name, like 'systemTime'
      const { name, product, uptime, systemTime: systemTime } = data;
      console.log(data);

      // Handle undefined values by providing default values or setting them to null
      const companyID = company_id || null;
      const firewallName = name || null;
      const firewallProduct = product || null;
      const firewallUptime = uptime || null;

      // Use the new variable name 'systemTime'
      const firewallSystemTime = systemTime || null;

      console.log(systemTime);
      console.log(firewallSystemTime);
      await connection.execute(query, [
        companyID,
        firewallName,
        firewallProduct,
        firewallUptime,
        firewallSystemTime,
      ]);
      console.log(
        `Successfully processed SNMP data for firewall (company_id: ${companyID}, name: ${firewallName}, time : ${firewallSystemTime})`
      );
    } catch (error) {
      console.error("Error saving firewall data to the database:", error);
      throw error;
    } finally {
      await connection.end();
    }
  }
}

const snmpProcessor = new SNMPProcessor();

export async function setUpSNMP() {
  console.log("Starting SNMP processing...");

  try {
    await snmpProcessor.initialize();
    console.log("SNMP processing completed.");
  } catch (error) {
    console.error("Error during SNMP processing:", error);
  }
}

setUpSNMP(); // Call the setup function to start SNMP processing
