# Architecture — Olimi Create Agent (Frontend)

This document summarizes the high-level architecture of the Create Agent frontend, the responsibilities of each layer, and the important request flows (notably the 3-step upload and the test-call orchestration).

Files of interest

- `src/lib/api.tsx` — centralized HTTP helpers and multi-step orchestrators (upload flow, create/update agent, test-call)
- `src/lib/interfaces.ts` — TypeScript types used across the UI and API functions
- `src/components/agents/agent-form.tsx` — main orchestration component for the Create Agent page
- `src/components/agents/agents-sections/` — presentational and form section components (BasicSettings, ReferenceData, Tools, etc.)
- `server/middleware.js`, `server/routes.json`, `db.json` — mock backend and custom endpoints used by `json-server`
- `docs/architecture.svg` — visual diagram (high-level components and upload flow)

Architecture overview

- Client (Next.js + React, App Router)
  - Renders the Create Agent UI and manages local form state using `useState` and `useEffect` hooks.
  - Components are split into small, focused sections; the top-level orchestrator is `AgentForm` which composes section components and drives API interactions.

- API layer (client-side)
  - Implemented in `src/lib/api.tsx`.
  - Responsibilities:
    - Provide typed helpers for GET/POST/PUT calls used across the form.
    - Orchestrate multi-step processes (notably the file upload flow).
    - Normalize responses and surface consistent errors via `ApiError` and `handleResponse`.

- Mock backend (json-server)
  - `db.json` provides reference data (languages, voices, prompts, models), attachments and agent records for local development.
  - `server/middleware.js` and `server/routes.json` implement custom mapping and endpoints for uploads/test-call behaviour.

Key flows

1) Reference data loading

- On mount `AgentForm` fetches:
  - `GET /api/languages`
  - `GET /api/voices`
  - `GET /api/prompts`
  - `GET /api/models`
- Each fetch uses its own loading flag in component state and errors are surfaced to the user via `ErrorAlert`.

2) File upload (3-step signed-upload)

- Step A — request signed upload URL
  - Client: `POST /api/attachments/upload-url` (`getUploadUrl()` in `src/lib/api.tsx`).
  - Response: `{ key, signedUrl, expiresIn }`.

- Step B — upload binary
  - Client performs `PUT {signedUrl}` sending the file bytes.
  - This step targets a storage endpoint (mocked in the local server) and is executed by `uploadFileToSignedUrl()`.

- Step C — register attachment
  - Client: `POST /api/attachments` with `key`, `fileName`, `fileSize`, `mimeType`.
  - Response: registered `Attachment` (contains `id`) which is stored in `uploadedAttachments` for inclusion in the agent payload.

Notes on progress reporting

- The implementation tracks upload entries (`UploadingFile`) with statuses: `uploading`, `success`, `error`.
- The actual PUT uses `fetch` (no low-level XHR progress events). The UI shows status and a simple progress bar reflecting optimistic or completed state.

3) Save agent (create/update)

- `handleSaveAgent()` performs client-side validation (via `getRequiredFieldErrors`) then builds the `Agent` payload.
- If no `agentId` exists it uses `POST /api/agents` (`createAgent`); otherwise `PUT /api/agents/:id` (`updateAgent`).
- On create, `agentId` is stored in local state for subsequent updates.

4) Test call orchestration

- `handleStartTestCall()` validates test-call fields, then:
  - Auto-saves the agent if it has not been persisted (calls create flow).
  - Calls `POST /api/agents/:id/test-call` with `{ firstName, lastName, gender, phoneNumber }`.
  - Surface result or errors in UI.

Design rationale and tradeoffs

- Single-page local state
  - Rationale: the Create Agent form is self-contained; using `useState` and prop-driven presentational components keeps the scope small and predictable.
  - Tradeoff: for multi-page cross-entity sharing a global state solution (e.g., React Context or a store) may be considered.

- Central API layer
  - Rationale: isolates HTTP and multi-step logic from UI components, enabling easier testing and reuse.

- TypeScript interfaces
  - Rationale: explicit contracts (`Agent`, `Attachment`, `Language`, `Voice`, etc.) make the implementation robust and easier to refactor.

- Upload orchestration vs. streaming progress
  - Current approach uses `fetch` for the PUT step and updates status at step boundaries. For accurate byte-level progress reporting, switch to `XMLHttpRequest` or use ReadableStream support.

Security & production notes

- Signed-URL pattern in production:
  - Backend should issue provider-signed URLs with minimal privileges and short TTL.
  - Client must validate file types and sizes before requesting signed URL.

- Server-side validation:
  - Client-side validation improves UX but server-side validation is required for consistency and security.

- Rate limiting, authentication and monitoring:
  - Add authentication (JWT or session) to protect agent CRUD and attachment endpoints.
  - Instrument upload and test-call endpoints for monitoring in production.

Scalability & extension points

- Move `src/lib/api.tsx` orchestrators to a shared service layer if other pages need the same flows.
- Replace `json-server` with a lightweight backend (Express/Next API routes) during staging to better mimic production behaviour.
- For large files, consider chunked uploads and resumable uploads (e.g., tus or multipart with ranges).

Visual diagram

- See `docs/architecture.svg` for a visual summary of the components and the 3-step upload flow.

Appendix — quick pointers

- Upload orchestrator: `src/lib/api.tsx` → `uploadFile`, `getUploadUrl`, `uploadFileToSignedUrl`, `registerAttachment`.
- Main form orchestration: `src/components/agents/agent-form.tsx`.
- Mock server behaviour: `server/middleware.js`, `server/routes.json`, `db.json`.

---