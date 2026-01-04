"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_parse_1 = require("pdf-parse");
const app_module_1 = require("../app.module");
const document_service_1 = require("../modules/document/document.service");
const embedding_service_1 = require("../modules/embedding/embedding.service");
function chunkText(text, chunkSize = 1000) {
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= chunkSize) {
            currentChunk += sentence;
        }
        else {
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
async function processPDF(filepath, documentService, embeddingService) {
    console.log(`Processing: ${filepath}`);
    try {
        const dataBuffer = fs.readFileSync(filepath);
        const pdfData = new pdf_parse_1.PDFParse({ data: dataBuffer });
        const text = await pdfData.getText();
        console.log(`Extracted ${text?.text?.length ?? 0} characters from PDF`);
        const filename = path.basename(filepath);
        const existingDoc = await documentService.findDocumentByFilename(filename);
        if (existingDoc) {
            console.log(`Document ${filename} already processed, skipping...`);
            return;
        }
        const document = await documentService.createDocument(filename, filepath);
        console.log(`Created document record: ${document.id}`);
        const chunks = chunkText(text?.text ?? '', 1000);
        console.log(`Created ${chunks.length} chunks`);
        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
            console.log(`Processing chunks ${i + 1} to ${Math.min(i + batchSize, chunks.length)}...`);
            const embeddings = await embeddingService.createEmbeddings(batch);
            for (let j = 0; j < batch.length; j++) {
                await documentService.createEmbedding(document.id, batch[j], embeddings[j], i + j);
            }
        }
        console.log(`✓ Successfully processed ${filename}\n`);
    }
    catch (error) {
        console.error(`Error processing ${filepath}:`, error);
        throw error;
    }
}
async function main() {
    console.log('Starting document ingestion...\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const documentService = app.get(document_service_1.DocumentService);
    const embeddingService = app.get(embedding_service_1.EmbeddingService);
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
//# sourceMappingURL=ingest-documents.js.map