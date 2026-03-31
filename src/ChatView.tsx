import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface Profile {
  _id: Id<"userProfiles">;
  credits: number;
  role: "user" | "admin";
}

export function ChatView({ profile }: { profile: Profile }) {
  const sessions = useQuery(api.chat.getMySessions) ?? [];
  const createSession = useMutation(api.chat.createSession);
  const deleteSession = useMutation(api.chat.deleteSession);
  const [activeSessionId, setActiveSessionId] = useState<Id<"chatSessions"> | null>(null);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Auto-select the most recent session
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0]._id);
    }
  }, [sessions, activeSessionId]);

  const handleNewSession = async () => {
    const id = await createSession({ title: "New Conversation" });
    setActiveSessionId(id);
    setShowMobileDrawer(false);
  };

  const handleDeleteSession = async (sessionId: Id<"chatSessions">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSessionId === sessionId) setActiveSessionId(null);
    await deleteSession({ sessionId });
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* ===== Desktop Sidebar (always visible on md+) ===== */}
      <aside className="hidden md:flex w-72 lg:w-80 flex-col bg-white/60 backdrop-blur-sm border-r border-gray-100 flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={handleNewSession}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
          >
            + New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-center text-sm p-4 text-gray-400">No conversations yet</p>
          )}
          {sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => setActiveSessionId(session._id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeSessionId === session._id
                  ? "bg-cream-200 text-terracotta-500"
                  : "text-gray-600 hover:bg-cream-100"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-[11px] text-gray-400">{session.messageCount} messages</p>
              </div>
              <button
                onClick={(e) => handleDeleteSession(session._id, e)}
                className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-400 transition-all text-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ===== Main Chat Area ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
          {/* Mobile: toggle drawer button */}
          <button
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* Desktop: spacer */}
          <div className="hidden md:block w-9" />

          <div className="text-center">
            <h1 className="text-base font-bold text-gray-800">Eugenix.AI</h1>
            <p className="text-[10px] font-semibold tracking-widest" style={{ color: "#88CCC5" }}>ALWAYS HERE</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Credits badge (desktop) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#D4F0ED", color: "#4FA39B" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              {profile.credits}
            </div>
            <button
              onClick={handleNewSession}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream-200 transition-colors"
              title="New conversation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Sessions Drawer (overlay) */}
        {showMobileDrawer && (
          <div className="absolute inset-0 z-40 flex md:hidden">
            <div className="w-72 bg-white shadow-elevated flex flex-col animate-fade-in">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Conversations</h2>
                <button onClick={() => setShowMobileDrawer(false)} className="text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <button
                  onClick={handleNewSession}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
                >
                  + New Conversation
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session._id}
                    onClick={() => { setActiveSessionId(session._id); setShowMobileDrawer(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm ${
                      activeSessionId === session._id
                        ? "bg-cream-200 text-terracotta-500 font-medium"
                        : "text-gray-600 hover:bg-cream-100"
                    }`}
                  >
                    <p className="truncate">{session.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{session.messageCount} messages</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-black/20" onClick={() => setShowMobileDrawer(false)} />
          </div>
        )}

        {/* Chat Content */}
        {activeSessionId ? (
          <ChatWindow sessionId={activeSessionId} credits={profile.credits} />
        ) : (
          <WelcomeScreen onNewSession={handleNewSession} />
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ onNewSession }: { onNewSession: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #D4F0ED, #E8F2F0)" }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z" fill="#88CCC5" opacity="0.6"/>
          <path d="M20 12C20 12 10 16 8 22C6 28 12 32 20 32C28 32 34 28 32 22C30 16 20 12 20 12Z" fill="#88CCC5" opacity="0.4"/>
          <path d="M20 14C20 14 16 18 16 22C16 26 20 30 20 30C20 30 24 26 24 22C24 18 20 14 20 14Z" fill="#88CCC5" opacity="0.8"/>
          <circle cx="20" cy="22" r="2" fill="#4FA39B"/>
        </svg>
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Welcome to your safe space</h2>
      <p className="text-sm md:text-base text-gray-500 mb-8 max-w-md leading-relaxed">
        A calm place to explore your thoughts with compassionate AI guidance using CBT and narrative therapy.
      </p>
      <div className="hidden md:grid grid-cols-3 gap-4 mb-8 max-w-lg w-full">
        {[
          { icon: "💭", label: "Reflect on thoughts" },
          { icon: "🌱", label: "Build resilience" },
          { icon: "🤝", label: "Feel understood" },
        ].map((item) => (
          <div key={item.label} className="bg-white/70 rounded-xl p-4 text-center border border-gray-100 shadow-card">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-xs font-medium text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onNewSession}
        className="px-8 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-95 hover:shadow-hover"
        style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
      >
        Start a Conversation
      </button>
    </div>
  );
}

function ChatWindow({ sessionId, credits }: { sessionId: Id<"chatSessions">; credits: number }) {
  const messages = useQuery(api.chat.getSessionMessages, { sessionId }) ?? [];
  const sendMessage = useMutation(api.chat.sendMessage);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isWaitingForResponse =
    messages.length > 0 && messages[messages.length - 1].role === "user";

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const suggestedReplies = lastAssistantMsg ? parseSuggestedReplies(lastAssistantMsg.content) : [];

  const handleSend = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || sending) return;

    if (credits <= 0) {
      toast.error("You've run out of credits. Please recharge to continue.");
      return;
    }

    setSending(true);
    if (!text) setInput("");
    try {
      await sendMessage({ sessionId, content: msgText });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("INSUFFICIENT_CREDITS")) {
        toast.error("Insufficient credits. Please recharge to continue.");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
      if (!text) setInput(msgText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Daily Check-In Banner */}
      {showDailyCheckIn && messages.length === 0 && (
        <div className="flex justify-center pt-4 animate-fade-in">
          <button
            onClick={() => {
              handleSend("I'd like to do a daily check-in. How are we starting today?");
              setShowDailyCheckIn(false);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-card"
            style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Daily Check-In
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-4 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !showDailyCheckIn && (
            <div className="text-center py-12">
              <p className="text-base font-medium text-gray-600">How are you feeling today?</p>
              <p className="text-sm text-gray-400 mt-1">Share what's on your mind. I'm here to listen.</p>
            </div>
          )}
          {messages.length === 0 && showDailyCheckIn && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Tap Daily Check-In to start, or type below</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg._id} role={msg.role} content={msg.role === "assistant" ? stripSuggestedReplies(msg.content) : msg.content} />
          ))}
          {isWaitingForResponse && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Reply Suggestions */}
      {suggestedReplies.length > 0 && !isWaitingForResponse && !sending && (
        <div className="px-4 md:px-8 lg:px-12 pb-2">
          <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto animate-fade-in">
            {suggestedReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSend(reply)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all hover:bg-teal-50 active:scale-95"
                style={{ borderColor: "#88CCC5", color: "#4FA39B" }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-100 px-4 md:px-8 lg:px-12 py-3">
        <div className="max-w-3xl mx-auto">
          {credits <= 0 && (
            <div className="mb-3 px-4 py-2 rounded-xl text-sm text-center" style={{ background: "#FFF5F0", color: "#CD8972" }}>
              Credits depleted. Please recharge to continue chatting.
            </div>
          )}
          <div className="flex items-end gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                rows={1}
                disabled={credits <= 0 || sending}
                className="w-full resize-none rounded-2xl md:rounded-xl px-4 py-2.5 text-sm border border-gray-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-100 outline-none transition-all bg-gray-50 disabled:opacity-50"
                style={{ maxHeight: "120px", color: "#2D3748" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending || credits <= 0}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: input.trim() ? "linear-gradient(135deg, #88CCC5, #6BB8B0)" : "#E2E8F0" }}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="hidden md:block text-xs mt-2 text-center text-gray-400">
            Press Enter to send · Shift+Enter for new line · 1 credit per message
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2.5 animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-5" style={{ background: "linear-gradient(135deg, #D4F0ED, #88CCC5)" }}>
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M20 10C20 10 15 15 15 20C15 25 20 30 20 30C20 30 25 25 25 20C25 15 20 10 20 10Z" fill="#4FA39B" opacity="0.8"/>
            <circle cx="20" cy="20" r="2" fill="#2D6B65"/>
          </svg>
        </div>
      )}
      <div className="max-w-[78%] md:max-w-[65%] lg:max-w-[55%]">
        <p className={`text-[11px] font-medium mb-1 ${isUser ? "text-right" : "text-left"}`} style={{ color: "#A0AEC0" }}>
          {isUser ? "You" : "Eugenix.AI"}
        </p>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          style={isUser
            ? {
                background: "linear-gradient(135deg, #F6C6B6, #FEEEE6)",
                color: "#5A3E36",
                borderBottomRightRadius: "6px",
              }
            : {
                background: "linear-gradient(135deg, #D4F0ED, #E8F2F0)",
                color: "#2D3748",
                borderBottomLeftRadius: "6px",
              }
          }
        >
          {content}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-5" style={{ background: "linear-gradient(135deg, #F6C6B6, #FEEEE6)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2.5 animate-fade-in">
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #D4F0ED, #88CCC5)" }}>
        <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
          <path d="M20 10C20 10 15 15 15 20C15 25 20 30 20 30C20 30 25 25 25 20C25 15 20 10 20 10Z" fill="#4FA39B" opacity="0.8"/>
          <circle cx="20" cy="20" r="2" fill="#2D6B65"/>
        </svg>
      </div>
      <div className="max-w-[78%]">
        <p className="text-[11px] font-medium mb-1" style={{ color: "#A0AEC0" }}>Eugenix.AI</p>
        <div className="px-4 py-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #D4F0ED, #E8F2F0)", borderBottomLeftRadius: "6px" }}>
          <div className="flex gap-1 items-center h-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#88CCC5", animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function parseSuggestedReplies(content: string): string[] {
  const match = content.match(/\[SUGGESTIONS:\s*(.+?)\]/);
  if (!match) return [];
  return match[1].split("|").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean).slice(0, 3);
}

function stripSuggestedReplies(content: string): string {
  return content.replace(/\[SUGGESTIONS:\s*(.+?)\]/, "").trim();
}
