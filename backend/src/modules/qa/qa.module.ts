import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Embedding } from '../../entities/embedding.entity';
import { QAHistory } from '../../entities/qa-history.entity';
import { EmbeddingModule } from '../embedding/embedding.module';
import { QAController } from './qa.controller';
import { QAService } from './qa.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QAHistory, Embedding]),
    ConfigModule,
    EmbeddingModule,
  ],
  controllers: [QAController],
  providers: [QAService],
  exports: [QAService],
})
export class QAModule {}
