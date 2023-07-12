"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManager = void 0;
/*
import { createConnection, ConnectionOptions } from 'mysql2/promise';

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

  private constructor() {}

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
}

async function testConnection() {
  try {
    const dbConnection = await DBManager.getDatabase();
    // Use the connection to perform database operations

    // For example, execute a sample query
    const [rows] = await dbConnection.query(`
    SELECT
      companies.company_id AS company_id,
      companies.name AS company_name,
      GROUP_CONCAT(DISTINCT repositories.id) AS repository_ids,
      GROUP_CONCAT(DISTINCT repositories.name) AS repository_names,
      GROUP_CONCAT(repositories.capacityGB) AS repository_capacities,
      GROUP_CONCAT(repositories.freeGB) AS repository_frees,
      GROUP_CONCAT(repositories.usedSpaceGB) AS repository_usedSpaces,
      latest_session.session_name AS session_name,
      latest_session.session_endTime AS session_endTime,
      latest_session.session_resultResult AS session_resultResult,
      latest_session.session_resultMessage AS session_resultMessage
    FROM
      companies
    JOIN
      repositories ON companies.company_id = repositories.company_id
    LEFT JOIN (
      SELECT
        sessions.company_id,
        sessions.name AS session_name,
        sessions.endTime AS session_endTime,
        sessions.resultResult AS session_resultResult,
        sessions.resultMessage AS session_resultMessage
      FROM
        sessions
      INNER JOIN (
        SELECT
          company_id,
          MAX(endTime) AS max_endTime
        FROM
          sessions
        GROUP BY
          company_id
      ) AS latest ON sessions.company_id = latest.company_id AND sessions.endTime = latest.max_endTime
    ) AS latest_session ON companies.company_id = latest_session.company_id
    WHERE
      companies.company_id = companies.company_id
    GROUP BY
      companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;`);
    console.log('Query results:', rows);

    // Remember to close the connection when done
    dbConnection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();

*/
var promise_1 = require("mysql2/promise");
var DBManager = exports.DBManager = /** @class */ (function () {
    function DBManager() {
        this.databaseInfo = {
            1: {
                host: "localhost",
                user: "root",
                password: "",
                database: "hallotest"
            }
        };
    }
    DBManager.getDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.instance) {
                            this.instance = new DBManager();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.instance.connectDatabase()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        console.warn("Fail Database Connection");
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DBManager.prototype.connectDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var access;
            return __generator(this, function (_a) {
                access = this.databaseInfo[1];
                try {
                    return [2 /*return*/, (0, promise_1.createConnection)(access)];
                }
                catch (e) {
                    throw e;
                }
                return [2 /*return*/];
            });
        });
    };
    DBManager.prototype.getCompanyData = function (companyId) {
        return __awaiter(this, void 0, void 0, function () {
            var dbConnection, query, rows, repositoriesData, _loop_1, _i, rows_1, row, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DBManager.getDatabase()];
                    case 1:
                        dbConnection = _a.sent();
                        query = "\n      SELECT\n        companies.company_id AS company_id,\n        companies.name AS company_name,\n        GROUP_CONCAT(DISTINCT repositories.id) AS repository_ids,\n        GROUP_CONCAT(DISTINCT repositories.name) AS repository_names,\n        GROUP_CONCAT(repositories.capacityGB) AS repository_capacities,\n        GROUP_CONCAT(repositories.freeGB) AS repository_frees,\n        GROUP_CONCAT(repositories.usedSpaceGB) AS repository_usedSpaces,\n        latest_session.session_name AS session_name,\n        latest_session.session_endTime AS session_endTime,\n        latest_session.session_resultResult AS session_resultResult,\n        latest_session.session_resultMessage AS session_resultMessage\n      FROM\n        companies\n      JOIN\n        repositories ON companies.company_id = repositories.company_id\n      LEFT JOIN (\n        SELECT\n          sessions.company_id,\n          sessions.name AS session_name,\n          sessions.endTime AS session_endTime,\n          sessions.resultResult AS session_resultResult,\n          sessions.resultMessage AS session_resultMessage\n        FROM\n          sessions\n        INNER JOIN (\n          SELECT\n            company_id,\n            MAX(endTime) AS max_endTime\n          FROM\n            sessions\n          GROUP BY\n            company_id\n        ) AS latest ON sessions.company_id = latest.company_id AND sessions.endTime = latest.max_endTime\n      ) AS latest_session ON companies.company_id = latest_session.company_id\n      WHERE\n        companies.company_id = companies.company_id\n      GROUP BY\n        companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;";
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dbConnection.query(query, [companyId])];
                    case 3:
                        rows = (_a.sent())[0];
                        dbConnection.end();
                        repositoriesData = [];
                        if (Array.isArray(rows)) {
                            _loop_1 = function (row) {
                                var company_id = row.company_id;
                                var repositoryIds = row.repository_ids.split(",");
                                var repositoryNames = row.repository_names.split(",");
                                var repositoryCapacities = row.repository_capacities.split(",");
                                var repositoryFrees = row.repository_frees.split(",");
                                var repositoryUsedSpaces = row.repository_usedSpaces.split(",");
                                var repositories = repositoryIds.map(function (_, index) { return ({
                                    repository_id: Number(repositoryIds[index]),
                                    repository_name: repositoryNames[index],
                                    repository_capacityGB: parseFloat(repositoryCapacities[index]),
                                    repository_freeGB: parseFloat(repositoryFrees[index]),
                                    repository_usedSpaceGB: parseFloat(repositoryUsedSpaces[index]),
                                }); });
                                var session = {
                                    session_id: row.session_id,
                                    session_name: row.session_name,
                                    session_endTime: row.session_endTime,
                                    session_resultResult: row.session_resultResult,
                                    session_resultMessage: row.session_resultMessage,
                                };
                                var company = {
                                    company_id: company_id,
                                    company_name: row.company_name,
                                    repositories: repositories,
                                    sessions: [session],
                                };
                                repositoriesData.push(company);
                            };
                            for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                                row = rows_1[_i];
                                _loop_1(row);
                            }
                        }
                        else {
                            console.error("Invalid response from the database. Expected an array.");
                            throw new Error("An error occurred while fetching data.");
                        }
                        return [2 /*return*/, repositoriesData];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error fetching data:", error_1);
                        throw new Error("An error occurred while fetching data.");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DBManager.instance = null;
    return DBManager;
}());
function testConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var dbManager, company_Id, companyData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    dbManager = new DBManager();
                    company_Id = '';
                    return [4 /*yield*/, dbManager.getCompanyData(company_Id)];
                case 1:
                    companyData = _a.sent();
                    console.log('Company data:', companyData);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
testConnection();
