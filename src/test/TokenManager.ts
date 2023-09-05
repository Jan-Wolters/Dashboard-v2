import axios from 'axios';
import { Company } from "./Company";

export const enum TokenManagerErrors {
  MISSING_TOKEN = "missing token",
  FETCH_FAIL = "failed to fetch"
}

export class TokenManager {

  private static instance: TokenManager | null = null;

  public static async getToken(company: Company) {
    if (!this.instance)
      this.instance = new TokenManager();
    try {
      return this.instance.getToken(company.url);
    }
    catch (e) {
      if (e === TokenManagerErrors.MISSING_TOKEN) {
        try {
          return await this.instance.fetchAccessToken(company);
        }
        catch (e) {
          if (e === TokenManagerErrors.FETCH_FAIL) {
            console.warn("TODO! fix this...")
            throw e;
          }
          else {
            throw e;
          }
        }
      }
      else {
        throw e;
      }
    }
  }

  private readonly tokens: { [url: string]: { access_token: string, refresh_token: string } } = {};

  private constructor() { }

  private getToken(name: string) {
    if (!this.tokens[name]) {
      throw TokenManagerErrors.MISSING_TOKEN;
    }
    return this.tokens[name];
  }

  private async fetchAccessToken(company: Company) {
    try {
      const { url, port, username, password } = company;
      const requestData = {
        grant_type: "password",
        username,
        password,
      };

      const response = await axios.post(
        `https://${url}:${port}/api/oauth2/token`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-version": "1.0-rev1",
          },
        }
      );

      const data = response.data;

      this.tokens[url] = {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }

      return this.tokens[url]!;
    }
    catch (e) {
      throw TokenManagerErrors.FETCH_FAIL;
    }
  }
}