"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentsService = void 0;
const common_1 = require("@nestjs/common");
let InstrumentsService = class InstrumentsService {
    constructor() {
        this.instruments = [
            { id: 'violin', name: 'Violín', family: 'Cuerdas' },
            { id: 'trumpet', name: 'Trompeta', family: 'Viento metal' },
            { id: 'flute', name: 'Flauta', family: 'Viento madera' },
        ];
    }
    findAll() {
        return this.instruments;
    }
};
exports.InstrumentsService = InstrumentsService;
exports.InstrumentsService = InstrumentsService = __decorate([
    (0, common_1.Injectable)()
], InstrumentsService);
//# sourceMappingURL=instruments.service.js.map