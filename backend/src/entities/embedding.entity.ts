import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity('embeddings')
export class Embedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  document_id: string;

  @Column('text')
  content: string;

  @Column('vector', { nullable: true })
  embedding: string; // pgvector type

  @Column('int')
  chunk_index: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Document, (document) => document.embeddings)
  @JoinColumn({ name: 'document_id' })
  document: Document;
}
