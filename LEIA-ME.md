# SOSC JUS — Estação do Advogado
## v4.2.0 · reconstruída do zero

---

# O que mudou

**A estação foi reescrita.** Não é remendo em cima de remendo — é uma
construção nova, aproveitando só o que estava testado e correto (o proxy, a
sessão, a tabela de preços, as classes processuais).

## 🎯 O menu — agora ele FUNCIONA

**O pecado capital de todo dashboard ruim: o item ativo não grita.**

Antes estava tudo cinza — ele clicava e não sabia onde estava.

Agora:
- **barra colorida** à esquerda + **fundo aceso** + **ícone e texto em cor**
- **cada área tem A SUA cor** (processos ouro, prazos vermelho, plantão lima,
  honorários verde, tokens azul, IA roxo)
- **o logo leva pro Início**
- **os 19 itens abrem uma tela real** — não existe "em breve"

## 📋 A ordem do menu é a ordem do dia dele

```
INÍCIO

PROCESSOS          ← o que aperta HOJE
  Meus Processos
  Prazos e Audiências

PLANTÃO            ← a CONEXÃO com o usuário. O cliente NOVO.

CLIENTES           ← tudo sobre a PESSOA
  Meus Clientes
  Convidar Cliente
  Consulta Processual    ← as 3 consultas moram aqui:
  Consulta de Mandado       são sobre PESSOA, não sobre processo
  Consulta Cadastral
  Contrato e Procuração
  Já Assinados
  Cobrar Honorários

FERRAMENTAS        ← as avulsas
  Consultar Veículo
  Analisar Print
  FinaisJus Pro
  JurisCreator
  Relatórios

ESCRITÓRIO
  Meus Tokens
  OAB, Logo e PIX
```

---

# 💻 O QUE SÓ O COMPUTADOR FAZ

**É isto que justifica a estação existir.** Tudo nativo do navegador — **zero
biblioteca externa**.

| Recurso | Onde |
|---|---|
| **📊 Exportar Excel** | Meus Processos (os 284, já filtrados) · Honorários · Prazos |
| **📅 Exportar .ics** | Prazos e Audiências → cai no **Google Calendar / Outlook**, com **alarme** (prazo: 1 dia antes · audiência: 2h antes) |
| **🖨️ Imprimir** | Contrato · Procuração · Pauta do mês · Lista de processos · Recibo |
| **📋 Copiar formatado** | Contrato → **cola no Word já pronto**, com negrito e parágrafo |
| **📝 Baixar .doc** | Contrato e Procuração — o Word abre sem reclamar |
| **⬆️ Arrastar e soltar** | PDF do processo · **vídeo de 3 GB** (FinaisJus) · print · logo |
| **🖊️ Editor rico** | O contrato editável na tela — negrito, itálico, listas |
| **📅 Calendário do mês** | O mês inteiro numa tela — **não cabe no celular** |

---

# ⚖️ As telas

## Detalhe do processo — **em DUAS COLUNAS**

**É o motivo da estação existir.**

```
┌─────────────────────────┬──────────────────────┐
│  A CAPA                 │  ACOMPANHAR   10.000 │
│  classe, vara, partes   │  RELATÓRIO     3.000 │
│                         │                      │
│  AS MOVIMENTAÇÕES       │  📎 ANEXAR:          │
│  (a linha do tempo      │   · peça      GRÁTIS │
│   inteira)              │   · conexo    10.000 │
│                         │                      │
│  [só atos decisórios]   │  ⚖️ FinaisJus        │
└─────────────────────────┴──────────────────────┘
```

No celular ele vê **uma coisa por vez** — e perde o fio. Aqui ele lê a
movimentação e clica em "gerar relatório" **sem trocar de tela**.

## 🔒 Segredo de justiça

Em **Meus Processos** → **"Cadastrar processo"**.

Ele digita o CNJ (tem os autos, sabe o número). O Escavador varre **naquele
momento** e traz **tudo que conseguir**. Em segredo de justiça, vem o que for
publicado no **Diário Oficial** — o inteiro teor ele lê no PJe com o token da
OAB dele.

**10.000 tokens.** Se ele foi buscar o número, **aquele processo importa**.

## ✋ Criar prazo e audiência na mão — **GRÁTIS**

O advogado raiz tem método próprio. Se o sistema **impõe** o jeito dele fazer,
ele volta pro Word.

Ninguém foi ao tribunal buscar nada — **cobrar por digitar seria roubo**.

## 📡 Plantão — a conexão com o usuário

Do outro lado, no app, é o **"Buscar Advogado"**. A mesma ponte.

**5 a 10 pessoas por dia.** (O SOS acontece ~1×/mês — o Plantão é o **volume**.)

⚠️ **Nunca desconta token.** Cobrar por lead é vedado pelo **Provimento 205 da
OAB** — e se ele achasse que custa, DESLIGAVA. O mural esvaziava. O produto
morria.

---

# 🪙 Os tokens

**1 token = R$ 0,001.**

| | tokens |
|---|---|
| Relatório · JurisCreator · Meu CPF | **3.000** |
| As consultas · acompanhar · sincronizar · conexo | **10.000** |
| Pente-Fino do Veículo | **20.000** |
| FinaisJus Pro | **80.000** |

**🎨 A cor do número:**
- fundo **escuro** (card, tabela, saldo) → **Miami Blue**
- fundo **claro** (verde-limão, dourado) → **preto**

*(azul ciano sobre verde-limão é ilegível — as duas cores têm luminância
parecida e o número "vibra")*

---

# 📱 O que é melhor no celular — e a estação **DIZ**

| | Por quê |
|---|---|
| **JurisCreator** | É ferramenta de **Instagram**. No celular: gera → compartilha. Três toques. Aqui: gera → baixa → manda pro telefone → abre o Insta → sobe. **A estação LINKA** para `juriscreator.soscriminal.com.br` — não reimplementa (a rota `/gerar` nem existe no backend). |
| **Analisar Print** | O print **está** no celular. Aqui ele teria que mandar pro computador primeiro. **Mas não bloqueamos** — avisamos. |

**Bloquear seria arrogância. Avisar é respeito.**

---

# 📦 Subir

```bash
npm install
npm run build
pm2 restart soscjus-estacao
```

## O `.env.local`

```bash
SOSC_BACKEND_URL=https://api.soscriminalapp.com.br
SESSION_SECRET=<32+ caracteres aleatórios>
SESSION_COOKIE=soscjus_estacao
NEXT_PUBLIC_SITE_URL=https://web.soscjus.com.br
JURISCREATOR_URL=https://juriscreator.soscriminal.com.br
FINAISJUS_URL=https://finaisjus.soscriminal.com.br
```

## ⚠️ CORS — não precisa

**O navegador nunca fala direto com o backend.**

```
NAVEGADOR → ESTAÇÃO (servidor) → BACKEND SOSC
```

O token vive num **cookie httpOnly cifrado** (AES-256-GCM). Se um XSS rodar na
página, ele **não consegue ler o token** — porque JS não enxerga httpOnly.

E o backend não precisa saber que a estação existe.

---

# ✅ Validado

- **0 erros** de TypeScript
- **32 rotas** — todas existem no backend (verificadas uma a uma)
- **19 itens de menu** — todos abrem tela real
- **21 telas** construídas

---

**SOS Criminal Tecnologia LTDA** · CNPJ 66.476.445/0001-50
Autor do código: Glauber Paiva
