import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Embedding } from './embedding.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  filepath: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Embedding, (embedding) => embedding.document)
  embeddings: Embedding[];
}
