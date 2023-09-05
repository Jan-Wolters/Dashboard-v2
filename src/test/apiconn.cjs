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
var axios_1 = require("axios");
var promise_1 = require("mysql2/promise");
var peter_ts_1 = require("./peter.ts");
var processEnv = process.env;
processEnv["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // Disable certificate verification
var AccessTokenManager = /** @class */ (function () {
    function AccessTokenManager(serverURL, port, username, password) {
        this.serverURL = serverURL;
        this.port = port;
        this.username = username;
        this.password = password;
        this.access_token = null;
        this.refresh_token = null;
        this.tokenExpiryTime = null;
    }
    AccessTokenManager.prototype.fetchAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestData, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestData = {
                            grant_type: "password",
                            username: this.username,
                            password: this.password,
                        };
                        return [4 /*yield*/, axios_1.default.post("https://".concat(this.serverURL, ":").concat(this.port, "/api/oauth2/token"), requestData, {
                                headers: {
                                    "Content-Type": "application/json",
                                    "x-api-version": "1.0-rev1",
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.status !== 200) {
                            throw new Error("Failed to fetch access token");
                        }
                        data = response.data;
                        this.access_token = data.access_token;
                        this.refresh_token = data.refresh_token;
                        this.tokenExpiryTime = new Date().getTime() + data.expires_in * 1000;
                        console.log("Access token refreshed: Bearer ".concat(this.access_token));
                        return [2 /*return*/];
                }
            });
        });
    };
    AccessTokenManager.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.access_token || this.tokenExpiryTime <= new Date().getTime())) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchAccessToken()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.access_token];
                }
            });
        });
    };
    return AccessTokenManager;
}());
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var company, companies, _loop_1, _i, companies_1, companyData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                company = new peter_ts_1.Company();
                return [4 /*yield*/, company.getCompanies()];
            case 1:
                companies = _a.sent();
                _loop_1 = function (companyData) {
                    var manager, accessToken, headers, response, _b, _c, _d, data, connection, insertData, _e, _f, record;
                    var _g;
                    return __generator(this, function (_h) {
                        switch (_h.label) {
                            case 0:
                                manager = new AccessTokenManager(companyData.serverURL, companyData.port, companyData.username, companyData.password);
                                return [4 /*yield*/, manager.getAccessToken()];
                            case 1:
                                accessToken = _h.sent();
                                headers = {
                                    Accept: "application/json",
                                    "x-api-version": "1.0-rev1",
                                    Authorization: "Bearer ".concat(accessToken),
                                };
                                _c = (_b = axios_1.default).get;
                                _d = [companyData.apiUrl];
                                _g = {
                                    headers: headers
                                };
                                return [4 /*yield*/, Promise.resolve().then(function () { return require("https"); })];
                            case 2: return [4 /*yield*/, _c.apply(_b, _d.concat([(_g.httpsAgent = new (_h.sent()).Agent({ rejectUnauthorized: false }),
                                        _g)]))];
                            case 3:
                                response = _h.sent();
                                if (response.status !== 200) {
                                    throw new Error("Error fetching JSON data from the API");
                                }
                                data = response.data;
                                return [4 /*yield*/, (0, promise_1.createConnection)(companyData.databaseOptions)];
                            case 4:
                                connection = _h.sent();
                                insertData = function (record) { return __awaiter(void 0, void 0, void 0, function () {
                                    var sql, values;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                sql = "INSERT INTO sessions (id, name, activityId, sessionType, creationTime, endTime, state, progressPercent, resultResult, resultMessage, resultIsCanceled, resourceId, resourceReference, parentSessionId, usn)\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                                values = [
                                                    record.id,
                                                    record.name,
                                                    record.activityId,
                                                    record.sessionType,
                                                    record.creationTime,
                                                    record.endTime,
                                                    record.state,
                                                    record.progressPercent,
                                                    record.result.result,
                                                    record.result.message,
                                                    record.result.isCanceled,
                                                    record.resourceId,
                                                    record.resourceReference,
                                                    record.parentSessionId,
                                                    record.usn,
                                                ];
                                                return [4 /*yield*/, connection.query(sql, values)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                _e = 0, _f = data.data;
                                _h.label = 5;
                            case 5:
                                if (!(_e < _f.length)) return [3 /*break*/, 8];
                                record = _f[_e];
                                return [4 /*yield*/, insertData(record)];
                            case 6:
                                _h.sent();
                                console.log("Inserted record:", record);
                                _h.label = 7;
                            case 7:
                                _e++;
                                return [3 /*break*/, 5];
                            case 8:
                                console.log("Success - ".concat(companyData.name));
                                return [4 /*yield*/, connection.end()];
                            case 9:
                                _h.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, companies_1 = companies;
                _a.label = 2;
            case 2:
                if (!(_i < companies_1.length)) return [3 /*break*/, 5];
                companyData = companies_1[_i];
                return [5 /*yield**/, _loop_1(companyData)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error(error_1);
                console.log("Failed");
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
main();
