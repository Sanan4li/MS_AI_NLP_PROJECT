import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';
import { AppModule } from '../app.module';
import { DocumentService } from '../modules/document/document.service';
import { EmbeddingService } from '../modules/embedding/embedding.service';

function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

async function processPDF(
  filepath: string,
  documentService: DocumentService,
  embeddingService: EmbeddingService,
): Promise<void> {
  console.log(`Processing: ${filepath}`);

  try {
    // Read PDF file
    const dataBuffer = fs.readFileSync(filepath);
    const pdfData = new PDFParse({ data: dataBuffer });

    const text = await pdfData.getText();
    console.log(`Extracted ${text?.text?.length ?? 0} characters from PDF`);

    // Create document record
    const filename = path.basename(filepath);
    const existingDoc = await documentService.findDocumentByFilename(filename);

    if (existingDoc) {
      console.log(`Document ${filename} already processed, skipping...`);
      return;
    }

    const document = await documentService.createDocument(filename, filepath);
    console.log(`Created document record: ${document.id}`);

    // Chunk the text (reduced size to avoid context length issues with embeddings)
    const chunks = chunkText(text?.text ?? '', 500);
    console.log(`Created ${chunks.length} chunks`);

    // Create embeddings for chunks in batches
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
      console.log(
        `Processing chunks ${i + 1} to ${Math.min(i + batchSize, chunks.length)}...`,
      );

      const embeddings = await embeddingService.createEmbeddings(batch);

      // Save embeddings to database
      for (let j = 0; j < batch.length; j++) {
        await documentService.createEmbedding(
          document.id,
          batch[j],
          embeddings[j],
          i + j,
        );
      }
    }

    console.log(`✓ Successfully processed ${filename}\n`);
  } catch (error) {
    console.error(`Error processing ${filepath}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Starting document ingestion...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const documentService = app.get(DocumentService);
  const embeddingService = app.get(EmbeddingService);

  // Get all PDF files from data directory
  const dataDir = path.join(__dirname, '../../../data');
  const files = fs.readdirSync(dataDir).filter((file) => file.endsWith('.pdf'));

  console.log(`Found ${files.length} PDF files to process\n`);

  for (const file of files) {
    const filepath = path.join(dataDir, file);
    await processPDF(filepath, documentService, embeddingService);
  }

  console.log('Document ingestion completed!');
  await app.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
