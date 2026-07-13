# 2_WEBSITE
## Estação do Advogado (Next.js 14) · v4.0.1

---

## 🎯 A ESTAÇÃO NÃO É O APP NA TELA GRANDE

> **"Advogado que não tem cliente, adianta ter ferramenta?"**

**Não.** Por isso a home foi refeita em **3 eixos, nesta ordem:**

```
1️⃣  PROSPECÇÃO          📡 Plantão · 👤 Convidar
                        "eu ganho cliente"

2️⃣  GESTÃO DO PROCESSO  🔴 Prazos · 📅 Audiências · ⚖️ Movimentações
                        "eu não perco prazo"

3️⃣  GESTÃO DO CLIENTE   👥 Clientes · 💰 Honorários
                        "eu recebo"
```

### ⚠️ Prazo e Audiência são **cards separados**

**Motores diferentes:** um conta dias, o outro marca compromisso.
**Nunca misture.**

### ⚠️ O Plantão é o **primeiro** card

Não é a 3ª aba. Se está desligado, o card **grita**:

> *"Você está invisível. Ninguém te encontra."*

**E NUNCA custa crédito:**
1. **Efeito de rede** — se ele achar que desconta, desliga. O mural esvazia.
   O usuário não acha advogado. **O produto morre.**
2. **Provimento 205** — cobrar por caso recebido é **cobrança por lead**. Vedado.

### ⚠️ Convidar Cliente é **prospecção disfarçada**

> *"Quando ele entrar, o SOSC JUS busca **todos os processos dele** — inclusive
> os que **você não sabia que existiam**. Até os **arquivados**: você pode
> pedir a baixa definitiva."*

O advogado convida quem **já é cliente** num processo.
O cliente entra, a 1ª busca é grátis, e aparecem **10 processos**.

**Ele só sabia de 1.** Os outros 9 são **oportunidade**.

**Um único caso novo paga anos de assinatura.**

### ⚠️ As três fontes de processo

```
1️⃣  MINHA OAB              → onde EU atuo        (Meus Processos)
2️⃣  MEU CLIENTE            → todos os DELE       (Ficha do Cliente)
3️⃣  CONSULTA (pente-fino)  → o que EU busquei    (Consultas)
```

**Todas desaguam no mesmo lugar:** ele **vincula** o que interessa.

| | |
|---|---|
| **Vincular** | o processo entra na lista · **grátis** |
| **Acompanhar** | ele é **avisado** quando mexe · **💎 20/mês** |

**São coisas diferentes.** Pode ter 50 vinculados e acompanhar só 3.

### ⚠️ Os nomes são **idênticos ao app**

| ❌ Errado | ✅ Certo |
|---|---|
| "Buscar Processos" | **"Consulta Processual SOSC"** |

*"Buscar Processos"* dá a impressão de buscar **nos processos dele**.
É o **pente-fino**: até **200 processos** de uma pessoa, no Brasil inteiro.

**As descrições, os "O que você recebe" e a 🇧🇷 também vieram do app.**

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
