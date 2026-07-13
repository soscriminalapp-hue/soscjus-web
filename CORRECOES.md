# SOSC JUS WEB — v4.0.2
## Os bloqueadores da auditoria — corrigidos

> ⚠️ **SÓ A WEB.** O app (build 269) já está com você.

---

# 🔴 OS 4 BLOQUEADORES

## 1 · O projeto **não compilava**

**Duas colisões da variável `s`:**

```tsx
// ❌ app/(app)/processos/[cnj]/page.tsx
import s from './capa.module.css';
const [p, s] = await Promise.all([...]);   // ← SOMBREIA o CSS!

// ✅
const [p, cred] = await Promise.all([...]);
```

```tsx
// ❌ app/(app)/consultas/page.tsx
<s className={s.riscado}>R$ 9,90</s>       // ← a TAG <s> colide com o import

// ✅
<span className={s.riscado}>R$ 9,90</span>
```

**E mais:**
- `tom="mente"` → **`tom="mind"`** *(o tipo só aceita 6 valores)*
- `DonoDoVeiculo`: `useState<string | null>` → **`useState<Feature | null>`**

### ✅ Compilado com `tsc` de verdade

```
ERROS REAIS: 0
```

**Rode `npm run typecheck` antes do build.** Está no `INSTALAR.md`.

---

## 2 · 🔴 O QR **nunca fechava** — o bug mais grave

### O furo

```ts
// app/api/compra/[id]/route.ts — o POST que o CELULAR chama
export async function POST(...) {
  const s = await sessaoAtual();        // ← O COOKIE DO NAVEGADOR DO PC
  if (!s) return 401;
```

**Mas quem confirma é o CELULAR.** Ele **não tem** esse cookie.

**O fluxo NUNCA FECHAVA.** A tela do computador **girava pra sempre**.

### A correção

O pedido agora tem um **TOKEN** (32 bytes aleatórios) que vai **dentro do QR**.

```
POST /api/compra/confirmar   { pedido, token }    ← SEM COOKIE
```

- Token de **256 bits** — não dá pra adivinhar
- **10 minutos** de validade
- **Uso único** — confirmou, morreu
- Comparação em **tempo constante** *(anti timing attack)*

⚠️ **E isto NÃO dá crédito a ninguém.** O crédito quem dá é o **backend SOSC**,
depois de validar o receipt (`POST /iap/verify`).

Esta rota só **destrava a tela**. Se alguém adivinhar o token, o máximo que
consegue é fazer a tela de outro advogado parar de girar.

### Os nomes divergiam

```ts
// ❌ a web mandava
{ feature: 'CREDITOS' }        // a API não entende
{ feature: 'FINAISJUS' }       // ferramenta NÃO é vendida — ela GASTA crédito

// ✅ agora
{ productId: 'br.com.soscriminal.creditos.500' }
```

**Só pacotes de crédito.** Qualquer outra coisa → **400**.

### E não havia fallback

```
❌ O QR apontava direto pra soscjus://creditos?...
   Sem o app instalado → o navegador dava ERRO.
   O advogado ficava olhando uma tela quebrada.
```

**✅ Tela nova: `/abrir`**

1. Tenta abrir o app (`soscjus://`)
2. Se em **1,5s** a página ainda estiver visível → **não abriu**
3. Mostra **App Store** / **Google Play**

É o padrão do WhatsApp, do Uber, do iFood.

⚠️ **E `/abrir` é PÚBLICA** — o celular não tem o cookie da estação.
*(o middleware foi corrigido)*

---

## 3 · Next.js **14.2.15 — CVE**

```
14.2.15  →  14.2.35
```

**Não baixe a versão.**

---

## 4 · `npm ci` **não rodava**

O ZIP não tinha `package-lock.json` nem `.env.example` — mas a documentação
mandava usar os dois.

**✅ `.env.example` está no pacote.**

**⚠️ `package-lock.json`:** ele é gerado na **primeira** instalação:

```bash
npm install          # gera o lock
git add package-lock.json
npm ci               # daqui pra frente, funciona
```

**Está no `INSTALAR.md`.**

---

# 📱 vs 🖥️ — a honestidade

> **Um produto que finge fazer tudo em todo lugar é um produto que mente.**

## 📱 MELHOR NO CELULAR — a estação **avisa** (não bloqueia)

| | Por quê |
|---|---|
| **JurisCreator** | **20s e POSTA no Instagram.** Aqui você baixa, manda pro celular, abre o app… |
| **Consultar Veículo** | **Fotografa a placa.** Aqui você digita — e erra. |
| **Analisar Print** | O print **está no celular**. |

## 🖥️ MUITO MELHOR AQUI

| | Por quê |
|---|---|
| **FinaisJus Pro** | **Petição se faz no computador.** É o hábito de 30 anos. |
| **Meus Processos** | 200 processos → tabela, filtro, exportar. |
| **Ler o processo** | Movimentações + relatório **lado a lado**. |

## 📵 SÓ NO CELULAR — nem abre aqui *(tela nova: `/celular`)*

| | Por quê |
|---|---|
| 🚨 **Acionar SOS** | É **emergência**. Ele está **na rua**. |
| 🛡️ **Prerrogativa** | Ele está **na delegacia**. |
| 📸 **Gravar Prova** | Câmera + GPS + hash. **O PC não tem isso.** |

---

# 🎯 A HOME — 3 eixos

```
1️⃣  PROSPECÇÃO          📡 Plantão · 👤 Convidar
2️⃣  GESTÃO DO PROCESSO  🔴 Prazos · 📅 Audiências · ⚖️ Movimentações
3️⃣  GESTÃO DO CLIENTE   👥 Clientes · 💰 Honorários
```

## ⚠️ Por que o Plantão vem primeiro — e o SOS não

| | Frequência |
|---|---|
| **📡 Plantão Adv.** | **5–10 por dia** |
| **🚨 Alerta SOSC** | **1 por mês** |

**Importante ≠ frequente.**

Se o card de SOS ocupasse o topo e ficasse **vazio 29 dias por mês**, o
advogado abriria a estação e veria **espaço morto**.

**O SOS aparece só quando existe** — como uma faixa vermelha por cima de tudo.

*(A implementar na v4.1 — hoje ele não está na estação.)*

---

# 📦 SUBIR

```bash
cp .env.example .env.local
openssl rand -base64 48        # → SESSION_SECRET

npm install                    # ⚠️ gera o package-lock.json
npm run typecheck              # ⚠️ tem que dar ZERO
npm run build
pm2 restart soscjus-estacao
```

⚠️ **`NEXT_PUBLIC_SITE_URL` é obrigatório** — é ela que vai no QR.
Sem isso, o QR aponta pro `localhost` e o celular não abre.

---

# 🔜 O QUE FALTA (v4.1)

A auditoria está certa: **metade ainda é demonstrativa.**

| | |
|---|---|
| **Centro de Conexão SOSC** | alertas, aceitar/recusar, áudio e GPS ao vivo |
| **Sala Chat** | |
| **Ficha do Cliente** | processos, contrato, assinatura, cobranças |
| **Contrato e Procuração** | |
| **Documentos assinados** | |
| **Cobrança PIX/boleto** | |
| **Relatório SOSC** | |
| **Configurações** | OAB, logomarca, PIX |
| **Convidar Cliente** | hoje não executa o convite |

**Mas primeiro isto tinha que compilar.** Agora compila.

---

**SOS Criminal Tecnologia LTDA** · autor do código: Glauber Paiva
