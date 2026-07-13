# Instalar

## ⚠️ Não há `package-lock.json` no ZIP

Ele é gerado na **primeira instalação** — e depende do seu registry.

```bash
npm install          # gera o package-lock.json
git add package-lock.json
git commit -m "lock"
```

**Da segunda vez em diante:**

```bash
npm ci               # agora funciona
```

---

## As variáveis

```bash
cp .env.example .env.local
openssl rand -base64 48        # cole em SESSION_SECRET
```

| Variável | O quê |
|---|---|
| `SOSC_BACKEND_URL` | `https://api.soscriminalapp.com.br` ⚠️ **sem** `/api/v1` |
| `SESSION_SECRET` | o `openssl` acima — **obrigatório** |
| `NEXT_PUBLIC_SITE_URL` | `https://web.soscjus.com.br` — ⚠️ **é ela que vai no QR** |
| `FINAISJUS_URL` | `https://finaisjus.soscriminal.com.br` |
| `JURISCREATOR_URL` | `https://juriscreator.soscriminal.com.br` |

---

## Build

```bash
npm run typecheck    # ⚠️ RODE ISTO ANTES. Zero erros.
npm run build
pm2 restart soscjus-estacao || pm2 start npm --name soscjus-estacao -- start
pm2 save
```

---

## ⚠️ Next 14.2.35

A linha 14 tinha **CVE**. Está corrigido no `package.json`.

**Não baixe a versão.**
