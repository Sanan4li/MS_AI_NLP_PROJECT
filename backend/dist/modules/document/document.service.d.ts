import { Repository } from 'typeorm';
import { Document } from '../../entities/document.entity';
import { Embedding } from '../../entities/embedding.entity';
export declare class DocumentService {
    private documentRepository;
    private embeddingRepository;
    constructor(documentRepository: Repository<Document>, embeddingRepository: Repository<Embedding>);
    createDocument(filename: string, filepath: string): Promise<Document>;
    createEmbedding(documentId: string, content: string, embedding: number[], chunkIndex: number): Promise<Embedding>;
    findAllDocuments(): Promise<Document[]>;
    findDocumentByFilename(filename: string): Promise<Document | null>;
}
