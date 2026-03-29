import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none border-0 bg-transparent p-0 w-full",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    main: "gap-5 p-10",
    socialButtonsBlockButton:
      "rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all duration-300 py-3 px-6 shadow-sm hover:shadow-md h-auto min-h-[52px]",
    socialButtonsBlockButtonText: "font-medium text-gray-700 text-base",
    formButtonPrimary:
      "rounded-2xl font-semibold py-3 text-base transition-all duration-500 hover:opacity-90 shadow-md hover:shadow-xl bg-[#CD8972] text-white h-auto min-h-[52px]",
    formFieldInput:
      "rounded-2xl border-gray-100 focus:border-[#CD8972] focus:ring-[#CD8972]/20 bg-white/60 backdrop-blur-md h-12 transition-all duration-300",
    footerActionLink:
      "text-[#CD8972] hover:text-[#B87060] font-semibold transition-colors",
    identityPreviewEditButton: "text-[#CD8972]",
    formFieldLabel: "text-gray-500 font-medium text-sm ml-1 mb-1.5",
    dividerLine: "bg-gray-100/80",
    dividerText:
      "text-gray-400 text-xs font-medium uppercase tracking-widest bg-white px-4",
    footer: "hidden",
    internal: "gap-6",
    socialButtons: "gap-4",
    socialButtonsBlockButtonArrow: "hidden",
  },
  variables: {
    colorPrimary: "#CD8972",
    borderRadius: "1rem",
    colorText: "#374151",
    colorBackground: "transparent",
    colorInputBackground: "white",
  },
};

export function SignInForm() {
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#FFFCFA" }}
    >
      {/* --- Ambient Meditative Background --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ background: "#88CCC5" }}
        />
        <div
          className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-15"
          style={{ background: "#F6C6B6" }}
        />
        <div
          className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10"
          style={{ background: "#CD8972" }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 0%, #FFFCFA 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">
        {/* --- Logo Section --- */}
        <div className="mb-12 flex flex-col items-center group">
          <div
            className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-6 transition-transform duration-700 group-hover:rotate-[10deg] shadow-2xl shadow-teal-200/50"
            style={{ background: "linear-gradient(135deg, #88CCC5, #4FA39B)" }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 8C20 8 14 14 14 20C14 26 20 32 20 32C20 32 26 26 26 20C26 14 20 8 20 8Z"
                fill="white"
                opacity="0.8"
              />
              <path
                d="M20 14C20 14 16 18 16 22C16 26 20 30 20 30C20 30 24 26 24 22C24 18 20 14 20 14Z"
                fill="white"
                opacity="0.9"
              />
              <circle cx="20" cy="22" r="2.5" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
            Eugenix.AI
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-4 bg-teal-300" />
            <p className="text-[10px] font-bold tracking-[0.4em] text-teal-600 uppercase">
              Always Here
            </p>
            <span className="h-[1px] w-4 bg-teal-300" />
          </div>
        </div>

        {/* --- Central Auth Container --- */}
        <div className="w-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-[0_32px_64px_-16px_rgba(205,137,114,0.1)] p-8 sm:p-10 transition-all duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {flow === "signIn" ? "Welcome home" : "Start your journey"}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto opacity-80">
              {flow === "signIn"
                ? "Rejoin your calm space for reflection."
                : "A gentle sanctuary for your well-being."}
            </p>
          </div>

          <div className="auth-wrapper flex flex-col items-stretch">
            {flow === "signIn" ? (
              <SignIn routing="hash" appearance={clerkAppearance} />
            ) : (
              <SignUp routing="hash" appearance={clerkAppearance} />
            )}
          </div>
        </div>

        {/* --- Footer Controls --- */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            {flow === "signIn"
              ? "New to our sanctuary? "
              : "Already walking with us? "}
            <button
              type="button"
              className="text-peach-500 hover:text-peach-600 font-bold transition-all hover:underline underline-offset-4"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Create an account" : "Log in"}
            </button>
          </p>

          <div className="flex items-center gap-6 mt-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Private
            </span>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Encrypted
            </span>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Compassionate
            </span>
          </div>
        </div>
      </div>

      {/* Subtle bottom edge fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFCFA] to-transparent z-0 pointer-events-none" />
    </div>
  );
}
