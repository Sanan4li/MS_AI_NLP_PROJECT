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
exports.QAController = void 0;
const common_1 = require("@nestjs/common");
const qa_service_1 = require("./qa.service");
class AskQuestionDto {
    question;
}
let QAController = class QAController {
    qaService;
    constructor(qaService) {
        this.qaService = qaService;
    }
    async askQuestion(askQuestionDto) {
        const { question } = askQuestionDto;
        if (!question || question.trim() === '') {
            return {
                error: 'Question is required',
            };
        }
        try {
            const result = await this.qaService.askQuestion(question);
            return {
                success: true,
                question,
                answer: result.answer,
                sources: result.sources,
            };
        }
        catch (error) {
            console.error('Error in askQuestion controller:', error);
            return {
                success: false,
                error: 'Failed to process question',
            };
        }
    }
    async getHistory(limit) {
        const limitNum = limit ? parseInt(limit) : 10;
        const history = await this.qaService.getHistory(limitNum);
        return {
            success: true,
            history,
        };
    }
};
exports.QAController = QAController;
__decorate([
    (0, common_1.Post)('ask'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AskQuestionDto]),
    __metadata("design:returntype", Promise)
], QAController.prototype, "askQuestion", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QAController.prototype, "getHistory", null);
exports.QAController = QAController = __decorate([
    (0, common_1.Controller)('api/qa'),
    __metadata("design:paramtypes", [qa_service_1.QAService])
], QAController);
//# sourceMappingURL=qa.controller.js.map