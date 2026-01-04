import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Embedding } from '../../entities/embedding.entity';
import { QAHistory } from '../../entities/qa-history.entity';
import { EmbeddingService } from '../embedding/embedding.service';
export declare class QAService {
    private qaHistoryRepository;
    private embeddingRepository;
    private embeddingService;
    private configService;
    private openai;
    constructor(qaHistoryRepository: Repository<QAHistory>, embeddingRepository: Repository<Embedding>, embeddingService: EmbeddingService, configService: ConfigService);
    askQuestion(question: string): Promise<{
        answer: string;
        sources: any[];
    }>;
    private searchSimilarEmbeddings;
    private generateAnswer;
    private saveQAHistory;
    getHistory(limit?: number): Promise<QAHistory[]>;
}
