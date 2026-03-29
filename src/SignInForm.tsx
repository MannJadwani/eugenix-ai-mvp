import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none rounded-2xl border-0 bg-transparent p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "rounded-xl border-gray-200 hover:bg-gray-50 transition-all hover:shadow-md font-medium",
    socialButtonsBlockButtonText: "font-medium",
    formButtonPrimary:
      "rounded-xl font-semibold transition-all hover:opacity-90 shadow-md hover:shadow-lg",
    formFieldInput:
      "rounded-xl border-gray-200 focus:border-[#CD8972] focus:ring-[#CD8972]/10 bg-white/80",
    footerActionLink: "text-[#CD8972] hover:text-[#B87060] font-semibold",
    identityPreviewEditButton: "text-[#CD8972]",
    formFieldLabel: "text-gray-600 font-medium text-sm",
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-400 text-xs",
    footer: "hidden",
    internal: "gap-4",
  },
  variables: {
    colorPrimary: "#CD8972",
    borderRadius: "0.75rem",
  },
};

/* ---- SVG Icon Components ---- */
function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD8972" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 4.5 2.8A4 4 0 0 1 20 9a4 4 0 0 1-1.5 3.1A3.5 3.5 0 0 1 20 15a3.5 3.5 0 0 1-2.8 3.4A4 4 0 0 1 13 22h-2a4 4 0 0 1-4.2-3.6A3.5 3.5 0 0 1 4 15a3.5 3.5 0 0 1 1.5-2.9A4 4 0 0 1 4 9a4 4 0 0 1 3.5-4.2A5 5 0 0 1 12 2Z" />
      <path d="M12 2v20" />
      <path d="M8 6c2 1 4 1 4 1" />
      <path d="M8 12c2-1 4-1 4-1" />
      <path d="M16 6c-2 1-4 1-4 1" />
      <path d="M16 12c-2-1-4-1-4-1" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#88CCC5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5l0 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E7B19F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const featureItems = [
  { icon: <BrainIcon />, title: "Evidence-Based", desc: "Guided by CBT & emotional intelligence research" },
  { icon: <HeartIcon />, title: "Always Available", desc: "24/7 compassionate AI support whenever you need" },
  { icon: <ShieldIcon />, title: "Private & Secure", desc: "Your conversations are encrypted and confidential" },
];

export function SignInForm() {
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  return (
    <div className="min-h-screen flex" style={{ background: "#FFFCFA" }}>
      {/* ===== Left Panel — Branding & Features (xl+ only) ===== */}
      <div
        className="hidden xl:flex xl:w-[50%] flex-col justify-between relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #FFF8F3 0%, #FEEEE6 30%, #D4F0ED 70%, #E8F2F0 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20" style={{ background: "#88CCC5" }} />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full opacity-15" style={{ background: "#F6C6B6" }} />
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "#CD8972" }} />
        <div className="absolute -bottom-10 right-1/3 w-64 h-64 rounded-full opacity-10" style={{ background: "#88CCC5" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 xl:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #88CCC5, #6BB8B0)" }}>
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z" fill="white" opacity="0.8"/>
                <path d="M20 14C20 14 16 18 16 22C16 26 20 30 20 30C20 30 24 26 24 22C24 18 20 14 20 14Z" fill="white" opacity="0.9"/>
                <circle cx="20" cy="22" r="2" fill="white"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-800">Eugenix.AI</span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-teal-500">ALWAYS HERE</span>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Your emotional
            <br />
            intelligence
            <br />
            <span style={{ color: "#CD8972" }}>companion.</span>
          </h1>
          <p className="text-base text-gray-500 max-w-md leading-relaxed mb-10">
            A safe, non-clinical space powered by CBT and narrative therapy.
            Reflect, reframe, and grow — at your own pace.
          </p>

          {/* Feature Cards */}
          <div className="space-y-3 max-w-sm">
            {featureItems.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-3.5 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/80 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #FEEEE6, #FFF5F0)" }}>
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial / stat */}
        <div className="relative z-10 px-12 xl:px-16 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#88CCC5", "#F6C6B6", "#CD8972", "#E7B19F"].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Trusted by thousands</p>
              <p className="text-xs text-gray-400">on their wellness journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Right Panel — Auth Form ===== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-10 relative overflow-hidden">
        {/* Decorative elements (visible when left panel is hidden) */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10 xl:hidden" style={{ background: "#88CCC5" }} />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-8 xl:hidden" style={{ background: "#F6C6B6" }} />

        {/* Gradient bg when left panel is hidden */}
        <div className="absolute inset-0 xl:hidden" style={{ background: "linear-gradient(180deg, #FFF8F3 0%, #FEEEE6 50%, #FFF8F3 100%)" }} />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Logo — shown when left panel is hidden (below xl) */}
          <div className="flex flex-col items-center mb-8 xl:hidden">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #88CCC5, #6BB8B0)" }}>
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <path d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z" fill="white" opacity="0.8"/>
                <path d="M20 14C20 14 16 18 16 22C16 26 20 30 20 30C20 30 24 26 24 22C24 18 20 14 20 14Z" fill="white" opacity="0.9"/>
                <circle cx="20" cy="22" r="2" fill="white"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Eugenix.AI</h2>
            <p className="text-xs text-gray-400 tracking-widest font-semibold">ALWAYS HERE</p>
          </div>

          {/* Heading — centered when no left panel, left-aligned when left panel shows */}
          <div className="text-center xl:text-left mb-6 xl:mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {flow === "signIn"
                ? <><span className="xl:hidden">Welcome to your safe space</span><span className="hidden xl:inline">Welcome back</span></>
                : <><span className="xl:hidden">Join your safe space</span><span className="hidden xl:inline">Create your account</span></>
              }
            </h2>
            <p className="text-sm text-gray-500">
              <span className="xl:hidden">A calm, trustworthy space for your emotional wellness.</span>
              <span className="hidden xl:inline">
                {flow === "signIn"
                  ? "Sign in to continue to your safe space"
                  : "Start your gentle journey to mindfulness"
                }
              </span>
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-elevated border border-gray-100/80 p-4 sm:p-6 overflow-hidden">
            {flow === "signIn" ? (
              <SignIn routing="hash" appearance={clerkAppearance} />
            ) : (
              <SignUp routing="hash" appearance={clerkAppearance} />
            )}
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {flow === "signIn" ? "New to Eugenix? " : "Already have an account? "}
            <button
              type="button"
              className="font-semibold hover:underline transition-colors"
              style={{ color: "#CD8972" }}
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Create an account" : "Log in"}
            </button>
          </p>

          <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
            By continuing, you agree to our gentle terms of service
          </p>

          {/* Feature pills — shown when left panel is hidden */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 xl:hidden">
            {["CBT-Guided", "Private & Secure", "24/7 Available"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium border"
                style={{ borderColor: "#D4F0ED", color: "#4FA39B", background: "#F0FAF9" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
