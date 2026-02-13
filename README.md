# Frontend Developer Skills Assessment

**Continuous Integration:** GitHub Actions workflow is configured. See `.github/workflows/ci.yml`.

![Architecture diagram](docs/architecture.svg)

Quick links: [API Examples](docs/api_examples.md) · [Mock Database (`db.json`)](db.json)

## Project Overview

This repository features the **Create Agent** page from the Olimi AI dashboard. The UI is fully implemented but currently static—form dropdowns are hardcoded, file uploads are non-persistent, and save/test-call actions are non-functional.

**Objective:** Integrate the static UI with the provided mock API to enable full functionality.

## Technology Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **shadcn/ui** component library
- **Tailwind CSS 4**
- **json-server** (mock API)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

### 3. Launch Mock API Server

```bash
npm run mock-api
```

This starts `json-server` at **http://localhost:3001** with routes under `/api`.

### 4. Start Next.js Development Server

```bash
npm run dev
```

Access **http://localhost:3000** to view the Create Agent page.

> **Note:** Both servers must be running concurrently. Use separate terminal windows or tabs.

## Project Structure

```
├── db.json                          # Mock database (json-server)
├── server/
│   ├── middleware.js                # Custom endpoints (upload, test-call)
│   └── routes.json                  # API route mapping (/api/* → /*)
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── layout.tsx           # Dashboard layout with sidebar
│   │       └── agents/
│   │           └── createAgent/
│   │               └── page.tsx     # Create Agent page
│   └── components/
│       ├── alert/
│       │   ├── error-alert.tsx      # API/network error display
│       │   └── success-alert.tsx    # Success message display
│       ├── agents/
│       │   ├── agent-sections/      # Form sections (BasicSettings, ReferenceData, Tools, etc.)
│       │   │   ├── reference-data-section.tsx  # Dropdowns and file uploads
│       │   │   ├── tools-section.tsx           # Agent tools (hang up, callback, transfer)
│       │   │   └── ...other sections
│       │   └── agent-form.tsx       # ⭐ Main orchestration file
│       ├── ui/                      # shadcn/ui components (do not modify)
│       ├── app-sidebar.tsx          # Sidebar navigation
│       ├── loading-spinner.tsx      # Loading spinner
│       ├── nav-main.tsx             # Main navigation menu
│       └── nav-user.tsx             # User menu
│   ├── lib/
│   │   ├── api.tsx                  # Centralized API helpers
│   │   ├── interfaces.ts            # TypeScript interfaces for API contracts
│   │   ├── error.handle.ts          # HTTP error normalization
│   │   └── utils.ts                 # Validation and helper functions
├── docs/
│   ├── architecture.svg             # Architecture diagram
│   └── api_examples.md              # API usage examples
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI workflow
└── .env.example                     # Environment template
```

Open `http://localhost:3000` (the app redirects to the Create Agent page). Run `mock-api` and `dev` concurrently.

## Project Layout (Quick Reference)

- `db.json` — mock database for `json-server`
- `server/` — custom mock endpoints (`routes.json`, `middleware.js`)
- `src/app/` — layout and routing (`layout.tsx`, `page.tsx`)
- `src/components/agents/` — main UI; `agent-form.tsx` orchestrates logic; section components in `agent-sections/`
- `src/lib/` — core logic and types:
  - [src/lib/api.tsx](src/lib/api.tsx) — API helpers and orchestrators
  - [src/lib/interfaces.ts](src/lib/interfaces.ts) — TypeScript interfaces
  - [src/lib/error.handle.ts](src/lib/error.handle.ts) — HTTP error normalization
  - [src/lib/utils.ts](src/lib/utils.ts) — validation and helpers

Additional resources: `docs/api_examples.md`, `docs/architecture.svg`, `.github/workflows/ci.yml`.

## Application Workflow

- On mount, `agent-form.tsx` fetches reference data: languages, voices, prompts, models (with individual loading states).
- Voice list is filtered by selected language via `filterVoicesByLanguage` in `src/lib/api.tsx`.
- File uploads follow a three-step process managed by `src/lib/api.tsx`:
  1. `POST /attachments/upload-url` → obtain `{ key, signedUrl, expiresIn }`
  2. `PUT {signedUrl}` → upload binary data
  3. `POST /attachments` → register and receive an `id` (used in agent attachments)
- Save flow (`handleSaveAgent`): validates required fields, constructs payload, calls `POST /agents` (or `PUT /agents/:id` for updates). The returned `id` is stored in state.
- Test call (`handleStartTestCall`): validates test data, auto-saves agent if necessary, then calls `POST /agents/:id/test-call` and displays status/errors.

## API Summary

Base URL: `http://localhost:3001/api` (default via `NEXT_PUBLIC_API_BASE_URL`). See `docs/api_examples.md` for usage examples.

- `GET /languages`
- `GET /voices`
- `GET /prompts`
- `GET /models`
- `POST /attachments/upload-url`
- `PUT {signedUrl}`
- `POST /attachments`
- `POST /agents`
- `PUT /agents/:id`
- `POST /agents/:id/test-call`

## Technical Highlights

- Centralized API layer (`src/lib/api.tsx`) abstracts HTTP, error handling, and multi-step flows from UI components.
- Explicit TypeScript interfaces (`src/lib/interfaces.ts`) ensure robust API contracts and type safety.
- Local component state with `useState`/`useEffect` keeps the page self-contained; presentational sections are prop-driven for reusability.
- Client-side validation via `getRequiredFieldErrors` precedes network calls; server-side validation is recommended for production.

## Error Handling & User Experience

- Network errors are normalized by `ApiError` (`src/lib/error.handle.ts`) and presented via clear UI messages.
- Endpoint-specific loading states prevent invalid actions; UI leverages `ErrorAlert` and `SuccessAlert` for feedback.
- Unsaved changes are tracked in `AgentForm`, with a `beforeunload` listener to prevent accidental navigation.

## Code Quality

- Code is modular and focused (API layer, types, UI sections) for readability and testability.
- Reusable components and typed interfaces promote maintainability and minimize runtime errors.

## Key Files

- API & orchestrators: [src/lib/api.tsx](src/lib/api.tsx)
- Types & validation: [src/lib/interfaces.ts](src/lib/interfaces.ts), [src/lib/utils.ts](src/lib/utils.ts)
- Main form: [src/components/agents/agent-form.tsx](src/components/agents/agent-form.tsx)
- Upload UI: [src/components/agents/agents-sections/reference-data-section.tsx](src/components/agents/agents-sections/reference-data-section.tsx)

## Troubleshooting

- Empty dropdowns: Ensure `npm run mock-api` is running and `NEXT_PUBLIC_API_BASE_URL` is set to `http://localhost:3001/api`.
- Upload issues: Check browser console and `server/middleware.js` for mock upload behavior.

## Next Steps (Optional)

- Add CI badge (requires repository slug)
- Open a pull request with these changes
- Implement automated tests (unit & integration) and extend CI

If you require any of the above enhancements (badge, PR, tests), please let me know.

