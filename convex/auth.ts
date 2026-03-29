import { query, QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

/**
 * Get the authenticated user's identity from Clerk via Convex.
 * Returns the tokenIdentifier (unique per user) or null if not authenticated.
 */
export async function getClerkUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.tokenIdentifier;
}

/**
 * Same helper for action contexts.
 */
export async function getClerkUserIdFromAction(
  ctx: ActionCtx
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.tokenIdentifier;
}

/**
 * Query to get the current logged-in user's identity info from Clerk.
 */
export const loggedInUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      id: identity.tokenIdentifier,
      email: identity.email ?? null,
      name: identity.name ?? null,
      pictureUrl: identity.pictureUrl ?? null,
    };
  },
});
