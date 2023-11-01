import { Session } from "snmp-native";
import mysql from "mysql2/promise";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dotenvPath = path.resolve(__dirname, ".env");

dotenv.config({ path: dotenvPath });
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

      for (const company of companies) {
        if (company.type === "server") {
          await this.performServerSnmpForCompany(company);
        } else if (company.type === "firewall") {
          await this.performFirewallSnmpForCompany(company);
        } else {
          console.error(`Unsupported 'type': ${company.type}`);
        }
      }
    } catch (error) {
      console.error("Error during SNMP processing:", error);
    }
  }

  async getCompaniesFromDatabase() {
    const connection = await mysql.createConnection(this.mysqlConfig);

    try {
      const [rows] = await connection.query(
        "SELECT company_id, ip, port, community, type FROM companysnmp"
      );
      return rows;
    } finally {
      await connection.end();
    }
  }

  async performServerSnmpForCompany(company) {
    const { company_id, ip, port, community } = company;

    if (ip && port && community) {
      const sessionOptions = {
        host: ip,
        port: port,
        community: community,
        retries: 1,
        timeout: 5000,
      };
      const session = new Session(sessionOptions);

      this.companySnmpResults[company_id] = {
        timestamp: new Date(),
        server: {},
      };

      try {
        const [sizeValues, usedValues, descrValues] = await Promise.all([
          this.performSnmpWalk(session, this.sizeOid),
          this.performSnmpWalk(session, this.usedOid),
          this.performSnmpWalk(session, this.descrOid),
        ]);

        this.companySnmpResults[company_id].server.sizeOID = sizeValues;
        this.companySnmpResults[company_id].server.usedOID = usedValues;
        this.companySnmpResults[company_id].server.descrOID = descrValues;
        this.companySnmpResults[company_id].server.sysName =
          await this.performSnmpGet(session, this.sysNameOid);
        this.companySnmpResults[company_id].server.sysUptime =
          await this.performSnmpGet(session, this.sysUptimeOid);

        await this.insertSNMPDataIntoDatabase(
          company_id,
          this.companySnmpResults[company_id]
        );

        console.log(
          `Server SNMP Data for company ${company_id}:`,
          this.companySnmpResults[company_id].server
        );
      } catch (error) {
        console.error("Error during SNMP operations:", error);
      } finally {
        session.close();
      }
    } else {
      console.error(`Missing data for company: ${company_id}`);
    }
  }

  async performFirewallSnmpForCompany(company) {
    const { company_id, ip, port, community } = company;

    if (ip && port && community) {
      const sessionOptions = {
        host: ip,
        port: port,
        community: community,
        retries: 1,
        timeout: 5000,
      };
      const session = new Session(sessionOptions);

      this.companySnmpResults[company_id] =
        this.companySnmpResults[company_id] || {};
      this.companySnmpResults[company_id].timestamp = new Date();
      this.companySnmpResults[company_id].firewall = {};

      try {
        const oids = this.firewallOids;

        console.log(`Firewall SNMP Data for company ${company_id}:`);
        for (const oidName in oids) {
          if (oids.hasOwnProperty(oidName)) {
            const oid = oids[oidName];
            const value = await this.performSnmpGet(session, oid);

            this.companySnmpResults[company_id].firewall[oidName] = value;

            console.log(`OID: ${oidName}`);
            console.log(`Value: ${value}`);
          }
        }

        await this.insertSNMPDataIntoDatabase(
          company_id,
          this.companySnmpResults[company_id]
        );

        console.log(
          `Firewall SNMP Data for company ${company_id}:`,
          this.companySnmpResults[company_id].firewall
        );
      } catch (error) {
        console.error("Error during SNMP operations:", error);
      } finally {
        session.close();
      }
    } else {
      console.error(`Missing data for company: ${company_id}`);
    }
  }

  async insertSNMPDataIntoDatabase(company_id, snmpData) {
    const connection = await mysql.createConnection(this.mysqlConfig);

    try {
      await this.createSnmpDataWalkTableIfNotExists(connection);
      await this.createSnmpDataGetTableIfNotExists(connection);
      await this.createFirewallSnmpDataTableIfNotExists(connection);

      if (snmpData.server) {
        await this.insertDataIntoTable(
          connection,
          "snmpdatawalk",
          company_id,
          snmpData.server.sysName,
          snmpData.server.sysUptime
        );
      }

      if (snmpData.server && snmpData.server.sizeOID) {
        const inserts = snmpData.server.sizeOID.map((size, index) => {
          return this.insertDataIntoTable(
            connection,
            "snmpdataget",
            company_id,
            size,
            snmpData.server.usedOID[index],
            snmpData.server.descrOID[index]
          );
        });

        await Promise.all(inserts);
      }

      if (snmpData.firewall) {
        await this.insertDataIntoTable(
          connection,
          "firewallsnmpdata",
          company_id,
          snmpData.firewall.name,
          snmpData.firewall.product,
          snmpData.firewall.uptime,
          snmpData.firewall.systemTime
        );
      }
    } catch (error) {
      console.error("Error inserting SNMP data into the database:", error);
    } finally {
      await connection.end();
    }
  }

  async createSnmpDataWalkTableIfNotExists(connection) {
    try {
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

  async createFirewallSnmpDataTableIfNotExists(connection) {
    try {
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

  async insertDataIntoTable(connection, tableName, ...values) {
    try {
      let placeholders = values.map(() => "?").join(", ");
      let columns;
      if (tableName === "snmpdatawalk") {
        columns = "(company_id, system_name, system_uptime)";
      } else if (tableName === "snmpdataget") {
        columns = "(company_id, disk_size, disk_used, disk_description)";
      } else if (tableName === "firewallsnmpdata") {
        columns = "(company_id, name, product, uptime, systemtime)";
      }

      let query = "";
      if (tableName === "snmpdatawalk") {
        query = `INSERT INTO ${tableName} ${columns} VALUES (${placeholders}) ON DUPLICATE KEY UPDATE system_name = VALUES(system_name), system_uptime = VALUES(system_uptime)`;
      } else if (tableName === "snmpdataget") {
        query = `INSERT INTO ${tableName} ${columns} VALUES (${placeholders}) ON DUPLICATE KEY UPDATE disk_description = VALUES(disk_description), disk_size = VALUES(disk_size), disk_used = VALUES(disk_used)`;
      } else if (tableName === "firewallsnmpdata") {
        query = `INSERT INTO ${tableName} ${columns} VALUES (${placeholders}) ON DUPLICATE KEY UPDATE name = VALUES(name), product = VALUES(product), uptime = VALUES(uptime), systemtime = VALUES(systemtime)`;
      }

      await connection.execute(query, values);
    } catch (error) {
      console.error("Error inserting data into the table:", error);
      throw error;
    }
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

setUpSNMP();
