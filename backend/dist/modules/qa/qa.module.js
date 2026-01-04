"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const embedding_entity_1 = require("../../entities/embedding.entity");
const qa_history_entity_1 = require("../../entities/qa-history.entity");
const embedding_module_1 = require("../embedding/embedding.module");
const qa_controller_1 = require("./qa.controller");
const qa_service_1 = require("./qa.service");
let QAModule = class QAModule {
};
exports.QAModule = QAModule;
exports.QAModule = QAModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([qa_history_entity_1.QAHistory, embedding_entity_1.Embedding]),
            config_1.ConfigModule,
            embedding_module_1.EmbeddingModule,
        ],
        controllers: [qa_controller_1.QAController],
        providers: [qa_service_1.QAService],
        exports: [qa_service_1.QAService],
    })
], QAModule);
//# sourceMappingURL=qa.module.js.map