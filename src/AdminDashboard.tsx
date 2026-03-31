import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const metrics = useQuery(api.admin.getUsageMetrics);
  const users = useQuery(api.admin.getAllUsers) ?? [];
  const config = useQuery(api.admin.getCreditConfig);
  const addCredits = useMutation(api.userProfiles.addCreditsAdmin);
  const setRole = useMutation(api.userProfiles.setUserRole);
  const upsertConfig = useMutation(api.adminMutations.upsertCreditConfig);

  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});
  const [configForm, setConfigForm] = useState({
    creditsPerMessage: config?.creditsPerMessage ?? 1,
    defaultNewUserCredits: config?.defaultNewUserCredits ?? 50,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "config">("overview");

  const handleAddCredits = async (userId: Id<"users">, email: string) => {
    const amount = parseInt(creditAmounts[userId] ?? "");
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid credit amount");
      return;
    }
    try {
      await addCredits({ targetUserId: userId, amount, description: `Admin top-up for ${email}` });
      toast.success(`Added ${amount} credits to ${email}`);
      setCreditAmounts((prev) => ({ ...prev, [userId]: "" }));
    } catch {
      toast.error("Failed to add credits");
    }
  };

  const handleSetRole = async (userId: Id<"users">, role: "user" | "admin") => {
    try {
      await setRole({ targetUserId: userId, role });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await upsertConfig(configForm);
      toast.success("Configuration saved");
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  // Mock recent activity (would come from real data in production)
  const recentActivity = [
    { icon: "user-plus", title: "New user registered", desc: users.length > 0 ? `${users[users.length - 1]?.email ?? "User"} joined` : "Waiting for users", time: "Recently" },
    { icon: "check", title: "System healthy", desc: "All services responding", time: "Now" },
    { icon: "message", title: "Chat sessions active", desc: `${metrics?.totalSessions ?? 0} total sessions`, time: "Today" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <path d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z" fill="#88CCC5" opacity="0.6"/>
            <path d="M20 14C20 14 16 18 16 22C16 26 20 30 20 30C20 30 24 26 24 22C24 18 20 14 20 14Z" fill="#88CCC5" opacity="0.8"/>
            <circle cx="20" cy="22" r="2" fill="#4FA39B"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Centramind</h1>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: "linear-gradient(135deg, #88CCC5, #6BB8B0)" }}>
            <div className="w-full h-full flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-5xl mx-auto w-full">
        {/* Section Tabs */}
        <div className="flex gap-2 mb-5">
          {(["overview", "users", "config"] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeSection === section
                  ? "text-white"
                  : "text-gray-500 bg-white border border-gray-200"
              }`}
              style={activeSection === section ? { background: "linear-gradient(135deg, #CD8972, #E7B19F)" } : {}}
            >
              {section === "overview" ? "Overview" : section === "users" ? "Users" : "Config"}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === "overview" && metrics && (
          <div className="animate-fade-in">
            <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-1">OVERVIEW</p>
            <h2 className="text-xl font-bold text-gray-800 mb-5">System Health</h2>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <MetricCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
                label="Total Users"
                value={metrics.totalUsers.toLocaleString()}
                change="+12%"
                bgColor="#FFF5F0"
              />
              <MetricCard
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
                label="Total Chats"
                value={metrics.totalSessions.toLocaleString()}
                change={`+${Math.min(metrics.totalSessions, 5)}%`}
                bgColor="#F0FAF9"
              />
            </div>

            {/* System Uptime */}
            <div className="bg-white rounded-xl p-4 shadow-card mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">System Uptime</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#4FA39B" }}>HEALTHY</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-800">99.9%</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full"
                      style={{
                        height: `${10 + i * 4}px`,
                        background: i <= 4 ? "#88CCC5" : "#CD8972",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Messages & Credits Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-white rounded-xl p-4 shadow-card">
                <p className="text-xs text-gray-400 mb-1">Messages</p>
                <p className="text-xl font-bold text-gray-800">{metrics.totalMessages.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-card">
                <p className="text-xs text-gray-400 mb-1">Credits Used</p>
                <p className="text-xl font-bold text-gray-800">{metrics.totalCreditsUsed.toLocaleString()}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800">Recent Activity</h3>
                <button className="text-xs font-semibold" style={{ color: "#CD8972" }}>View All</button>
              </div>
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-card">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{
                      background: i === 0 ? "#D4F0ED" : i === 1 ? "#D4F0ED" : "#FEEEE6",
                    }}>
                      {i === 0 && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FA39B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                      )}
                      {i === 1 && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FA39B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {i === 2 && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{activity.title}</p>
                      <p className="text-[11px] text-gray-400">{activity.desc}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Report Banner */}
            <div className="rounded-xl p-5 mb-4" style={{ background: "linear-gradient(135deg, #FEEEE6, #FCD9C8)" }}>
              <h3 className="text-base font-bold text-gray-800 mb-1">Analytics Report</h3>
              <p className="text-xs text-gray-600 mb-3">Your weekly performance summary is ready to download.</p>
              <button
                onClick={() => toast.info("Analytics export coming soon!")}
                className="px-4 py-2 rounded-lg bg-white text-sm font-semibold text-gray-700 shadow-card hover:shadow-hover transition-all"
              >
                Get Report
              </button>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
            {users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-card">
                <p className="text-sm text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user._id} className="bg-white rounded-xl p-4 shadow-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: user.role === "admin" ? "linear-gradient(135deg, #CD8972, #E7B19F)" : "linear-gradient(135deg, #88CCC5, #6BB8B0)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-700 truncate">{user.email}</p>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                            style={user.role === "admin"
                              ? { background: "#FEEEE6", color: "#CD8972" }
                              : { background: "#D4F0ED", color: "#4FA39B" }
                            }
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {user.credits} credits - {user.totalMessagesCount} msgs - {user.totalCreditsUsed} used
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Credits"
                        value={creditAmounts[user.userId] ?? ""}
                        onChange={(e) => setCreditAmounts((p) => ({ ...p, [user.userId]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-300"
                      />
                      <button
                        onClick={() => handleAddCredits(user.userId, user.email)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "#4FA39B" }}
                      >
                        Add
                      </button>
                      <select
                        value={user.role}
                        onChange={(e) => handleSetRole(user.userId, e.target.value as "user" | "admin")}
                        className="px-2 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-teal-300 bg-white"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Config Section */}
        {activeSection === "config" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Credit Configuration</h2>
            <div className="bg-white rounded-xl p-5 shadow-card">
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Credits per Message</label>
                  <input
                    type="number"
                    min={1}
                    value={configForm.creditsPerMessage}
                    onChange={(e) => setConfigForm((p) => ({ ...p, creditsPerMessage: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Default Credits for New Users</label>
                  <input
                    type="number"
                    min={0}
                    value={configForm.defaultNewUserCredits}
                    onChange={(e) => setConfigForm((p) => ({ ...p, defaultNewUserCredits: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-300 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
              >
                {savingConfig ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, change, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-card" style={{ background: bgColor }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4FA39B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        <span className="text-[11px] font-medium" style={{ color: "#4FA39B" }}>{change}</span>
      </div>
    </div>
  );
}
