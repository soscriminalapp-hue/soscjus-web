# SOSC JUS — Estação do Advogado

Versão web do SOSC JUS. **Mesma conta, mesmo plano, mesma senha do aplicativo.**

O advogado entra no computador com o login que já usa no celular e trabalha em tela
grande: processos, prazos, plantão, contratos, cobranças, consultas, FinaisJus Pro e
JurisCreator.

---

## A decisão que sustenta tudo

> **A estação não vende. A estação pede pro celular vender.**

Quando a cota de uma consulta acaba, o backend responde **402**. A web **não abre
paywall**. Ela mostra um **QR Code**: o advogado aponta o celular, o app abre já na
tela de pagamento da **Apple** ou do **Google**, ele confirma com a digital — e a tela
do computador **destrava sozinha e refaz a ação pendente**.

Ele não precisa voltar ao computador e clicar de novo.

**Por que assim:** a regra da Apple (§3.1.1) não é sobre *onde* se paga, é sobre *o que
se desbloqueia*. Se a web vendesse algo consumido dentro do app iOS, seria IAP
obrigatório — e rejeição na certa. Aqui **toda venda é IAP**. A Apple e o Google
recebem a comissão de tudo. Zero motivo para reclamar.

---

## Segurança: o token nunca chega ao navegador

```
NAVEGADOR                    NEXT (servidor)              BACKEND SOSC
    │                              │                            │
    │─── POST /api/auth/login ────►│                            │
    │                              │─── /api/v1/auth/login ────►│
    │                              │◄── { accessToken } ────────│
    │◄── Set-Cookie: httpOnly ─────│  (token cifrado no cookie) │
    │                              │                            │
    │─── GET /api/sosc/... ───────►│                            │
    │    (cookie vai sozinho)      │── + Authorization: Bearer ►│
    │◄─────────────────────────────│◄───────────────────────────│
```

O `accessToken` fica **cifrado dentro de um cookie httpOnly** (AES-256-GCM). O
JavaScript da página não consegue lê-lo. Isso elimina a classe inteira de roubo de
token por XSS.

**Consequência prática:** não precisa mexer no CORS do Fastify. O navegador nunca fala
com `api.soscriminalapp.com.br` — só com a própria estação.

---

## Instalar

Node.js **20.11+**

```bash
cp .env.example .env.local     # e preencha
npm install
npm run dev                    # http://localhost:3000
```

### Gerar o `SESSION_SECRET`

```bash
openssl rand -base64 48
```

---

## Variáveis de ambiente

| Variável | Obrigatória | O que é |
|---|---|---|
| `SOSC_BACKEND_URL` | **sim** | `https://api.soscriminalapp.com.br` — **sem** `/api/v1` no fim |
| `SESSION_SECRET` | **sim** | segredo do cookie. `openssl rand -base64 48` |
| `FINAISJUS_URL` | sim* | `https://finaisjus.soscriminal.com.br` |
| `JURISCREATOR_URL` | sim* | `https://juriscreator.soscriminal.com.br` |
| `SESSION_COOKIE` | não | padrão: `soscjus_estacao` |
| `APP_SCHEME` | não | padrão: `soscjus` (deep link do QR) |
| `APP_STORE_URL` | não | link da App Store |
| `PLAY_STORE_URL` | não | link do Google Play |
| `NEXT_PUBLIC_SITE_URL` | não | domínio público da estação |

\* obrigatórias para as telas do FinaisJus e do JurisCreator funcionarem.

> **As chaves de fornecedor (Escavador, DirectData, Anthropic, WhisperX) NÃO entram
> aqui.** Elas continuam onde sempre estiveram: no backend SOSC e no VPS do FinaisJus.
> A estação nunca as vê.

---

## Deploy

### Vercel

1. Importe o repositório
2. Cole as variáveis em *Settings → Environment Variables*
3. Deploy

### VPS (PM2) — junto com os outros serviços

```bash
npm ci
npm run build
pm2 start npm --name soscjus-estacao -- start
pm2 save
```

**Nginx:**

```nginx
server {
  server_name estacao.soscjus.com.br;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # upload de vídeo de audiência (o FinaisJus aceita arquivos grandes)
    client_max_body_size 4G;
    proxy_read_timeout   300s;
    proxy_send_timeout   300s;
    proxy_request_buffering off;   # streaming — não segura o arquivo em disco
  }
}
```

O `proxy_request_buffering off` é importante: sem ele, o Nginx grava o vídeo inteiro
em disco antes de repassar.

---

## O que já está pronto e o que falta

| Tela | Estado |
|---|---|
| **Login** | ✅ ligado no `/auth/login` real, com cookie httpOnly |
| **Início** | ✅ lê as cotas e os contadores reais |
| **Meus Processos** | ✅ lê `/processos/meus-processos` |
| **Prazos e Audiências** | ✅ lê `/meus-prazos` e `/minhas-audiencias` |
| **Consultas** | ✅ as 5, com **402 → QR de compra** funcionando |
| **FinaisJus Pro** | ✅ upload streaming + polling + as 8 abas + DOCX |
| **Clientes** | ✅ lê `/clients` |
| Plantão · Documentos · Assinados · Cobranças · JurisCreator · Relatório · Escritório · Plano | 🔧 tela e rota prontas, falta plugar |

As telas marcadas com 🔧 **já têm o desenho, a rota e o proxy**. Cada uma traz, no
próprio arquivo, a lista dos endpoints que ela precisa consumir.

### Como plugar uma tela

