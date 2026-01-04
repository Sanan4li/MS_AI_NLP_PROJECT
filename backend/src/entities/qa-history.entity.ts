import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('qa_history')
export class QAHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  question: string;

  @Column('vector', { nullable: true })
  question_embedding: string; // pgvector type

  @Column('text')
  answer: string;

  @Column('jsonb', { nullable: true })
  source_chunks: any;

  @CreateDateColumn()
  created_at: Date;
}
