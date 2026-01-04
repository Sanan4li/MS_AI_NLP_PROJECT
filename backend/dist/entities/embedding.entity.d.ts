import { Document } from './document.entity';
export declare class Embedding {
    id: string;
    document_id: string;
    content: string;
    embedding: string;
    chunk_index: number;
    created_at: Date;
    document: Document;
}
