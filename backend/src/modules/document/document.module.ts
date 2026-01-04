import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../../entities/document.entity';
import { Embedding } from '../../entities/embedding.entity';
import { DocumentService } from './document.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Embedding])],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
