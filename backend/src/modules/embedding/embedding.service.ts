import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';

@Injectable()
export class EmbeddingService {
  private ollama: Ollama;

  constructor(private configService: ConfigService) {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
  }

  async createEmbedding(
    text: string,
    isQuery: boolean = false,
  ): Promise<number[]> {
    try {
      // Only add the query prefix for search queries, not for document chunks
      const prompt = isQuery
        ? `Represent this sentence for searching relevant passages: ${text}`
        : text;

      const response = await this.ollama.embeddings({
        model: 'mxbai-embed-large',
        prompt: prompt,
      });

      return response.embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  async createEmbeddings(
    texts: string[],
    isQuery: boolean = false,
  ): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];

      // Ollama processes embeddings one at a time
      for (const text of texts) {
        const embedding = await this.createEmbedding(text, isQuery);
        embeddings.push(embedding);
      }

      return embeddings;
    } catch (error) {
      console.error('Error creating embeddings:', error);
      throw error;
    }
  }
}
