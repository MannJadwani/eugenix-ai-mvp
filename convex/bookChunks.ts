import { v } from "convex/values";
import { mutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// ========== Ingestion Mutations (protected by secret) ==========

/**
 * Insert a batch of book chunks with their embeddings.
 * Protected by INGESTION_SECRET environment variable.
 */
export const insertChunkBatch = mutation({
  args: {
    secret: v.string(),
    chunks: v.array(
      v.object({
        bookTitle: v.string(),
        chunkIndex: v.number(),
        content: v.string(),
        embedding: v.array(v.float64()),
        tokenCount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.INGESTION_SECRET;
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new Error("Unauthorized: Invalid ingestion secret");
    }

    for (const chunk of args.chunks) {
      await ctx.db.insert("bookChunks", chunk);
    }

    return { inserted: args.chunks.length };
  },
});

/**
 * Delete all chunks for a given book (for re-ingestion).
 * Protected by INGESTION_SECRET.
 */
export const deleteBookChunks = mutation({
  args: {
    secret: v.string(),
    bookTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.INGESTION_SECRET;
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new Error("Unauthorized: Invalid ingestion secret");
    }

    const chunks = await ctx.db
      .query("bookChunks")
      .withIndex("by_bookTitle", (q) => q.eq("bookTitle", args.bookTitle))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    return { deleted: chunks.length };
  },
});

/**
 * Log a completed ingestion.
 */
export const logIngestion = mutation({
  args: {
    secret: v.string(),
    bookTitle: v.string(),
    fileName: v.string(),
    totalChunks: v.number(),
    status: v.union(v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.INGESTION_SECRET;
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new Error("Unauthorized: Invalid ingestion secret");
    }

    await ctx.db.insert("ingestionLog", {
      bookTitle: args.bookTitle,
      fileName: args.fileName,
      totalChunks: args.totalChunks,
      status: args.status,
      ingestedAt: Date.now(),
    });
  },
});

/**
 * Get ingestion status for a book.
 */
export const getIngestionStatus = mutation({
  args: {
    secret: v.string(),
    bookTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.INGESTION_SECRET;
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("ingestionLog")
      .withIndex("by_bookTitle", (q) => q.eq("bookTitle", args.bookTitle))
      .order("desc")
      .first();
  },
});

// ========== RAG Retrieval Functions ==========

/**
 * Fetch chunk documents by their IDs (used after vector search).
 */
export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("bookChunks")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return docs.filter(Boolean);
  },
});

/**
 * Perform vector search and return relevant chunks.
 * Called from chatActions during RAG retrieval.
 */
interface RelevantChunk {
  bookTitle: string;
  content: string;
  score: number;
  chunkIndex: number;
}

export const searchRelevantChunks = internalAction({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<RelevantChunk[]> => {
    const limit = args.limit ?? 5;

    // Perform vector search using Convex built-in vector search
    const results = await ctx.vectorSearch("bookChunks", "by_embedding", {
      vector: args.embedding,
      limit,
    });

    if (results.length === 0) return [];

    // Fetch full documents for the matching chunk IDs
    const chunkIds = results.map((r) => r._id);
    const chunkDocs: Array<{ bookTitle: string; content: string; chunkIndex: number } | null> =
      await ctx.runQuery(internal.bookChunks.getChunksByIds, {
        ids: chunkIds,
      });

    // Combine with scores and filter by relevance threshold
    const mapped: RelevantChunk[] = [];
    for (let i = 0; i < chunkDocs.length; i++) {
      const chunk = chunkDocs[i];
      if (chunk && results[i]._score > 0.25) {
        mapped.push({
          bookTitle: chunk.bookTitle,
          content: chunk.content,
          score: results[i]._score,
          chunkIndex: chunk.chunkIndex,
        });
      }
    }
    return mapped;
  },
});
