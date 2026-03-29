import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getClerkUserId } from "./auth";

export const upsertCreditConfig = mutation({
  args: {
    creditsPerMessage: v.number(),
    defaultNewUserCredits: v.number(),
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

    const existing = await ctx.db.query("creditConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("creditConfig", args);
    }
  },
});
