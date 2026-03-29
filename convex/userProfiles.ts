import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getClerkUserId } from "./auth";

export const getOrCreateProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // Update user info from Clerk if changed
      const updates: Record<string, string | undefined> = {};
      if (identity.email && identity.email !== existing.email) updates.email = identity.email;
      if (identity.name && identity.name !== existing.name) updates.name = identity.name;
      if (identity.pictureUrl && identity.pictureUrl !== existing.pictureUrl) updates.pictureUrl = identity.pictureUrl;
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      return existing;
    }

    // Check if this is the first user (make them admin)
    const allProfiles = await ctx.db.query("userProfiles").collect();
    const role = allProfiles.length === 0 ? "admin" : "user";

    // Get default credits from config
    const config = await ctx.db.query("creditConfig").first();
    const defaultCredits = config?.defaultNewUserCredits ?? 50;

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      email: identity.email,
      name: identity.name,
      pictureUrl: identity.pictureUrl,
      role,
      credits: defaultCredits,
      totalMessagesCount: 0,
      totalCreditsUsed: 0,
    });

    return await ctx.db.get(profileId);
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getProfileInternal = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const deductCreditsInternal = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Profile not found");
    if (profile.credits < args.amount) throw new Error("Insufficient credits");

    const balanceBefore = profile.credits;
    const balanceAfter = balanceBefore - args.amount;

    await ctx.db.patch(profile._id, {
      credits: balanceAfter,
      totalCreditsUsed: profile.totalCreditsUsed + args.amount,
      totalMessagesCount: profile.totalMessagesCount + 1,
    });

    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "credit_deducted",
      amount: args.amount,
      description: args.description,
      balanceBefore,
      balanceAfter,
    });
  },
});

export const addCreditsAdmin = mutation({
  args: {
    targetUserId: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await getClerkUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();

    if (!adminProfile || adminProfile.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (!targetProfile) throw new Error("Target user profile not found");

    const balanceBefore = targetProfile.credits;
    const balanceAfter = balanceBefore + args.amount;

    await ctx.db.patch(targetProfile._id, { credits: balanceAfter });

    await ctx.db.insert("transactions", {
      userId: args.targetUserId,
      type: "credit_added",
      amount: args.amount,
      description: args.description,
      balanceBefore,
      balanceAfter,
    });
  },
});

export const setUserRole = mutation({
  args: {
    targetUserId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const adminId = await getClerkUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();

    if (!adminProfile || adminProfile.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (!targetProfile) throw new Error("Target user profile not found");
    await ctx.db.patch(targetProfile._id, { role: args.role });
  },
});

export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
