import { useQuery, useMutation } from "convex/react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { ChatView } from "./ChatView";
import { AdminDashboard } from "./AdminDashboard";
import { CreditsView } from "./CreditsView";
import { ProfileView } from "./ProfileView";
import { ExploreView } from "./ExploreView";
import { InsightsView } from "./InsightsView";

export default function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
      <SignedOut>
        <SignInForm />
      </SignedOut>
    </>
  );
}

export type TabType = "chat" | "explore" | "insights" | "profile" | "credits" | "admin";

function AuthenticatedApp() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.userProfiles.getMyProfile);
  const getOrCreate = useMutation(api.userProfiles.getOrCreateProfile);
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  useEffect(() => {
    if (loggedInUser) {
      getOrCreate();
    }
  }, [loggedInUser]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #FFF8F3 0%, #FFFCFA 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-teal-300 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-teal-600">Setting up your safe space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(180deg, #FFF8F3 0%, #FFFCFA 100%)" }}>
      {/* Desktop Sidebar Navigation (hidden on mobile) */}
      <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} isAdmin={profile.role === "admin"} credits={profile.credits} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {activeTab === "chat" && <ChatView profile={profile} />}
        {activeTab === "explore" && <ExploreView />}
        {activeTab === "insights" && <InsightsView />}
        {activeTab === "profile" && <ProfileView onNavigate={setActiveTab} />}
        {activeTab === "credits" && <CreditsView onBack={() => setActiveTab("profile")} />}
        {activeTab === "admin" && profile.role === "admin" && <AdminDashboard onBack={() => setActiveTab("profile")} />}
      </main>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// ==================== Desktop Sidebar ====================
function DesktopSidebar({ activeTab, onTabChange, isAdmin, credits }: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin: boolean;
  credits: number;
}) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "chat",
      label: "Chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "explore",
      label: "Explore",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      id: "insights",
      label: "Insights",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "credits",
      label: "Credits",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  if (isAdmin) {
    tabs.push({
      id: "admin",
      label: "Admin",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    });
  }

  return (
    <aside className="hidden md:flex w-60 lg:w-64 flex-col bg-white/80 backdrop-blur-md border-r border-gray-100 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4F0ED, #88CCC5)" }}>
          <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
            <path d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z" fill="#4FA39B" opacity="0.8"/>
            <circle cx="20" cy="22" r="2" fill="#2D6B65"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-800">Eugenix.AI</h1>
          <p className="text-[9px] font-semibold tracking-widest" style={{ color: "#88CCC5" }}>ALWAYS HERE</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "text-terracotta-500 font-semibold"
                  : "text-gray-500 hover:text-gray-700 hover:bg-cream-100"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #FFF5F0, #FEEEE6)" } : {}}
            >
              <span className={isActive ? "text-terracotta-300" : "text-gray-400"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Credits Badge */}
      <div className="px-4 pb-4">
        <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg, #D4F0ED, #E8F2F0)" }}>
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4FA39B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: "#4FA39B" }}>Credits</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{credits}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">remaining</p>
        </div>
      </div>
    </aside>
  );
}

// ==================== Mobile Bottom Nav ====================
function MobileBottomNav({ activeTab, onTabChange }: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "chat",
      label: "Chat",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "explore",
      label: "Explore",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      id: "insights",
      label: "Insights",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-gray-100 shadow-elevated">
        <div className="flex items-center justify-around px-2 pt-2 pb-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id ||
              (tab.id === "profile" && (activeTab === "credits" || activeTab === "admin"));
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all min-w-[56px]"
              >
                <span className={isActive ? "text-terracotta-300" : "text-gray-400"}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? "text-terracotta-300" : "text-gray-400"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
