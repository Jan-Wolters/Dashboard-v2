import mysql, { ConnectionOptions } from 'mysql2/promise';

export class DBManager {

    private static instance: DBManager | null = null;
    private readonly databaseInfo: { [databaseID: number]: { host: string, user: string, password: string, database: string } } = {
        1: {
            host: "localhost",
            user: "root",
            password: "",
            database:"hallotest"
        }
    };

    private constructor() { }

    public static async getDatabase(){
        if (!this.instance) {
            this.instance = new DBManager;
        }
        try {
            // gets it from the other getDatabase
            return await this.instance.connectDatabase()
        } catch (e) {
            throw console.warn("Fail Database Connection");
        }
    }

    private async connectDatabase() {

        const access: ConnectionOptions = this.databaseInfo[1];

        try {
            return mysql.createConnection(access);
        } catch (e) {
            throw e;
        }
    }

}

async function testConnection() {
    try {
      const dbConnection = await DBManager.getDatabase();
      // Use the connection to perform database operations
  
      // For example, execute a sample query
      const [rows] = await dbConnection.query('SELECT * FROM companies');
      console.log('Query results:', rows);
  
      // Remember to close the connection when done
      dbConnection.end();
    } catch (error) {
      console.error('Error:', error);
    }
  }