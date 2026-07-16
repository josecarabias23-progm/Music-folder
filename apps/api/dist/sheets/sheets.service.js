"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetsService = void 0;
const common_1 = require("@nestjs/common");
let SheetsService = class SheetsService {
    constructor() {
        this.sheets = [
            { id: 1, title: 'Sinfonía en Do', type: 'pdf', owner: 'Orquesta Nacional' },
            { id: 2, title: 'Concierto para violín', type: 'musicxml', owner: 'Sala de Cámara' },
        ];
    }
    findAll() {
        return this.sheets;
    }
    create(payload) {
        const sheet = { id: Date.now(), ...payload };
        this.sheets.push(sheet);
        return sheet;
    }
};
exports.SheetsService = SheetsService;
exports.SheetsService = SheetsService = __decorate([
    (0, common_1.Injectable)()
], SheetsService);
//# sourceMappingURL=sheets.service.js.map