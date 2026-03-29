import { query } from "./_generated/server";
import { getClerkUserId } from "./auth";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const adminId = await getClerkUserId(ctx);
    if (!adminId) return null;

    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();

    if (!adminProfile || adminProfile.role !== "admin") return null;

    const profiles = await ctx.db.query("userProfiles").collect();

    return profiles.map((profile) => ({
      ...profile,
      email: profile.email ?? profile.userId,
      name: profile.name ?? null,
    }));
  },
});

export const getUsageMetrics = query({
  args: {},
  handler: async (ctx) => {
    const adminId = await getClerkUserId(ctx);
    if (!adminId) return null;

    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();

    if (!adminProfile || adminProfile.role !== "admin") return null;

    const profiles = await ctx.db.query("userProfiles").collect();
    const messages = await ctx.db.query("messages").collect();
    const transactions = await ctx.db.query("transactions").collect();
    const sessions = await ctx.db.query("chatSessions").collect();

    const totalUsers = profiles.filter((p) => p.role === "user").length;
    const totalMessages = messages.filter((m) => m.role === "user").length;
    const totalCreditsUsed = profiles.reduce((sum, p) => sum + p.totalCreditsUsed, 0);
    const totalCreditsAdded = transactions
      .filter((t) => t.type === "credit_added")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSessions = sessions.length;

    return {
      totalUsers,
      totalMessages,
      totalCreditsUsed,
      totalCreditsAdded,
      totalSessions,
    };
  },
});

export const getCreditConfig = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("creditConfig").first();
  },
});
