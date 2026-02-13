# API Examples

Base URL (local): `http://localhost:3001/api`

## Get reference data

Languages

```bash
curl http://localhost:3001/api/languages
```

Voices

```bash
curl http://localhost:3001/api/voices
```

Prompts

```bash
curl http://localhost:3001/api/prompts
```

Models

```bash
curl http://localhost:3001/api/models
```

## Create an agent

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Assistant",
    "description": "Handles inbound sales calls",
    "callType": "inbound",
    "language": "en",
    "voice": "alloy",
    "prompt": "sales",
    "model": "pro",
    "latency": 0.5,
    "speed": 110,
    "callScript": "...",
    "serviceDescription": "...",
    "attachments": [],
    "tools": { "allowHangUp": true, "allowCallback": false, "liveTransfer": false }
  }'
```

## Request upload URL

```bash
curl -X POST http://localhost:3001/api/attachments/upload-url -H "Content-Type: application/json"
```

Response example:

```json
{
  "key": "unique-file-key",
  "signedUrl": "http://localhost:3001/upload/unique-file-key",
  "expiresIn": 3600
}
```

## Upload file to signed URL (PUT)

```bash
curl -X PUT "http://localhost:3001/upload/unique-file-key" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @./path/to/file.pdf
```

## Register attachment

```bash
curl -X POST http://localhost:3001/api/attachments \
  -H "Content-Type: application/json" \
  -d '{ "key": "unique-file-key", "fileName": "file.pdf", "fileSize": 12345, "mimeType": "application/pdf" }'
```

## Initiate test call

```bash
curl -X POST http://localhost:3001/api/agents/<agentId>/test-call \
  -H "Content-Type: application/json" \
  -d '{ "firstName": "John", "lastName": "Doe", "gender": "male", "phoneNumber": "+1234567890" }'
```
