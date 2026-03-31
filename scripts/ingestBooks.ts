/**
 * Book Ingestion Script for Centramind RAG System
 *
 * Extracts text from PDF books, chunks them, generates embeddings via OpenAI,
 * and stores them in the Convex vector database for RAG retrieval.
 *
 * Usage:
 *   npm run ingest              # Ingest all books
 *   npm run ingest -- --force   # Re-ingest even if already done
 *
 * Required environment variables (in .env.local):
 *   VITE_CONVEX_URL    - Convex deployment URL
 *   OPENAI_API_KEY     - OpenAI API key
 *   INGESTION_SECRET   - Secret to authorize ingestion mutations
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Dynamic imports for pdf-parse and openai
const pdfParse = (await import("pdf-parse")).default;
const { default: OpenAI } = await import("openai");

// ===== Configuration =====
const CONVEX_URL = process.env.VITE_CONVEX_URL!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const INGESTION_SECRET = process.env.INGESTION_SECRET!;

if (!CONVEX_URL) throw new Error("Missing VITE_CONVEX_URL in .env.local");
if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY in .env.local");
if (!INGESTION_SECRET) throw new Error("Missing INGESTION_SECRET in .env.local");

const convex = new ConvexHttpClient(CONVEX_URL);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const BOOKS_DIR = path.join(__dirname, "..", "books");
const CHUNK_TARGET_TOKENS = 600; // Target tokens per chunk
const CHUNK_MAX_TOKENS = 800; // Maximum tokens per chunk
const CHUNK_OVERLAP_TOKENS = 100; // Overlap between chunks
const EMBEDDING_BATCH_SIZE = 50; // Chunks per embedding API call
const INSERT_BATCH_SIZE = 5; // Chunks per Convex mutation call

const BOOKS = [
  { file: "EmotionalIntelligence.pdf", title: "Emotional Intelligence" },
  { file: "Leadership 2.0.pdf", title: "Leadership 2.0" },
  { file: "Retrain Your Brain PDF.pdf", title: "Retrain Your Brain" },
  {
    file: "Team Emotional Intelligence 2.0.pdf",
    title: "Team Emotional Intelligence 2.0",
  },
];

// ===== Token Estimation =====
function estimateTokens(text: string): number {
  // Rough approximation: 1 token ~= 4 characters for English text
  return Math.ceil(text.length / 4);
}

// ===== Text Cleaning =====
function cleanText(text: string): string {
  return (
    text
      // Remove page numbers (standalone numbers on their own lines)
      .replace(/^\s*\d+\s*$/gm, "")
      // Normalize whitespace
      .replace(/[ \t]+/g, " ")
      // Fix hyphenated line breaks
      .replace(/(\w)-\n(\w)/g, "$1$2")
      // Normalize newlines (keep paragraph breaks)
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// ===== Text Chunking with Overlap =====
function chunkText(text: string): { content: string; tokenCount: number }[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: { content: string; tokenCount: number }[] = [];

  let currentChunk = "";
  let currentTokens = 0;
  let overlapBuffer = ""; // Text to prepend to the next chunk

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    const paragraphTokens = estimateTokens(trimmedParagraph);

    // If a single paragraph exceeds max, split it by sentences
    if (paragraphTokens > CHUNK_MAX_TOKENS) {
      // First, save the current chunk if non-empty
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          tokenCount: estimateTokens(currentChunk.trim()),
        });
        overlapBuffer = getOverlapText(currentChunk.trim());
        currentChunk = "";
        currentTokens = 0;
      }

      // Split the long paragraph by sentences
      const sentences = trimmedParagraph.match(
        /[^.!?]+[.!?]+[\s]*/g
      ) || [trimmedParagraph];
      let sentenceChunk = overlapBuffer;
      let sentenceTokens = estimateTokens(overlapBuffer);

      for (const sentence of sentences) {
        const sentTokens = estimateTokens(sentence);
        if (
          sentenceTokens + sentTokens > CHUNK_TARGET_TOKENS &&
          sentenceChunk.trim()
        ) {
          chunks.push({
            content: sentenceChunk.trim(),
            tokenCount: estimateTokens(sentenceChunk.trim()),
          });
          overlapBuffer = getOverlapText(sentenceChunk.trim());
          sentenceChunk = overlapBuffer;
          sentenceTokens = estimateTokens(overlapBuffer);
        }
        sentenceChunk += sentence;
        sentenceTokens += sentTokens;
      }

      if (sentenceChunk.trim()) {
        currentChunk = sentenceChunk;
        currentTokens = estimateTokens(sentenceChunk);
      }
      continue;
    }

    // Check if adding this paragraph exceeds target
    if (currentTokens + paragraphTokens > CHUNK_TARGET_TOKENS && currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: estimateTokens(currentChunk.trim()),
      });
      overlapBuffer = getOverlapText(currentChunk.trim());
      currentChunk = overlapBuffer + "\n\n" + trimmedParagraph;
      currentTokens = estimateTokens(overlapBuffer) + paragraphTokens;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmedParagraph;
      currentTokens += paragraphTokens;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      tokenCount: estimateTokens(currentChunk.trim()),
    });
  }

  return chunks;
}

function getOverlapText(text: string): string {
  // Get approximately the last CHUNK_OVERLAP_TOKENS tokens worth of text
  const targetChars = CHUNK_OVERLAP_TOKENS * 4;
  if (text.length <= targetChars) return text;

  const overlap = text.slice(-targetChars);
  // Start from the first complete sentence/paragraph boundary
  const boundaryMatch = overlap.match(/(?:^|[.!?\n])\s+/);
  if (boundaryMatch && boundaryMatch.index !== undefined) {
    return overlap.slice(boundaryMatch.index + boundaryMatch[0].length);
  }
  return overlap;
}

