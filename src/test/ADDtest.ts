
import { DBManager } from "./peter";

export class Company{
    
    public readonly name: string;
    public readonly url: string;
    public readonly port: number;
    public readonly username: string;
    public readonly password: string;
    
    public constructor(name: string, url: string, port: number, username: string, password: string){
        this.name = name;
        this.url = url;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    public async getToken()
    {
        return await TokenManager.getToken(this);
    }

    async instertToDatabase():Promise<void>{
        const connection = await DBManager.getDatabase();
        try {
            const query = 'INSERT INTO companies (name, url, port, username, password) VALUES (?, ?, ?, ?, ?)';
            await connection.execute(query, [
              this.name,
              this.url,
              this.port,
              this.username,
              this.password,
            ]);
            console.log('Company data saved to the database.');
          } catch (error) {
            console.error('Error saving company data to the database:', error);
          } finally {
            connection.end();
          }
    }

}

// Create a company instance
const company = new Company('Example Company', 'example.com', 8080, 'admin', 'password');

// Save the company data to the database
company.instertToDatabase();