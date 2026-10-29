# KeySmasher — Deployment Architecture

## 1. Split-Service Deployment Model

The architecture decouples the Next.js web application from the persistent real-time socket server to avoid serverless limitations on long-lived WebSocket connections.

```
       +-------------------------+
       |   Vercel / Next.js Host |
       |     (apps/web)          |
       +-------------------------+
                    |
                    | (Users connect via HTTPS)
                    v
       +-------------------------+       +-------------------------------+
       |   Supabase Cloud        |<------| Railway / Render / VPS Host   |
       |  (Postgres & Auth)      |       | (apps/realtime - Socket.IO)   |
       +-------------------------+       +-------------------------------+
```

---

## 2. Environment Configurations
- **Web App**: Only requires public variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SOCKET_SERVER_URL`).
- **Real-Time Service**: Requires `PORT`, `CORS_ORIGIN`, and privileged service keys where authorized. Never expose service keys to the client.
