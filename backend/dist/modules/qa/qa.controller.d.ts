import { QAService } from './qa.service';
declare class AskQuestionDto {
    question: string;
}
export declare class QAController {
    private readonly qaService;
    constructor(qaService: QAService);
    askQuestion(askQuestionDto: AskQuestionDto): Promise<{
        error: string;
        success?: undefined;
        question?: undefined;
        answer?: undefined;
        sources?: undefined;
    } | {
        success: boolean;
        question: string;
        answer: string;
        sources: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        question?: undefined;
        answer?: undefined;
        sources?: undefined;
    }>;
    getHistory(limit?: string): Promise<{
        success: boolean;
        history: import("../../entities/qa-history.entity").QAHistory[];
    }>;
}
export {};
