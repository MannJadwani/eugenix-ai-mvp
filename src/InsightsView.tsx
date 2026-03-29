import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const moodOptions = [
  { emoji: "😊", label: "Happy", color: "#D4F0ED" },
  { emoji: "😌", label: "Calm", color: "#D4F0ED" },
  { emoji: "😐", label: "Neutral", color: "#FEEEE6" },
  { emoji: "😔", label: "Sad", color: "#FEEEE6" },
  { emoji: "😰", label: "Anxious", color: "#FFF5F0" },
];

export function InsightsView() {
  const profile = useQuery(api.userProfiles.getMyProfile);

  if (!profile) return null;

  // Calculate simple insights from profile data
  const avgMessagesPerSession = profile.totalMessagesCount > 0
    ? Math.round(profile.totalMessagesCount / Math.max(profile.totalCreditsUsed, 1))
    : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 text-center">Insights</h1>
      </div>

      <div className="px-5 py-5 max-w-3xl mx-auto w-full">
        {/* Mood Check */}
        <div className="bg-white rounded-xl p-5 shadow-card mb-5 animate-fade-in">
          <h2 className="text-base font-bold text-gray-800 mb-1">How are you feeling?</h2>
          <p className="text-xs text-gray-400 mb-4">Track your mood to see patterns over time</p>
          <div className="flex justify-between">
            {moodOptions.map((mood) => (
              <button
                key={mood.label}
                className="flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: mood.color }}>
                  {mood.emoji}
                </div>
                <span className="text-[10px] font-medium text-gray-500">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Journey Stats */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">Your Journey</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatBubble value={profile.totalMessagesCount} label="Messages" color="#D4F0ED" textColor="#4FA39B" />
            <StatBubble value={profile.totalCreditsUsed} label="Sessions" color="#FEEEE6" textColor="#CD8972" />
            <StatBubble value={avgMessagesPerSession} label="Avg/Session" color="#D4F0ED" textColor="#4FA39B" />
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl p-5 shadow-card mb-5 animate-fade-in">
          <h2 className="text-sm font-bold text-gray-800 mb-3">This Week's Activity</h2>
          <div className="flex items-end justify-between gap-1 h-24">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const height = Math.max(15, Math.random() * 100);
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${height}%`,
                      background: isToday
                        ? "linear-gradient(180deg, #88CCC5, #6BB8B0)"
                        : "#E8F2F0",
                      minHeight: "8px",
                    }}
                  />
                  <span className={`text-[9px] font-medium ${isToday ? "text-teal-600" : "text-gray-400"}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wellness Tips */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">Wellness Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TipCard
              icon="🌿"
              title="Take a mindful break"
              description="Step away from screens for 5 minutes. Notice your breathing and surroundings."
              bgColor="#D4F0ED"
            />
            <TipCard
              icon="💧"
              title="Stay hydrated"
              description="Dehydration can affect mood and cognition. Aim for 8 glasses of water today."
              bgColor="#FEEEE6"
            />
            <TipCard
              icon="🌙"
              title="Wind down routine"
              description="Start dimming lights 1 hour before bed. Avoid screens to improve sleep quality."
              bgColor="#D4F0ED"
            />
          </div>
        </div>

        {/* Emotional Awareness Card */}
        <div className="rounded-xl p-5 mb-4" style={{ background: "linear-gradient(135deg, #FEEEE6, #FCD9C8)" }}>
          <h3 className="text-base font-bold text-gray-800 mb-1">Emotional Awareness</h3>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Regular check-ins with your emotions help build self-awareness. Try naming your feelings without judgment — it's the first step to understanding them.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#CD8972" }} />
            <span className="text-[10px] font-medium text-gray-500">Powered by CBT principles</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBubble({ value, label, color, textColor }: { value: number; label: string; color: string; textColor: string }) {
  return (
    <div className="rounded-xl p-4 text-center shadow-card" style={{ background: color }}>
      <p className="text-2xl font-bold" style={{ color: textColor }}>{value}</p>
      <p className="text-[10px] font-medium text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function TipCard({ icon, title, description, bgColor }: { icon: string; title: string; description: string; bgColor: string }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-card">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: bgColor }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-0.5">{title}</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
