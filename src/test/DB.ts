import { createConnection, ConnectionOptions, RowDataPacket } from 'mysql2/promise';
import { Company } from "./Company";

export class DBManager {
    private static instance: DBManager | null = null;
    private readonly databaseInfo: {
        [databaseID: number]: { host: string, user: string, password: string, database: string };
    } = {
        1: {
            host: "localhost",
            user: "root",
            password: "",
            database: "hallotest"
        }
    };

    private constructor() { }

    public static async getDatabase() {
        if (!this.instance) {
            this.instance = new DBManager();
        }
        try {
            return await this.instance.connectDatabase();
        } catch (e) {
            console.warn("Fail Database Connection");
            throw e;
        }
    }

    private async connectDatabase() {
        const access: ConnectionOptions = this.databaseInfo[1];

        try {
            return createConnection(access);
        } catch (e) {
            throw e;
        }
    }

    public async createCompanies() {
        try {
            const companies = await this.getCompanies();
            console.log(companies);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    public async getCompanies(): Promise<Company[]> {
        try {
            const dbConnection = await DBManager.getDatabase();
            const [rows] = await dbConnection.query('SELECT * FROM companies');
            dbConnection.end();

            const companies: Company[] = (rows as RowDataPacket[]).map((row: RowDataPacket) => {
                const { company_id, name, url, port, veaamUsername, veaamPassword } = row;
                return new Company(company_id, name, url, port, veaamUsername, veaamPassword);
                Company.createRepositories();
                Company.createSessions();
              
              });
          return companies;
              console.log('Created companies:', companies);
            } catch (error) {
              console.error('Error creating companies:', error);
              throw error;
            }
          }}