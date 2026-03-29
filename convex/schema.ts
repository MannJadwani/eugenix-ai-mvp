import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.string(), // Clerk tokenIdentifier
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    credits: v.number(),
    totalMessagesCount: v.number(),
    totalCreditsUsed: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  chatSessions: defineTable({
    userId: v.string(),
    title: v.string(),
    isActive: v.boolean(),
    messageCount: v.number(),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    sessionId: v.id("chatSessions"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    creditsUsed: v.optional(v.number()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"]),

  transactions: defineTable({
    userId: v.string(),
    type: v.union(v.literal("credit_added"), v.literal("credit_deducted"), v.literal("purchase")),
    amount: v.number(),
    description: v.string(),
    balanceBefore: v.number(),
    balanceAfter: v.number(),
  }).index("by_userId", ["userId"]),

  creditConfig: defineTable({
    creditsPerMessage: v.number(),
    defaultNewUserCredits: v.number(),
  }),

  // ===== RAG Vector Database Tables =====

  bookChunks: defineTable({
    bookTitle: v.string(),
    chunkIndex: v.number(),
    content: v.string(),
    embedding: v.array(v.float64()),
    tokenCount: v.number(),
  })
    .index("by_bookTitle", ["bookTitle"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["bookTitle"],
    }),

  ingestionLog: defineTable({
    bookTitle: v.string(),
    fileName: v.string(),
    totalChunks: v.number(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    ingestedAt: v.number(),
  }).index("by_bookTitle", ["bookTitle"]),
};

export default defineSchema({
  ...applicationTables,
});
