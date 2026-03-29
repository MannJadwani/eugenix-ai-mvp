import { useState } from "react";
import { toast } from "sonner";

const categories = [
  {
    title: "Breathing Exercises",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    description: "Calm your mind with guided breathing",
    color: "#D4F0ED",
    exercises: [
      { name: "4-7-8 Breathing", duration: "2 min", desc: "Inhale 4s, hold 7s, exhale 8s. A natural tranquilizer for the nervous system." },
      { name: "Box Breathing", duration: "3 min", desc: "Equal counts of inhaling, holding, exhaling, and holding. Used by Navy SEALs for calm." },
      { name: "Deep Belly Breathing", duration: "5 min", desc: "Diaphragmatic breathing to activate your parasympathetic nervous system." },
    ],
  },
  {
    title: "CBT Techniques",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    description: "Reframe thoughts and build resilience",
    color: "#FEEEE6",
    exercises: [
      { name: "Thought Record", duration: "10 min", desc: "Identify negative automatic thoughts and challenge them with evidence." },
      { name: "Cognitive Restructuring", duration: "15 min", desc: "Replace distorted thinking patterns with balanced, realistic thoughts." },
      { name: "Behavioral Activation", duration: "5 min", desc: "Plan enjoyable activities to break the cycle of low mood and withdrawal." },
    ],
  },
  {
    title: "Mindfulness",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    description: "Stay present and grounded",
    color: "#D4F0ED",
    exercises: [
      { name: "Body Scan", duration: "10 min", desc: "Progressive awareness from head to toe, releasing tension in each area." },
      { name: "5-4-3-2-1 Grounding", duration: "3 min", desc: "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste." },
      { name: "Loving Kindness", duration: "8 min", desc: "Send compassion to yourself and others through guided meditation phrases." },
    ],
  },
  {
    title: "Journaling Prompts",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    description: "Express and process your emotions",
    color: "#FEEEE6",
    exercises: [
      { name: "Gratitude List", duration: "5 min", desc: "Write 3 things you're grateful for today and why they matter to you." },
      { name: "Emotion Mapping", duration: "10 min", desc: "Name your current emotion, where you feel it in your body, and what triggered it." },
      { name: "Future Self Letter", duration: "15 min", desc: "Write a compassionate letter to your future self about your current growth." },
    ],
  },
];

export function ExploreView() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 text-center">Explore</h1>
      </div>

      <div className="px-5 py-5 max-w-3xl mx-auto w-full">
        {/* Intro */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "linear-gradient(135deg, #D4F0ED, #E8F2F0)" }}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <path d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z" fill="#88CCC5" opacity="0.6"/>
              <path d="M20 14C20 14 16 18 16 22C16 26 20 30 20 30C20 30 24 26 24 22C24 18 20 14 20 14Z" fill="#88CCC5" opacity="0.8"/>
              <circle cx="20" cy="22" r="2" fill="#4FA39B"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Wellness Toolkit</h2>
          <p className="text-sm text-gray-400">Evidence-based techniques for emotional well-being</p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in">
              <button
                onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.color }}>
                  {cat.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-700">{cat.title}</p>
                  <p className="text-[11px] text-gray-400">{cat.description}</p>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform flex-shrink-0 ${expandedCategory === i ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedCategory === i && (
                <div className="px-4 pb-4 space-y-2 animate-fade-in">
                  {cat.exercises.map((exercise, j) => (
                    <button
                      key={j}
                      onClick={() => toast.info(`${exercise.name} - ${exercise.desc}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-cream-100 active:scale-[0.98]"
                      style={{ background: `${cat.color}40` }}
                    >
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-700">{exercise.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{exercise.desc}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: cat.color, color: "#2D3748" }}>
                        {exercise.duration}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
