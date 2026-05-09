# Centramind — Project Handover

This document covers everything required to run, maintain, and deploy the Centramind application.

---

## 1. Product Overview

**Centramind** is an emotional intelligence companion web app. Authenticated users chat with an AI assistant grounded in evidence-based frameworks (Cognitive Behavioral Therapy and narrative therapy). Responses are augmented via Retrieval-Augmented Generation (RAG) over a curated library of emotional-intelligence books.

### Core features
- **Chat** — conversational AI guidance with suggested replies after every response.
- **Explore** — curated content browsing.
- **Insights** — usage and reflection metrics for the user.
- **Profile** — user account management.
- **Credits** — per-message credit accounting; users start with a default allowance.
- **Admin Dashboard** — manage users, credits, and view usage metrics (admin role only).
- **RAG knowledge base** — ingested PDF books drive context-aware responses.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 3 |
| Backend | [Convex](https://convex.dev) (serverless functions + database + vector search) |
| Auth | [Clerk](https://clerk.com) (via `ConvexProviderWithClerk`) |
| AI | OpenAI (`gpt` chat completions + `text-embedding-3-small` for RAG) |
| Hosting | Vercel (frontend), Convex Cloud (backend) |
| Notifications | `sonner` for toast UI |

---

## 3. Repository Structure

```
eugenix.ai_mvp/
├── books/                  # Source PDFs ingested into RAG vector store
├── convex/                 # Backend: functions, schema, auth config
│   ├── schema.ts           # Database tables and indexes
│   ├── auth.ts             # Clerk JWT verification
│   ├── auth.config.ts      # Convex Auth provider config
│   ├── chat.ts             # Chat queries/mutations
│   ├── chatActions.ts      # OpenAI chat + RAG retrieval (server actions)
│   ├── bookChunks.ts       # Vector search for book chunks
│   ├── userProfiles.ts     # Profile CRUD, role/credit management
│   ├── admin.ts            # Admin-only queries (users, metrics)
│   ├── adminMutations.ts   # Admin-only mutations
│   ├── http.ts             # HTTP routes entry
│   └── router.ts           # Custom HTTP routes
├── scripts/
│   └── ingestBooks.ts      # PDF → chunks → embeddings → Convex
├── src/                    # Frontend React app
│   ├── App.tsx             # Root component, sidebar/tab routing
│   ├── ChatView.tsx        # Chat UI
│   ├── ExploreView.tsx
│   ├── InsightsView.tsx
│   ├── ProfileView.tsx
│   ├── CreditsView.tsx
│   ├── AdminDashboard.tsx
│   ├── SignInForm.tsx
│   └── main.tsx            # Clerk + Convex providers
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## 4. Prerequisites

- Node.js ≥ 18 (recommended: latest LTS)
- npm or `bun` (a `bun.lock` is committed; either works)
- Accounts/keys for:
  - **Convex** — backend deployment (https://dashboard.convex.dev)
  - **Clerk** — authentication (https://dashboard.clerk.com)
  - **OpenAI** — API key with access to `gpt` chat models and `text-embedding-3-small`
  - **Vercel** (for production frontend hosting)

---

## 5. Environment Variables

Create a `.env.local` file in the project root with the following keys:

```bash
# Convex
CONVEX_DEPLOY_KEY=<from Convex dashboard>
CONVEX_DEPLOYMENT=<from Convex dashboard, e.g. "dev:proper-capybara-733">
VITE_CONVEX_URL=<Convex deployment URL, e.g. https://proper-capybara-733.convex.cloud>

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=<Clerk publishable key>

# OpenAI
OPENAI_API_KEY=<OpenAI secret key>

# RAG ingestion
INGESTION_SECRET=<any strong random string; gates the ingestion mutation>
```

### Convex environment variables (set via Convex dashboard, **not** in `.env.local`)

These must be configured server-side in the Convex dashboard under **Settings → Environment Variables**:

- `OPENAI_API_KEY` — same OpenAI key as above (used by Convex actions)
- `CLERK_JWT_ISSUER_DOMAIN` — your Clerk Frontend API URL (e.g. `https://<your-app>.clerk.accounts.dev`)
- `INGESTION_SECRET` — same value as in `.env.local`

---

## 6. Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Log in / link Convex deployment
npx convex dev
# (follow the prompts; this populates CONVEX_DEPLOYMENT and VITE_CONVEX_URL)

# 3. Set Convex environment variables (in the Convex dashboard)
#    - OPENAI_API_KEY
#    - CLERK_JWT_ISSUER_DOMAIN
#    - INGESTION_SECRET

# 4. Configure Clerk
#    - Create a Clerk application
#    - Add a JWT template named "convex" (Convex requires this)
#    - Copy the Frontend API URL into CLERK_JWT_ISSUER_DOMAIN
#    - Copy the publishable key into VITE_CLERK_PUBLISHABLE_KEY

# 5. Ingest the book corpus into the vector DB (one-time)
npm run ingest
# Use `npm run ingest:force` to re-ingest existing books

# 6. Start dev servers (frontend + backend in parallel)
npm run dev
```

---

## 7. Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs `vite` (frontend) and `convex dev` (backend) in parallel |
| `npm run dev:frontend` | Vite dev server only |
| `npm run dev:backend` | Convex dev (function watcher + type generation) |
| `npm run build` | Production build of the frontend (`dist/`) |
| `npm run lint` | Type-checks Convex + frontend, runs `convex dev --once`, builds |
| `npm run ingest` | Ingest PDFs from `books/` into the Convex vector index |
| `npm run ingest:force` | Re-ingest even if a book is marked completed |

---

## 8. Database Schema (Convex)

Defined in `convex/schema.ts`.

| Table | Purpose |
|---|---|
| `userProfiles` | Per-user profile, role (`user` / `admin`), credit balance, totals. Indexed by `userId` and `role`. |
| `chatSessions` | Chat session metadata (title, message count). |
| `messages` | Individual user/assistant messages with optional credit cost. |
| `transactions` | Credit ledger: additions, deductions, purchases. |
| `creditConfig` | Global config: `creditsPerMessage`, `defaultNewUserCredits`. |
| `bookChunks` | RAG chunks with 1536-dim embeddings (vector index `by_embedding`). |
| `ingestionLog` | Tracks which books have been ingested. |

---

## 9. Authentication Flow

1. Frontend wraps the app in `ClerkProvider` and `ConvexProviderWithClerk` (`src/main.tsx`).
2. Signed-out users see `SignInForm`. Signed-in users see `AuthenticatedApp`.
3. Convex verifies the Clerk JWT via `convex/auth.config.ts` (provider domain = `CLERK_JWT_ISSUER_DOMAIN`, application ID = `"convex"`).
4. On first sign-in, `userProfiles.getOrCreateProfile` creates a profile with the default credit allowance.

### Promoting a user to admin
There is no UI to bootstrap the first admin. Promote the first admin manually in the Convex dashboard:
- Open the `userProfiles` table.
- Edit the target user's row and change `role` from `"user"` to `"admin"`.
- After that, further admin actions can be performed in the Admin Dashboard.

---

## 10. RAG Pipeline

**Source:** PDFs in `books/` (Emotional Intelligence, Leadership 2.0, Retrain Your Brain, Team Emotional Intelligence 2.0).

**Pipeline (`scripts/ingestBooks.ts`):**
1. Extract text via `pdf-parse`.
2. Chunk into ~600-token segments (max 800, 100-token overlap).
3. Embed with OpenAI `text-embedding-3-small` (1536 dims, batched 50/call).
4. Insert into `bookChunks` via authenticated mutation (gated by `INGESTION_SECRET`).
5. Record completion in `ingestionLog`.

**Retrieval (`convex/chatActions.ts` → `generateAIResponse`):**
- Embed user message → vector search top 5 chunks → inject into the system prompt as context → call OpenAI chat completion → parse `[SUGGESTIONS: …]` trailer for reply chips.

To add a new book: drop the PDF into `books/`, add an entry to the `BOOKS` array in `scripts/ingestBooks.ts`, then run `npm run ingest`.

---

## 11. Credits System

- Each user has a `credits` balance on their profile.
- `creditConfig.creditsPerMessage` is deducted per assistant response.
- `creditConfig.defaultNewUserCredits` is granted on first profile creation.
- Admins can grant/deduct credits via the Admin Dashboard (`convex/adminMutations.ts`).
- Every change is logged in `transactions`.

There is currently **no payment integration** — credit top-ups are admin-driven. Adding Stripe (or similar) would mean wiring a webhook into `convex/http.ts` / `convex/router.ts` and creating a `purchase` transaction.

---

## 12. Deployment

### Frontend (Vercel)
- `vercel.json` is already configured (`framework: vite`, SPA rewrite).
- Connect the GitHub repo in Vercel.
- Set the following Vercel environment variables:
  - `VITE_CONVEX_URL`
  - `VITE_CLERK_PUBLISHABLE_KEY`
- Production builds run `vite build` → `dist/`.

### Backend (Convex)
- Deploy via `npx convex deploy` (uses `CONVEX_DEPLOY_KEY`).
- Production environment variables (`OPENAI_API_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `INGESTION_SECRET`) must be set in the Convex production deployment, separate from dev.
- After the first production deploy, run `npm run ingest` against the production deployment (set `VITE_CONVEX_URL` to the prod URL temporarily, or use a separate env file) to populate the prod vector store.

### Clerk
- Add the production frontend domain to Clerk's allowed origins.
- Use Clerk's production instance (separate publishable key) for the live deployment.

---

## 13. Key Operational Notes

- **AI safety prompt** lives in `convex/chatActions.ts` (`SYSTEM_PROMPT`). It enforces non-clinical tone, crisis-helpline guidance, and the suggested-replies format. Edit with care.
- **Vector dimensions** are pinned to 1536 in `schema.ts`. Changing the embedding model means migrating every chunk.
- **Suggested replies** are parsed from the trailer `[SUGGESTIONS: "a" | "b" | "c"]`. Removing this from the prompt will break the reply-chip UI.
- **RAG failures are non-fatal** — if vector retrieval fails, the chat still responds without context (see the try/catch in `generateAIResponse`).
- **Mobile vs desktop nav** — `App.tsx` renders a sidebar on `md+` and a bottom tab bar below `md`. The Admin tab only appears for admins.

---

## 14. Common Maintenance Tasks

| Task | How |
|---|---|
| Add an admin | Edit the user's row in the Convex dashboard, set `role = "admin"` |
| Change credits per message | Edit the `creditConfig` row in the Convex dashboard |
| Re-ingest a book after edits | `npm run ingest:force` |
| Rotate OpenAI key | Update `OPENAI_API_KEY` in `.env.local` AND in Convex dashboard env vars |
| Update system prompt / tone | Edit `SYSTEM_PROMPT` in `convex/chatActions.ts` |
| Add a new tab | Extend `TabType` in `src/App.tsx`, add icon + view component |

---

## 15. Useful Links

- Convex docs: https://docs.convex.dev
- Convex vector search: https://docs.convex.dev/search/vector-search
- Clerk + Convex: https://docs.convex.dev/auth/clerk
- OpenAI API: https://platform.openai.com/docs
- Vite docs: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com/docs

---

## 16. Contact / Handover Notes

- Convex deployment referenced in the original README: `proper-capybara-733` (dev). Provision a separate **production** deployment before going live.
- The `.env.local` file is **not** committed. Request the current secret bundle from the outgoing team or generate fresh credentials per section 5.
- The `dist/` and `node_modules/` directories are build/install artifacts — never commit them; both are produced by `npm install` and `npm run build`.
