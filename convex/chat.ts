import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getClerkUserId } from "./auth";
import { internal } from "./_generated/api";

export const createSession = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("chatSessions", {
      userId,
      title: args.title,
      isActive: true,
      messageCount: 0,
    });
  },
});

export const getMySessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getSessionMessages = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const getSessionMessagesInternal = internalQuery({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const config = await ctx.db.query("creditConfig").first();
    const creditsPerMessage = config?.creditsPerMessage ?? 1;

    if (profile.credits < creditsPerMessage) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      userId,
      role: "user",
      content: args.content,
    });

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
    });

    await ctx.scheduler.runAfter(0, internal.chatActions.generateAIResponse, {
      sessionId: args.sessionId,
      userId,
      userMessage: args.content,
      creditsPerMessage,
    });

    return null;
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not found");

    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const msg of msgs) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.sessionId);
  },
});
