"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const sheets_controller_1 = require("./sheets/sheets.controller");
const records_controller_1 = require("./records/records.controller");
const instruments_controller_1 = require("./instruments/instruments.controller");
const forums_controller_1 = require("./forums/forums.controller");
const sheets_service_1 = require("./sheets/sheets.service");
const records_service_1 = require("./records/records.service");
const instruments_service_1 = require("./instruments/instruments.service");
const forums_service_1 = require("./forums/forums.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [app_controller_1.AppController, sheets_controller_1.SheetsController, records_controller_1.RecordsController, instruments_controller_1.InstrumentsController, forums_controller_1.ForumsController],
        providers: [app_service_1.AppService, sheets_service_1.SheetsService, records_service_1.RecordsService, instruments_service_1.InstrumentsService, forums_service_1.ForumsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map