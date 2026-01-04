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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const openai_1 = __importDefault(require("openai"));
const typeorm_2 = require("typeorm");
const embedding_entity_1 = require("../../entities/embedding.entity");
const qa_history_entity_1 = require("../../entities/qa-history.entity");
const embedding_service_1 = require("../embedding/embedding.service");
let QAService = class QAService {
    qaHistoryRepository;
    embeddingRepository;
    embeddingService;
    configService;
    openai;
    constructor(qaHistoryRepository, embeddingRepository, embeddingService, configService) {
        this.qaHistoryRepository = qaHistoryRepository;
        this.embeddingRepository = embeddingRepository;
        this.embeddingService = embeddingService;
        this.configService = configService;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || '',
        });
    }
    async askQuestion(question) {
        try {
            const questionEmbedding = await this.embeddingService.createEmbedding(question);
            const relevantChunks = await this.searchSimilarEmbeddings(questionEmbedding, 5);
            const context = relevantChunks
                .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
                .join('\n\n');
            const answer = await this.generateAnswer(question, context);
            await this.saveQAHistory(question, questionEmbedding, answer, relevantChunks);
            return {
                answer,
                sources: relevantChunks.map((chunk) => ({
                    content: chunk.content,
                    document_id: chunk.document_id,
                    chunk_index: chunk.chunk_index,
                })),
            };
        }
        catch (error) {
            console.error('Error in askQuestion:', error);
            throw error;
        }
    }
    async searchSimilarEmbeddings(queryEmbedding, topK = 5) {
        const embeddingString = JSON.stringify(queryEmbedding);
        const query = `
      SELECT *
      FROM embeddings
      ORDER BY embedding::vector <=> $1::vector
      LIMIT $2
    `;
        try {
            const results = await this.embeddingRepository.query(query, [
                embeddingString,
                topK,
            ]);
            return results;
        }
        catch (error) {
            console.error('Error searching embeddings:', error);
            throw error;
        }
    }
    async generateAnswer(question, context) {
        const systemPrompt = `You are a helpful assistant that answers questions based on the provided context. 
If the answer cannot be found in the context, say "I don't have enough information to answer this question based on the available documents."
Always provide accurate, concise, and helpful answers.`;
        const userPrompt = `Context:
${context}

Question: ${question}

Answer:`;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 500,
            });
            return response.choices[0].message.content || 'No answer generated';
        }
        catch (error) {
            console.error('Error generating answer:', error);
            throw error;
        }
    }
    async saveQAHistory(question, questionEmbedding, answer, sources) {
        const qaHistory = this.qaHistoryRepository.create({
            question,
            question_embedding: JSON.stringify(questionEmbedding),
            answer,
            source_chunks: sources,
        });
        await this.qaHistoryRepository.save(qaHistory);
    }
    async getHistory(limit = 10) {
        return await this.qaHistoryRepository.find({
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
};
exports.QAService = QAService;
exports.QAService = QAService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(qa_history_entity_1.QAHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(embedding_entity_1.Embedding)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        embedding_service_1.EmbeddingService,
        config_1.ConfigService])
], QAService);
//# sourceMappingURL=qa.service.js.map