# Checklist — Estação Web · Build 268 (Créditos)

---

## 1 · Variáveis

```bash
cp .env.example .env.local
openssl rand -base64 48        # → SESSION_SECRET
```

| Variável | Valor |
|---|---|
| `SOSC_BACKEND_URL` | `https://api.soscriminalapp.com.br` ⚠️ **sem** `/api/v1` |
| `SESSION_SECRET` | o `openssl` acima |
| `FINAISJUS_URL` | `https://finaisjus.soscriminal.com.br` |
| `JURISCREATOR_URL` | `https://juriscreator.soscriminal.com.br` |

---

## 2 · Depende do backend B268

A estação lê **`GET /api/v1/creditos/saldo`**.

**Sem essa rota, o saldo aparece 0** — a navegação funciona, mas o advogado
não vê os créditos dele.

**Suba o backend primeiro.**

---

## 3 · Build

```bash
npm ci
npm run build
pm2 start npm --name soscjus-estacao -- start
pm2 save
```

---

## 4 · Nginx

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

    # ⚠️ CRÍTICO — o vídeo da audiência passa por aqui
    client_max_body_size    4G;
    proxy_read_timeout      300s;
    proxy_send_timeout      300s;
    proxy_request_buffering off;
  }
}
```

Sem o `proxy_request_buffering off`, o Nginx grava o vídeo de 3 GB em disco
antes de repassar.

---

## 5 · CORS: não mexe

O navegador **nunca** fala com `api.soscriminalapp.com.br`. Ele fala com a
própria estação, que repassa no servidor. **Nada muda no Fastify.**

---

## 6 · Teste de aceite

- [ ] Login com conta real de advogado
- [ ] Conta de **cliente** → bloqueia com 403
- [ ] **O saldo 💎 aparece no topo** de toda tela
- [ ] Defesa → 20 · Elite → 70 · Fundador → 30 + selo · Dono → **∞**
- [ ] **O preço aparece no card**, antes do clique
- [ ] **Analisar Print** → 🟢 selo "Grátis" verde-limão
- [ ] Ferramenta ≤ 20 💎 → abre direto, sem perguntar
- [ ] Ferramenta > 20 💎 → **confirma antes**
- [ ] Sem saldo → 402 → **QR de recarga**
- [ ] Pagou no celular → **a tela destrava sozinha**
- [ ] `/plano` → carteira, pacotes, tabela, e o que é grátis

---

## 7 · O que a web **espelha** do backend

`lib/creditos.ts` **tem que bater** com `backend/src/lib/entitlements.ts`.

Se divergirem, o card mostra um preço e o backend cobra outro — **e o
advogado descobre que foi enganado**.

**Fonte da verdade: o BACKEND.** A web só espelha para mostrar antes do clique.

**As 12 features:**

| | 💎 |
|---|---|
| `RELATORIO` · `JURISCREATOR` · `MEU_MANDADO` | **6** |
| `CONSULTA_MANDADO` · `CONSULTA_CADASTRAL` · `CONSULTA_PROCESSUAL` | **20** |
| `ACOMPANHAMENTO` · `ATUALIZACAO_NACIONAL` · `CADASTRO_MANUAL` · `ANEXAR_CONEXO` | **20** |
| `PENTE_FINO_VEICULO` | **40** |
| `FINAISJUS` | **160** |

**Grátis:** Analisar Print · Plantão · SOS · 1ª busca · 1º acompanhamento · verificar prova

**Assinatura à parte:** Alerta Diário · R$ 39,90/mês · **não usa crédito**

---

## 8 · Antes de escalar

`lib/compra.ts` guarda os pedidos de QR num `Map` **em memória**.

**Com uma instância PM2, funciona.** Se escalar pra cluster, troque por Redis
— as 4 funções estão documentadas no arquivo.

---

**SOS Criminal Tecnologia LTDA** · autor do código: Glauber Paiva
