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
exports.QAService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ollama_1 = require("ollama");
const typeorm_1 = require("typeorm");
const embedding_service_1 = require("../embedding/embedding.service");
let QAService = class QAService {
    qaHistoryRepository;
    embeddingRepository;
    embeddingService;
    configService;
    ollama;
    constructor(qaHistoryRepository, embeddingRepository, embeddingService, configService) {
        this.qaHistoryRepository = qaHistoryRepository;
        this.embeddingRepository = embeddingRepository;
        this.embeddingService = embeddingService;
        this.configService = configService;
        this.ollama = new ollama_1.Ollama({
            host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        });
    }
    async askQuestion(question) {
        try {
            const questionEmbedding = await this.embeddingService.createEmbedding(question);
            const relevantChunks = await this.searchSimilarEmbeddings(questionEmbedding, 3);
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
    async searchSimilarEmbeddings(queryEmbedding, topK = 3) {
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
            const response = await this.ollama.chat({
                model: 'gemma3:4b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                options: {
                    temperature: 0.7,
                    num_predict: 500,
                },
            });
            return response.message.content || 'No answer generated';
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
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        embedding_service_1.EmbeddingService,
        config_1.ConfigService])
], QAService);
//# sourceMappingURL=qa.service.js.map