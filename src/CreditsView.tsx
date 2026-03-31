import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface CreditsViewProps {
  onBack: () => void;
}

const packages = [
  { name: "Starter", price: 25, credits: 50, popular: false },
  { name: "Pro Tier", price: 100, credits: 250, popular: true, badge: "BEST VALUE" },
  { name: "Enterprise", price: 500, credits: 1500, popular: false },
];

export function CreditsView({ onBack }: CreditsViewProps) {
  const profile = useQuery(api.userProfiles.getMyProfile);
  const transactions = useQuery(api.userProfiles.getMyTransactions) ?? [];
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [showHistory, setShowHistory] = useState(false);

  if (!profile) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-5 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition-colors md:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800">Credit Balance</h1>
        <div className="w-8 md:hidden" />
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto w-full">
        {/* Balance Display */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #FEEEE6, #FCD9C8)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div className="text-5xl font-bold text-gray-800 mb-1">
            {profile.credits}
          </div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Credits Remaining</p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-gray-800">{profile.totalMessagesCount}</p>
            <p className="text-xs text-gray-400 mt-1">Messages Sent</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-gray-800">{profile.totalCreditsUsed}</p>
            <p className="text-xs text-gray-400 mt-1">Credits Used</p>
          </div>
        </div>

        {/* Recharge Packages */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Recharge Packages</h2>
            <span className="text-xs font-semibold" style={{ color: "#88CCC5" }}>Popular Choice</span>
          </div>

          <div className="space-y-3">
            {packages.map((pkg, i) => (
              <button
                key={pkg.name}
                onClick={() => setSelectedPackage(i)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedPackage === i
                    ? "border-terracotta-300 bg-white shadow-card"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">{pkg.name}</p>
                  <p className="text-xl font-bold text-gray-800">${pkg.price.toFixed(2)}</p>
                  <p className="text-[11px] text-gray-400">{pkg.credits} credits</p>
                </div>
                <div className="relative">
                  {pkg.badge && selectedPackage === i && (
                    <span
                      className="absolute -top-6 -right-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white transform rotate-12"
                      style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
                    >
                      {pkg.badge}
                    </span>
                  )}
                  <div
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPackage === i
                        ? "text-white"
                        : "text-white"
                    }`}
                    style={{
                      background: selectedPackage === i
                        ? "linear-gradient(135deg, #CD8972, #E7B19F)"
                        : "linear-gradient(135deg, #88CCC5, #6BB8B0)"
                    }}
                  >
                    {selectedPackage === i ? "Selected" : "Select"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={() => toast.info("Payment integration (Razorpay/Stripe) coming soon!")}
          className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-card mb-6"
          style={{ background: "linear-gradient(135deg, #CD8972, #E7B19F)" }}
        >
          Purchase {packages[selectedPackage].credits} Credits - ${packages[selectedPackage].price.toFixed(2)}
        </button>

        {/* Secure Payment Notice */}
        <div className="bg-white rounded-xl p-4 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#D4F0ED" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4FA39B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">Secure Payment</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            All transactions are encrypted and secured. Credits are added instantly to your Eugenix.AI account upon successful payment.
          </p>
        </div>

        {/* Transaction History */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-base font-bold text-gray-800">Transaction History</h2>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform ${showHistory ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showHistory && (
            <div className="space-y-2 animate-fade-in">
              {transactions.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-white shadow-card">
                  <p className="text-sm text-gray-400">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-card">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={tx.type === "credit_added"
                          ? { background: "#D4F0ED", color: "#4FA39B" }
                          : { background: "#FEEEE6", color: "#CD8972" }
                        }
                      >
                        {tx.type === "credit_added" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{tx.description}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(tx._creationTime).toLocaleDateString()} - Bal: {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={tx.type === "credit_added" ? { color: "#4FA39B" } : { color: "#CD8972" }}
                    >
                      {tx.type === "credit_added" ? "+" : "-"}{tx.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
