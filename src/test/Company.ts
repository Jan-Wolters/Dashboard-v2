import { TokenManager } from "./TokenManager";
import { DBManager } from '../database/DB';
import { Repository } from './Repository';
import { Session } from './Session';

export class Company {
  public readonly company_id: number;
  public readonly name: string;
  public readonly url: string;
  public readonly port: number;
  public readonly username: string;
  public readonly password: string;
  private readonly repository: Repository;
  private readonly session: Session;

  public constructor(id: number, name: string, url: string, port: number, username: string, password: string) {
    this.company_id = id;
    this.name = name;
    this.url = url;
    this.port = port;
    this.username = username;
    this.password = password;
    this.repository = new Repository(this);
    this.session = new Session(this);
  }

  public async getToken() {
    return await TokenManager.getToken(this);
  }

  public async createRepositories(): Promise<void> {
    try {
      await this.repository.insertRepositoriesData();
    } catch (error) {
      console.error("Error creating repositories:", error);
      throw error;
    }
  }

  public async createSessions(): Promise<void> {
    try {
      await this.session.insertSessionsData();
    } catch (error) {
      console.error("Error creating sessions:", error);
      throw error;
    }
  }

  public async getSessionsFromDatabase(): Promise<any[]> {
    try {
      const dbConnection = await DBManager.getDatabase();
      const query = `SELECT * FROM Sessions WHERE company_id = ?`;
      const [rows]: any = await dbConnection.query(query, [this.company_id]);
      dbConnection.end();

      return rows;
    } catch (error) {
      console.error('Error retrieving sessions from the database:', error);
      throw error;
    }
  }

  public async getRepositoriesFromDatabase(): Promise<any[]> {
    try {
      const dbConnection = await DBManager.getDatabase();
      const query = `SELECT * FROM Repositories WHERE company_id = ?`;
      const [rows]: any = await dbConnection.query(query, [this.company_id]);
      dbConnection.end();

      return rows;
    } catch (error) {
      console.error('Error retrieving repositories from the database:', error);
      throw error;
    }
  }
}