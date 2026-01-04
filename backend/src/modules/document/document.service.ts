import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../entities/document.entity';
import { Embedding } from '../../entities/embedding.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
  ) {}

  async createDocument(filename: string, filepath: string): Promise<Document> {
    const document = this.documentRepository.create({
      filename,
      filepath,
    });
    return await this.documentRepository.save(document);
  }

  async createEmbedding(
    documentId: string,
    content: string,
    embedding: number[],
    chunkIndex: number,
  ): Promise<Embedding> {
    const embeddingEntity = this.embeddingRepository.create({
      document_id: documentId,
      content,
      embedding: JSON.stringify(embedding),
      chunk_index: chunkIndex,
    });
    return await this.embeddingRepository.save(embeddingEntity);
  }

  async findAllDocuments(): Promise<Document[]> {
    return await this.documentRepository.find({
      relations: ['embeddings'],
    });
  }

  async findDocumentByFilename(filename: string): Promise<Document | null> {
    return await this.documentRepository.findOne({
      where: { filename },
    });
  }
}
