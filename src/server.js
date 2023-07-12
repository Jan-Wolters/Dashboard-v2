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
var express_1 = require("express");
var mysql2_1 = require("mysql2");
var cors_1 = require("cors");
var app = (0, express_1.default)();
var port = 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
var dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "hallotest",
    waitForConnections: true,
};
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager(config) {
        this.pool = mysql2_1.default.createPool(config);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                console.error("Error connecting to MySQL database:", err);
                return;
            }
            console.log("Connected to MySQL database!");
            connection.release();
        });
    }
    DatabaseManager.prototype.query = function (query, values) {
        var _this = this;
        if (values === void 0) { values = []; }
        return new Promise(function (resolve, reject) {
            _this.pool.query(query, values, function (error, results) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(results);
                }
            });
        });
    };
    return DatabaseManager;
}());
var databaseManager = new DatabaseManager(dbConfig);
app.listen(port, function () {
    console.log("Server listening at http://localhost:".concat(port));
});
app.get("/info", getInfo);
app.post("/companies", saveCompany);
function getInfo(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var companyId, companiesQuery, companiesRows, repositoriesData, _loop_1, _i, companiesRows_1, companiesRow, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    companyId = req.query.companyId;
                    companiesQuery = "\n      SELECT\n        companies.company_id AS company_id,\n        companies.name AS company_name,\n        GROUP_CONCAT(DISTINCT repositories.id) AS repository_ids,\n        GROUP_CONCAT(DISTINCT repositories.name) AS repository_names,\n        GROUP_CONCAT(repositories.capacityGB) AS repository_capacities,\n        GROUP_CONCAT(repositories.freeGB) AS repository_frees,\n        GROUP_CONCAT(repositories.usedSpaceGB) AS repository_usedSpaces,\n        latest_session.session_name AS session_name,\n        latest_session.session_endTime AS session_endTime,\n        latest_session.session_resultResult AS session_resultResult,\n        latest_session.session_resultMessage AS session_resultMessage\n      FROM\n        companies\n      JOIN\n        repositories ON companies.company_id = repositories.company_id\n      LEFT JOIN (\n        SELECT\n          sessions.company_id,\n          sessions.name AS session_name,\n          sessions.endTime AS session_endTime,\n          sessions.resultResult AS session_resultResult,\n          sessions.resultMessage AS session_resultMessage\n        FROM\n          sessions\n        INNER JOIN (\n          SELECT\n            company_id,\n            MAX(endTime) AS max_endTime\n          FROM\n            sessions\n          GROUP BY\n            company_id\n        ) AS latest ON sessions.company_id = latest.company_id AND sessions.endTime = latest.max_endTime\n      ) AS latest_session ON companies.company_id = latest_session.company_id\n      WHERE\n        companies.company_id = ?\n      GROUP BY\n        companies.company_id, companies.name, latest_session.session_name, latest_session.session_endTime, latest_session.session_resultResult, latest_session.session_resultMessage;";
                    return [4 /*yield*/, databaseManager.query(companiesQuery, [
                            companyId,
                        ])];
                case 1:
                    companiesRows = _a.sent();
                    repositoriesData = [];
                    if (Array.isArray(companiesRows)) {
                        _loop_1 = function (companiesRow) {
                            var company_id = companiesRow.company_id;
                            var repositoryIds = companiesRow.repository_ids.split(",");
                            var repositoryNames = companiesRow.repository_names.split(",");
                            var repositoryCapacities = companiesRow.repository_capacities.split(",");
                            var repositoryFrees = companiesRow.repository_frees.split(",");
                            var repositoryUsedSpaces = companiesRow.repository_usedSpaces.split(",");
                            var repositories = repositoryIds.map(function (_, index) { return ({
                                repository_id: Number(repositoryIds[index]),
                                repository_name: repositoryNames[index],
                                repository_capacityGB: parseFloat(repositoryCapacities[index]),
                                repository_freeGB: parseFloat(repositoryFrees[index]),
                                repository_usedSpaceGB: parseFloat(repositoryUsedSpaces[index]),
                            }); });
                            var session = {
                                session_id: companiesRow.session_id,
                                session_name: companiesRow.session_name,
                                session_endTime: companiesRow.session_endTime,
                                session_resultResult: companiesRow.session_resultResult,
                                session_resultMessage: companiesRow.session_resultMessage,
                            };
                            var company = {
                                company_id: company_id,
                                company_name: companiesRow.company_name,
                                repositories: repositories,
                                sessions: [session],
                            };
                            repositoriesData.push(company);
                        };
                        for (_i = 0, companiesRows_1 = companiesRows; _i < companiesRows_1.length; _i++) {
                            companiesRow = companiesRows_1[_i];
                            _loop_1(companiesRow);
                        }
                    }
                    else {
                        console.error("Invalid response from the database. Expected an array.");
                        console.error("Response:", companiesRows);
                        return [2 /*return*/, res.status(500).json({ error: "An error occurred while fetching data." })];
                    }
                    res.json(repositoriesData);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching data:", error_1);
                    res.status(500).json({ error: "An error occurred while fetching data." });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveCompany(req, res) {
    var _a = req.body, name = _a.name, ip = _a.ip, port = _a.port, veaamUsername = _a.veaamUsername, veaamPassword = _a.veaamPassword;
    var query = "INSERT INTO companies (name, ip, port, veaamUsername, veaamPassword) VALUES (?, ?, ?, ?, ?)";
    var values = [name, ip, port, veaamUsername, veaamPassword];
    databaseManager
        .query(query, values)
        .then(function () {
        console.log("Company information saved successfully");
        res.json({ message: "Company information saved successfully" });
    })
        .catch(function (error) {
        console.error("Error executing INSERT query:", error);
        res.status(500).json({ error: "An error occurred while saving company information." });
    });
}
