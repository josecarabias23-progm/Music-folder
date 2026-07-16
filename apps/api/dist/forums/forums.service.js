"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumsService = void 0;
const common_1 = require("@nestjs/common");
let ForumsService = class ForumsService {
    constructor() {
        this.threads = [
            { id: 1, title: 'Cómo preparar una audición', posts: 4 },
            { id: 2, title: 'Mantenimiento de instrumentos', posts: 2 },
        ];
    }
    findAll() {
        return this.threads;
    }
    create(payload) {
        const thread = { id: Date.now(), title: payload.title, posts: 0 };
        this.threads.push(thread);
        return thread;
    }
};
exports.ForumsService = ForumsService;
exports.ForumsService = ForumsService = __decorate([
    (0, common_1.Injectable)()
], ForumsService);
//# sourceMappingURL=forums.service.js.map