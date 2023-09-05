"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
var TokenManager_1 = require("./TokenManager.cjs");
var DB_1 = require("./DB.cjs");
var Repository_1 = require("./Repository.cjs");
var Session_1 = require("./Session.cjs");
var Company = /** @class */ (function () {
  function Company(id, name, url, port, username, password) {
    this.company_id = id;
    this.name = name;
    this.url = url;
    this.port = port;
    this.username = username;
    this.password = password;
    this.repository = new Repository_1.Repository(this);
    this.session = new Session_1.Session(this);
  }
  Company.prototype.getToken = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, TokenManager_1.TokenManager.getToken(this)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  Company.prototype.createRepositories = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.repository.insertRepositoriesData()];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error creating repositories:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  Company.prototype.createSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.session.insertSessionsData()];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error creating sessions:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  Company.prototype.getSessionsFromDatabase = function () {
    return __awaiter(this, void 0, void 0, function () {
      var dbConnection, query, rows, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, DB_1.DBManager.getDatabase()];
          case 1:
            dbConnection = _a.sent();
            query = "SELECT * FROM Sessions WHERE company_id = ?";
            return [4 /*yield*/, dbConnection.query(query, [this.company_id])];
          case 2:
            rows = _a.sent()[0];
            dbConnection.end();
            return [2 /*return*/, rows];
          case 3:
            error_3 = _a.sent();
            console.error(
              "Error retrieving sessions from the database:",
              error_3
            );
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  Company.prototype.getRepositoriesFromDatabase = function () {
    return __awaiter(this, void 0, void 0, function () {
      var dbConnection, query, rows, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, DB_1.DBManager.getDatabase()];
          case 1:
            dbConnection = _a.sent();
            query = "SELECT * FROM Repositories WHERE company_id = ?";
            return [4 /*yield*/, dbConnection.query(query, [this.company_id])];
          case 2:
            rows = _a.sent()[0];
            dbConnection.end();
            return [2 /*return*/, rows];
          case 3:
            error_4 = _a.sent();
            console.error(
              "Error retrieving repositories from the database:",
              error_4
            );
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return Company;
})();
exports.Company = Company;
