import { ConfigService } from '@nestjs/config';
export declare class EmbeddingService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    createEmbedding(text: string): Promise<number[]>;
    createEmbeddings(texts: string[]): Promise<number[][]>;
}
