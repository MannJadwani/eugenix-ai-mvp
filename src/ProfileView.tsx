import { useQuery } from "convex/react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";

interface ProfileViewProps {
  onNavigate: (tab: "credits" | "admin" | "chat") => void;
}

export function ProfileView({ onNavigate }: ProfileViewProps) {
  const profile = useQuery(api.userProfiles.getMyProfile);
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!profile || !user) return null;

  const menuItems = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      label: "Credit Balance",
      sublabel: `${profile.credits} credits remaining`,
      action: () => onNavigate("credits"),
      bg: "#FFF5F0",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: "Chat History",
      sublabel: `${profile.totalMessagesCount} total messages`,
      action: () => onNavigate("chat"),
      bg: "#F0FAF9",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      label: "Privacy & Security",
      sublabel: "Manage your data",
      action: () => {},
      bg: "#F0FAF9",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      label: "Settings",
      sublabel: "Preferences & notifications",
      action: () => {},
      bg: "#F0FAF9",
    },
  ];

  if (profile.role === "admin") {
    menuItems.push({
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      label: "Admin Dashboard",
      sublabel: "System health & user management",
      action: () => onNavigate("admin"),
      bg: "#FFF5F0",
    });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 text-center">Profile</h1>
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto w-full">
        {/* Profile Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #88CCC5, #6BB8B0)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-0.5">
            {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "User"}
          </h2>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
              style={profile.role === "admin"
                ? { background: "#FEEEE6", color: "#CD8972" }
                : { background: "#D4F0ED", color: "#4FA39B" }
              }
            >
              {profile.role}
            </span>
          </div>
          <p className="text-sm text-gray-400">{profile.credits} credits available</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-8">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white shadow-card hover:shadow-hover transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                <p className="text-[11px] text-gray-400">{item.sublabel}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={() => void signOut()}
          className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Sign Out
        </button>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-300 mt-6">
          Eugenix.AI v1.0 - Your safe space
        </p>
      </div>
    </div>
  );
}
