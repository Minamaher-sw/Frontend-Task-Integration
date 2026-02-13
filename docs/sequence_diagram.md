# Sequence Diagram — Upload & Test-Call Flow

This Mermaid sequence diagram shows the client-side orchestration for the 3-step file upload and the test-call workflow.

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant C as Client UI (AgentForm)
  participant API as API Layer (src/lib/api.tsx)
  participant S as Mock Server (json-server)
  participant ST as Storage (signed URL)

  U->>C: Select file / Start test call
  C->>API: getUploadUrl() -> POST /api/attachments/upload-url
  API->>S: POST /api/attachments/upload-url
  S-->>API: { key, signedUrl, expiresIn }
  API-->>C: { key, signedUrl, expiresIn }

  C->>ST: PUT {signedUrl} (file bytes)
  ST-->>C: 200 OK (upload success)

  C->>API: registerAttachment(key,fileName,size,mime)
  API->>S: POST /api/attachments
  S-->>API: { id, key, fileName, fileSize, mimeType }
  API-->>C: Attachment(id)

  Note over C,API: User may save agent now (attachments included)
  C->>API: createAgent(agentPayload)
  API->>S: POST /api/agents
  S-->>API: { id: agentId, ... }
  API-->>C: created agent with id

  Note over C: Test call flow (if requested)
  C->>API: initiateTestCall(agentId, testData)
  API->>S: POST /api/agents/:id/test-call
  S-->>API: { success:true, callId }
  API-->>C: { success:true }
  C-->>U: Show success / call status
```

- Use a Mermaid renderer (VS Code Mermaid preview, GitHub if enabled, or mermaid-cli) to render this diagram.
