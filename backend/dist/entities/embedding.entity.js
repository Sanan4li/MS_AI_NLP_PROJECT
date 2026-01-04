"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embedding = void 0;
const typeorm_1 = require("typeorm");
const document_entity_1 = require("./document.entity");
let Embedding = class Embedding {
    id;
    document_id;
    content;
    embedding;
    chunk_index;
    created_at;
    document;
};
exports.Embedding = Embedding;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Embedding.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Embedding.prototype, "document_id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Embedding.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)('vector', { nullable: true }),
    __metadata("design:type", String)
], Embedding.prototype, "embedding", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Embedding.prototype, "chunk_index", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Embedding.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => document_entity_1.Document, (document) => document.embeddings),
    (0, typeorm_1.JoinColumn)({ name: 'document_id' }),
    __metadata("design:type", document_entity_1.Document)
], Embedding.prototype, "document", void 0);
exports.Embedding = Embedding = __decorate([
    (0, typeorm_1.Entity)('embeddings')
], Embedding);
//# sourceMappingURL=embedding.entity.js.map