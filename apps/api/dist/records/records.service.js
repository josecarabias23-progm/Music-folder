"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
let RecordsService = class RecordsService {
    constructor() {
        this.records = [
            { id: 1, title: 'Ensayo de primavera', artist: 'Orquesta Municipal', date: '2025-04-12' },
            { id: 2, title: 'Música de cámara', artist: 'Coro Juvenil', date: '2025-06-01' },
        ];
    }
    findAll() {
        return this.records;
    }
    create(payload) {
        const record = { id: Date.now(), ...payload };
        this.records.push(record);
        return record;
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)()
], RecordsService);
//# sourceMappingURL=records.service.js.map