import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    appearance={{
      variables: {
        colorPrimary: "#CD8972",
        colorTextOnPrimaryBackground: "#FFFFFF",
        colorBackground: "#FFFCFA",
        colorInputBackground: "#FFFFFF",
        colorInputText: "#2D3748",
        borderRadius: "0.75rem",
        fontFamily: "Inter, sans-serif",
      },
    }}
  >
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>,
);