**Leitura (Server Component)** — copie de `app/(app)/processos/page.tsx`:

```ts
import { buscarSosc } from '@/lib/proxy';

const r = await buscarSosc<{ charges?: Charge[] }>('/honorarios/charges');
const lista = r.data?.charges ?? [];
// r.ok === false → mostre o estado de erro. Nunca uma tela em branco.
```

**Ação do usuário (Client Component)** — copie de `app/(app)/consultas/page.tsx`:

```ts
'use client';
import { sosc, ApiError } from '@/lib/api';

try {
  await sosc.post('/honorarios/charges', { clientId, amountCents, method: 'BOLETO' });
} catch (e) {
  if (e instanceof ApiError && e.semCota) setComprar('FEATURE');  // → abre o QR
}
```

---

## Estrutura

```
app/
  api/
    auth/{login,logout,me}/     ← sela o cookie httpOnly
    sosc/[...path]/             ← proxy → api.soscriminalapp.com.br/api/v1/**
    finaisjus/[...path]/        ← proxy → finaisjus.soscriminal.com.br/app/**
    juriscreator/[...path]/     ← proxy → juriscreator.soscriminal.com.br/app/**
    compra/{criar,[id]}/        ← QR de compra avulsa
  (app)/                        ← área logada (guarda de rota no layout)
    inicio/ processos/ agenda/ consultas/ finaisjus/ ...
  login/
lib/
  env.ts       ← variáveis, com falha alta se faltar alguma
  session.ts   ← cookie httpOnly cifrado (jose)
  proxy.ts     ← a ponte servidor→servidor
  api.ts       ← cliente do navegador (só fala com /api/*)
  compra.ts    ← pedidos de compra por QR
components/
  Shell · Card · Compra · Cabecalho · Secao · Grade · Icon
middleware.ts  ← sem cookie → /login
```

---

## FinaisJus: por que o vídeo sobe inteiro

O advogado manda o **vídeo do PJe direto**. Não extraímos o áudio no navegador.

**Motivo:** o `ffmpeg` do Linux é mais confiável que a Web Audio API, e o upload passa
em **streaming** pelo proxy — um arquivo de 3 GB nunca é carregado na memória do Next.

No VPS roda o **WhisperX**, e não a API da OpenAI. A diferença é decisiva:

| | Transcreve | Sabe **quem** falou |
|---|---|---|
| API da OpenAI | ✅ | ❌ |
| **WhisperX** (Whisper + wav2vec2 + pyannote) | ✅ | ✅ |

Sem saber quem falou, **não existe cruzamento de depoimento**. E sem cruzar depoimento,
não existe contradição encontrada:

```
[SPEAKER_01] 00:14:38 — "Vi sim, doutor, ele estava na esquina."
[SPEAKER_01] 01:02:11 — "Não, eu não estava lá naquela hora."
                          ↑ é isto que vira tese de defesa
```

O job é assíncrono (**BullMQ + Redis**). Uma audiência de 4h leva de 20 a 60 min. A
tela faz polling a cada 3s e mostra o progresso real (`chunksProcessados / chunksTotal`).
O advogado pode fechar a aba — ao voltar, o dossiê está lá.

---

## Escalar: trocar o store de compras por Redis

O `lib/compra.ts` guarda os pedidos num `Map` em memória. **Isso quebra com múltiplas
instâncias** (Vercel serverless, PM2 cluster): o pedido criado numa instância não é
visto pela outra, e o polling nunca confirma.

O backend já tem Redis (BullMQ). Troque as 4 funções por comandos Redis:

```ts
// criarPedido    → SETEX pedido:{id} 900 {json}
// lerPedido      → GET   pedido:{id}
// confirmarPedido→ GET + SETEX (estado: CONFIRMADA)
// cancelarPedido → DEL   pedido:{id}
```

O TTL de 15 min já está na constante `TTL_MS`.

---

## O que o app precisa ganhar (build futuro)

Para o QR funcionar de ponta a ponta, o **app** precisa de um deep link:

```
soscjus://compra/{pedidoId}
```

Ao abrir:
1. Lê o `pedidoId`
2. Consulta o backend para saber **o que** é a compra
3. Abre o **StoreKit** (iOS) ou o **Google Play Billing** (Android)
4. Depois que a loja aprova e o receipt é validado em `/iap/verify`,
   chama `POST /api/compra/{id}` na estação
5. A estação detecta no polling e **destrava sozinha**

Enquanto o deep link não existir, o QR ainda funciona como **fallback**: leva para a
loja, o advogado compra dentro do app pelo caminho normal, e volta ao computador.

---

## Checklist do Juliano

- [ ] `SESSION_SECRET` gerado com `openssl rand -base64 48`
- [ ] `SOSC_BACKEND_URL` **sem** `/api/v1` no final
- [ ] `FINAISJUS_URL` e `JURISCREATOR_URL` apontando pros VPS certos
- [ ] Nginx com `client_max_body_size 4G` e `proxy_request_buffering off`
- [ ] `npm run build` passa limpo
- [ ] Login funciona com uma conta real de advogado
- [ ] Uma conta **não-advogado** é bloqueada com 403
- [ ] `/api/sosc/clients` responde (proxy de pé)
- [ ] Upload de PDF no FinaisJus gera `jobId`
- [ ] Estourar a cota de CPF abre o QR (e não um paywall)
- [ ] **Antes de escalar:** trocar `lib/compra.ts` por Redis

---

**SOS Criminal Tecnologia LTDA** · autor do código: Glauber Paiva