// ===== Batch Embedding Generation =====
async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchNum = Math.floor(i / EMBEDDING_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(texts.length / EMBEDDING_BATCH_SIZE);

    process.stdout.write(
      `    Embedding batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`
    );

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });

    for (const item of response.data) {
      embeddings.push(item.embedding);
    }

    console.log(" done");

    // Rate limit protection
    if (i + EMBEDDING_BATCH_SIZE < texts.length) {
      await sleep(500);
    }
  }

  return embeddings;
}

// ===== Upload chunks to Convex =====
async function uploadChunks(
  bookTitle: string,
  chunks: { content: string; tokenCount: number }[],
  embeddings: number[][]
) {
  for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
    const batch = chunks.slice(i, i + INSERT_BATCH_SIZE).map((chunk, j) => ({
      bookTitle,
      chunkIndex: i + j,
      content: chunk.content,
      embedding: embeddings[i + j],
      tokenCount: chunk.tokenCount,
    }));

    const batchNum = Math.floor(i / INSERT_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / INSERT_BATCH_SIZE);

    process.stdout.write(
      `    Uploading batch ${batchNum}/${totalBatches}...`
    );

    await convex.mutation(api.bookChunks.insertChunkBatch, {
      secret: INGESTION_SECRET,
      chunks: batch,
    });

    console.log(" done");

    // Small delay between mutations
    if (i + INSERT_BATCH_SIZE < chunks.length) {
      await sleep(200);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== Main Ingestion Logic =====
async function ingestBook(
  book: { file: string; title: string },
  force: boolean
) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Processing: ${book.title}`);
  console.log(`File: ${book.file}`);
  console.log("=".repeat(60));

  // Check if already ingested
  if (!force) {
    try {
      const status = await convex.mutation(api.bookChunks.getIngestionStatus, {
        secret: INGESTION_SECRET,
        bookTitle: book.title,
      });
      if (status && status.status === "completed") {
        console.log(
          `  SKIPPED: Already ingested (${status.totalChunks} chunks). Use --force to re-ingest.`
        );
        return;
      }
    } catch {
      // No previous ingestion — proceed
    }
  }

  // Step 1: Read PDF
  const filePath = path.join(BOOKS_DIR, book.file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ERROR: File not found: ${filePath}`);
    return;
  }

  console.log("  Step 1: Extracting text from PDF...");
  const pdfBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = pdfData.text;
  console.log(
    `    Extracted ${rawText.length} characters from ${pdfData.numpages} pages`
  );

  // Step 2: Clean and chunk
  console.log("  Step 2: Cleaning and chunking text...");
  const cleanedText = cleanText(rawText);
  const chunks = chunkText(cleanedText);
  const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
  console.log(
    `    Created ${chunks.length} chunks (~${totalTokens} total tokens)`
  );
  console.log(
    `    Avg chunk size: ${Math.round(totalTokens / chunks.length)} tokens`
  );

  // Step 3: Generate embeddings
  console.log("  Step 3: Generating embeddings via OpenAI...");
  const texts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(texts);
  console.log(`    Generated ${embeddings.length} embeddings (1536 dimensions)`);

  // Step 4: Delete existing chunks (for re-ingestion safety)
  console.log("  Step 4: Clearing existing chunks...");
  const deleteResult = await convex.mutation(api.bookChunks.deleteBookChunks, {
    secret: INGESTION_SECRET,
    bookTitle: book.title,
  });
  console.log(`    Deleted ${deleteResult.deleted} existing chunks`);

  // Step 5: Upload to Convex
  console.log("  Step 5: Uploading chunks to Convex vector DB...");
  await uploadChunks(book.title, chunks, embeddings);

  // Step 6: Log completion
  await convex.mutation(api.bookChunks.logIngestion, {
    secret: INGESTION_SECRET,
    bookTitle: book.title,
    fileName: book.file,
    totalChunks: chunks.length,
    status: "completed",
  });

  console.log(
    `\n  SUCCESS: ${book.title} — ${chunks.length} chunks ingested into vector DB`
  );
}

async function main() {
  const force = process.argv.includes("--force");

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║      Centramind — Book Ingestion Pipeline           ║");
  console.log("║              RAG Vector Database Setup                   ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\nConvex URL: ${CONVEX_URL}`);
  console.log(`Books directory: ${BOOKS_DIR}`);
  console.log(`Force re-ingestion: ${force}`);
  console.log(`Books to process: ${BOOKS.length}`);

  // Check books directory exists
  if (!fs.existsSync(BOOKS_DIR)) {
    console.error(`\nERROR: Books directory not found: ${BOOKS_DIR}`);
    process.exit(1);
  }

  // List available books
  const availableFiles = fs.readdirSync(BOOKS_DIR).filter((f) => f.endsWith(".pdf"));
  console.log(`\nPDF files found: ${availableFiles.join(", ")}`);

  let successCount = 0;
  let failCount = 0;

  for (const book of BOOKS) {
    try {
      await ingestBook(book, force);
      successCount++;
    } catch (error) {
      console.error(`\n  FAILED: ${book.title}`);
      console.error(`  Error: ${error}`);
      failCount++;

      // Log failure
      try {
        await convex.mutation(api.bookChunks.logIngestion, {
          secret: INGESTION_SECRET,
          bookTitle: book.title,
          fileName: book.file,
          totalChunks: 0,
          status: "failed",
        });
      } catch {
        // Ignore logging errors
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("INGESTION COMPLETE");
  console.log(`  Succeeded: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
