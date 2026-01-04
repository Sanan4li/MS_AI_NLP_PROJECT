import { Embedding } from './embedding.entity';
export declare class Document {
    id: string;
    filename: string;
    filepath: string;
    created_at: Date;
    embeddings: Embedding[];
}
