# 2_WEBSITE
## Estação do Advogado (Next.js 14)

---

```bash
cp .env.example .env.local
openssl rand -base64 48        # → SESSION_SECRET

npm ci
npm run build
pm2 start npm --name soscjus-estacao -- start
```

---

## ⚠️ Depende do backend B268

A estação lê **`GET /api/v1/creditos/saldo`**.

**Suba o backend (`1_APLICATIVO`) primeiro.** Sem essa rota, o saldo aparece 0.

---

## ⚠️ `lib/creditos.ts` é ESPELHO

Ele **tem que bater** com `backend/src/lib/entitlements.ts`.

Se divergirem, o card mostra um preço e o backend cobra outro — **e o advogado
descobre que foi enganado**.

**Fonte da verdade: o BACKEND.** A web só espelha para mostrar antes do clique.

---

## O token não vai pro navegador

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

**Consequência:** não precisa mexer no CORS do Fastify.

---

## Nginx

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;

  # ⚠️ o vídeo da audiência passa por aqui
  client_max_body_size    4G;
  proxy_read_timeout      300s;
  proxy_request_buffering off;
}
```

Sem `proxy_request_buffering off`, o Nginx grava o vídeo de 3 GB em disco
antes de repassar.

---

Ver `CHECKLIST_JULIANO.md` para o teste de aceite.
