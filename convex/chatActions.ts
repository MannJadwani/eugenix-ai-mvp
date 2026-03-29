import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Eugenix, a compassionate emotional intelligence assistant. Your role is to provide structured, context-aware emotional support using Cognitive Behavioral Therapy (CBT) and narrative therapy frameworks.

Core principles:
- You are an emotional reflection guide, NOT a therapist or medical professional
- Never diagnose, prescribe, or make medical claims
- Use warm, empathetic, non-clinical language
- Help users identify thought patterns, reframe narratives, and build emotional resilience
- Ask thoughtful, open-ended questions to encourage self-reflection
- Validate feelings before offering perspectives
- Keep responses concise, calm, and supportive (2-4 paragraphs max)
- Sometimes offer breathing exercises or grounding techniques when appropriate
- Draw upon evidence-based emotional intelligence frameworks naturally in your responses

Safety: If a user expresses thoughts of self-harm, crisis, or emergency, gently acknowledge their pain and encourage them to reach out to a crisis helpline or mental health professional immediately.

Tone: Calm, warm, non-judgmental, curious, and hopeful. Avoid clinical jargon.

IMPORTANT: At the end of EVERY response, include exactly 3 short suggested reply options for the user in this exact format:
[SUGGESTIONS: "option 1" | "option 2" | "option 3"]

The suggestions should be natural, conversational responses the user might want to say next. Keep each suggestion under 6 words. Examples:
[SUGGESTIONS: "Yes, let's try breathing" | "Tell me more" | "I'd rather just talk"]
[SUGGESTIONS: "That resonates with me" | "I'm not sure about that" | "Can we go deeper?"]`;

export const generateAIResponse = internalAction({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.string(),
    userMessage: v.string(),
    creditsPerMessage: v.number(),
  },
  handler: async (ctx, args) => {
    // Get recent conversation history for context
    const recentMessages = await ctx.runQuery(
      internal.chat.getSessionMessagesInternal,
      { sessionId: args.sessionId }
    );

    const contextMessages = recentMessages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // ===== RAG: Retrieve relevant book knowledge =====
    let ragContext = "";
    try {
      // Generate embedding for the user's message
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: args.userMessage,
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Search for relevant chunks from the vector DB
      const relevantChunks = await ctx.runAction(
        internal.bookChunks.searchRelevantChunks,
        { embedding: queryEmbedding, limit: 5 }
      );

      if (relevantChunks.length > 0) {
        ragContext = relevantChunks
          .map(
            (c: { bookTitle: string; content: string; score: number }) =>
              `[From "${c.bookTitle}"]: ${c.content}`
          )
          .join("\n\n---\n\n");
      }
    } catch (ragError) {
      // RAG failure should not block the response — just proceed without context
      console.error("RAG retrieval failed:", ragError);
    }

    // ===== Crisis keyword detection =====
    const crisisKeywords = [
      "suicide",
      "kill myself",
      "end my life",
      "self-harm",
      "hurt myself",
      "don't want to live",
    ];
    const hasCrisisKeyword = crisisKeywords.some((kw) =>
      args.userMessage.toLowerCase().includes(kw)
    );

    // ===== Build the system prompt =====
    let systemPrompt = SYSTEM_PROMPT;

    // Inject RAG context if available
    if (ragContext) {
      systemPrompt += `\n\nYou have access to the following knowledge from emotional intelligence and CBT literature. Use these insights to inform and enrich your response when relevant. Do not quote them directly unless the user asks for specific techniques — instead, weave the knowledge naturally into your compassionate guidance:\n\n${ragContext}`;
    }

    if (hasCrisisKeyword) {
      systemPrompt +=
        "\n\nIMPORTANT: The user may be in crisis. Prioritize their safety. Express deep care, validate their pain, and strongly encourage them to contact a crisis helpline (e.g., iCall: 9152987821 in India, or 988 Suicide & Crisis Lifeline in the US). Still include [SUGGESTIONS] but make them supportive and safety-focused.";
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          { role: "system", content: systemPrompt },
          ...contextMessages,
        ],
        max_tokens: 700,
        temperature: 0.7,
      });

      const aiContent =
        response.choices[0].message.content ??
        'I\'m here with you. Could you tell me more about what you\'re experiencing? [SUGGESTIONS: "I\'m feeling overwhelmed" | "Just want to talk" | "Help me relax"]';

      // Save AI response and deduct credits
      await ctx.runMutation(
        internal.chatActions.saveAIResponseAndDeductCredits,
        {
          sessionId: args.sessionId,
          userId: args.userId,
          content: aiContent,
          creditsUsed: args.creditsPerMessage,
        }
      );
    } catch (error) {
      console.error("AI response generation failed:", error);
      await ctx.runMutation(
        internal.chatActions.saveAIResponseAndDeductCredits,
        {
          sessionId: args.sessionId,
          userId: args.userId,
          content:
            'I\'m here to support you. I encountered a brief issue — could you share what\'s on your mind again? [SUGGESTIONS: "Let me try again" | "That\'s okay" | "I\'ll rephrase"]',
          creditsUsed: 0,
        }
      );
    }
  },
});

import { internalMutation } from "./_generated/server";

export const saveAIResponseAndDeductCredits = internalMutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.string(),
    content: v.string(),
    creditsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      userId: args.userId,
      role: "assistant",
      content: args.content,
      creditsUsed: args.creditsUsed,
    });

    if (args.creditsUsed > 0) {
      await ctx.runMutation(internal.userProfiles.deductCreditsInternal, {
        userId: args.userId,
        amount: args.creditsUsed,
        description: "AI conversation message",
      });
    }
  },
});
