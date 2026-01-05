import { ConfigService } from '@nestjs/config';
export declare class EmbeddingService {
    private configService;
    private ollama;
    constructor(configService: ConfigService);
    createEmbedding(text: string, isQuery?: boolean): Promise<number[]>;
    createEmbeddings(texts: string[], isQuery?: boolean): Promise<number[][]>;
}
