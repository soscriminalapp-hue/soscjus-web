# Subir a estação

## Nginx

```nginx
server {
  server_name web.soscjus.com.br;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # ⚠️ CRÍTICO — o vídeo da audiência (FinaisJus) passa por aqui
    client_max_body_size    4G;
    proxy_read_timeout      300s;
    proxy_send_timeout      300s;
    proxy_request_buffering off;
  }
}
```

**Sem o `proxy_request_buffering off`**, o Nginx grava o vídeo de 3 GB em
disco **antes** de repassar.

---

## PM2

```bash
npm ci
npm run build
pm2 restart soscjus-estacao || pm2 start npm --name soscjus-estacao -- start
pm2 save
```

---

## CORS: não mexe

O navegador **nunca** fala com `api.soscriminalapp.com.br`.

Ele fala com a própria estação, que repassa **no servidor**:

```
NAVEGADOR          NEXT (servidor)          BACKEND SOSC
    │                    │                        │
    │─ /api/auth/login ─►│                        │
    │                    │─ /api/v1/auth/login ──►│
    │                    │◄─ { accessToken } ─────│
    │◄─ cookie httpOnly ─│  (cifrado AES-256)     │
    │                    │                        │
    │─ /api/sosc/... ───►│─ + Bearer ────────────►│
```

**Nada muda no Fastify.**
