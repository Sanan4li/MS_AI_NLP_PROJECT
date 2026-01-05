import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Ollama } from 'ollama';
import { Repository } from 'typeorm';
import { Embedding } from '../../entities/embedding.entity';
import { QAHistory } from '../../entities/qa-history.entity';
import { EmbeddingService } from '../embedding/embedding.service';
// Keep OpenAI import removed since embeddings are handled by EmbeddingService

@Injectable()
export class QAService {
  private ollama: Ollama;

  constructor(
    @InjectRepository(QAHistory)
    private qaHistoryRepository: Repository<QAHistory>,
    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
  }

  async askQuestion(question: string): Promise<{
    answer: string;
    sources: any[];
  }> {
    try {
      // 1. Create embedding for the question (with query prefix)
      const questionEmbedding = await this.embeddingService.createEmbedding(
        question,
        true,
      );

      // 2. Search for similar embeddings using cosine similarity
      const relevantChunks = await this.searchSimilarEmbeddings(
        questionEmbedding,
        3,
      );

      // 3. Build context from relevant chunks
      const context = relevantChunks
        .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
        .join('\n\n');

      // 4. Generate answer using GPT-4o-mini
      const answer = await this.generateAnswer(question, context);

      // 5. Store Q&A in database
      await this.saveQAHistory(
        question,
        questionEmbedding,
        answer,
        relevantChunks,
      );

      // 6. Return answer and sources
      return {
        answer,
        sources: relevantChunks.map((chunk) => ({
          content: chunk.content,
          document_id: chunk.document_id,
          chunk_index: chunk.chunk_index,
        })),
      };
    } catch (error) {
      console.error('Error in askQuestion:', error);
      throw error;
    }
  }

  private async searchSimilarEmbeddings(
    queryEmbedding: number[],
    topK: number = 3,
  ): Promise<Embedding[]> {
    // Using pgvector's cosine distance operator (<=>)
    const embeddingString = JSON.stringify(queryEmbedding);

    const query = `
      SELECT *
      FROM embeddings
      ORDER BY embedding::vector <=> $1::vector
      LIMIT $2
    `;

    try {
      const results: Embedding[] = await this.embeddingRepository.query(query, [
        embeddingString,
        topK,
      ]);
      return results;
    } catch (error) {
      console.error('Error searching embeddings:', error);
      throw error;
    }
  }

  private async generateAnswer(
    question: string,
    context: string,
  ): Promise<string> {
    const systemPrompt = `You are a helpful assistant that answers questions based on the provided context. 
  If the answer cannot be found in the context, say "I can only answer questions about UET Lahore's departments and academic programs."`;

    const userPrompt = `Context:
  ${context}
  
  Question: ${question}
  
  Answer:`;

    try {
      const response = await this.ollama.chat({
        model: 'gemma3:4b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        options: {
          temperature: 0.7,
          num_predict: 500, // equivalent to max_tokens
        },
      });

      return response.message.content || 'No answer generated';
    } catch (error) {
      console.error('Error generating answer:', error);
      throw error;
    }
  }

  private async saveQAHistory(
    question: string,
    questionEmbedding: number[],
    answer: string,
    sources: any[],
  ): Promise<void> {
    const qaHistory = this.qaHistoryRepository.create({
      question,
      question_embedding: JSON.stringify(questionEmbedding),
      answer,
      source_chunks: sources,
    });

    await this.qaHistoryRepository.save(qaHistory);
  }

  async getHistory(limit: number = 10): Promise<QAHistory[]> {
    return await this.qaHistoryRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
