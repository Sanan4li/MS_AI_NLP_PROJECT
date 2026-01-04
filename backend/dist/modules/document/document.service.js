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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("../../entities/document.entity");
const embedding_entity_1 = require("../../entities/embedding.entity");
let DocumentService = class DocumentService {
    documentRepository;
    embeddingRepository;
    constructor(documentRepository, embeddingRepository) {
        this.documentRepository = documentRepository;
        this.embeddingRepository = embeddingRepository;
    }
    async createDocument(filename, filepath) {
        const document = this.documentRepository.create({
            filename,
            filepath,
        });
        return await this.documentRepository.save(document);
    }
    async createEmbedding(documentId, content, embedding, chunkIndex) {
        const embeddingEntity = this.embeddingRepository.create({
            document_id: documentId,
            content,
            embedding: JSON.stringify(embedding),
            chunk_index: chunkIndex,
        });
        return await this.embeddingRepository.save(embeddingEntity);
    }
    async findAllDocuments() {
        return await this.documentRepository.find({
            relations: ['embeddings'],
        });
    }
    async findDocumentByFilename(filename) {
        return await this.documentRepository.findOne({
            where: { filename },
        });
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(embedding_entity_1.Embedding)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DocumentService);
//# sourceMappingURL=document.service.js.map