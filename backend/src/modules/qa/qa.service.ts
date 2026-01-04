import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';
import { Embedding } from '../../entities/embedding.entity';
import { QAHistory } from '../../entities/qa-history.entity';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class QAService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(QAHistory)
    private qaHistoryRepository: Repository<QAHistory>,
    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async askQuestion(question: string): Promise<{
    answer: string;
    sources: any[];
  }> {
    try {
      // 1. Create embedding for the question
      const questionEmbedding =
        await this.embeddingService.createEmbedding(question);

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
If the answer cannot be found in the context, say "I don't have enough information to answer this question based on the available documents."
Always provide accurate, concise, and helpful answers.`;

    const userPrompt = `Context:
${context}

Question: ${question}

Answer:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || 'No answer generated';
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
