# SOSC JUS WEB — v4.1.0
## A estação vira o **caminhão**

> **"As tecnologias chegam primeiro no caminhão. Testa lá, depois passa pro carro."**
>
> A tela grande permite **explorar** o que o celular **corta**.
> Testa aqui. Depois porta pro app.

---

# 🎯 O MENU QUE RESPONDE

## O pecado capital de todo dashboard ruim

**Estava tudo cinza.** Ele clicava e **não sabia onde estava**.

```css
/* ❌ o .on nem existia no CSS */
```

## ✅ Agora

- **Barra dourada** à esquerda — *"você está aqui"*
- **Fundo aceso** + ícone e texto em ouro
- **Hover** já responde
- **O logo leva pro Início** — o atalho universal
- **A trilha é clicável**

---

# 🔔 O SINO — o que faz ele deixar a estação **aberta**

**Sem isto, ele abre, olha, e fecha.**
**Com isto, ele deixa aberto — porque a estação CHAMA ELE.**

## A ordem é por **urgência** — não por data

| | Peso | O quê |
|---|---|---|
| 🚨 **SOS ACIONADO** | **100** | o cliente está sendo abordado **AGORA** |
| 💬 **Sala Chat** | 50 | o cliente falou com ele |
| 📡 **Plantão** | 40 | gente procurando advogado |
| ⏰ **Prazo vencendo** | 30 | hoje ou amanhã |
| ● **Processo moveu** | 10 | o tribunal publicou |

## 🚨 E o SOS **grita**

O sino fica **vermelho, pulsando**. O aviso tem **barra vermelha**.

**É o mais urgente que existe** — mesmo sendo raro (1×/mês).

## ⚠️ Polling de 30s — e por que basta (por enquanto)

O backend não tem WebSocket. Fazer SSE agora atrasaria tudo.

**30s é aceitável** para prazo, movimentação e plantão.

⚠️ **Para o SOS, NÃO É.** Ele precisa saber **agora**.
**→ v4.2:** SSE em `/sos/stream`.

---

# 📋 MEUS PROCESSOS — a tabela profissional

## ⚠️ Ele tem **284 processos**

**No celular:** uma lista infinita. Ele rola, rola, **e não acha**.

**Na tela grande:** uma **TABELA**.

```
┌───┬────────────────────┬──────────┬───────────┬────────────┬────────┬──────┐
│ ● │ 5000290-98.2026... │ João H.  │ 🔴 Criminal│ Sentença   │ hoje   │ 💎20 │
│ ● │ 0703456-12.2025... │ Mariana  │ 🟠 Execução│ Conclusos  │ 3 dias │ ✅   │
└───┴────────────────────┴──────────┴───────────┴────────────┴────────┴──────┘
```

## 🎨 As cores por classe

| Classe | Cor |
|---|---|
| ⚡ **Habeas Corpus** | **amarelo-urgente** |
| **Criminal** | 🔴 vermelho |
| **Execução Penal** | 🟠 laranja |
| **Recursos** | 🟣 roxo |
| **Cível** | 🔵 azul |
| **Trabalhista** | 🟢 verde |
| **Família** | 🩷 rosa |
| **Fiscal** | 🟡 dourado |

## ⚠️ O advogado não busca por "área"

**Ele busca por O QUE VAI FAZER HOJE.**

> *"Hoje eu vou trabalhar nos recursos"* — é um dia de trabalho real.
> *"Hoje eu vou olhar os HCs"* — é um dia de trabalho real.

**Por isso RECURSO e HABEAS CORPUS têm filtro PRÓPRIO** — mesmo atravessando
todas as áreas.

## Ordenar

- **Que moveu** *(padrão — é o que importa)*
- Mais recente
- Mais antigo
- Por cliente

---

# ⚡ HABEAS CORPUS — o agrupamento que ninguém faz

## O problema

O réu está preso na **Ação Penal**. O advogado impetra:

```
AÇÃO PENAL 5000290-98  (o cliente está preso há 287 dias)
   ├─ HC 1234 · TJMG → negado
   ├─ HC 5678 · TJMG → negado
   ├─ HC 9012 · STJ  → liminar indeferida
   ├─ HC 3456 · STJ  → aguardando
   └─ HC 7890 · STF  → distribuído
```

**Cinco HCs. Um processo. Um homem preso.**

Se eles aparecem **soltos** no meio de 89 processos criminais,
**o advogado PERDE O FIO.**

## ✅ A solução

Clique em **⚡ Habeas Corpus** e veja **todos, agrupados pela ORIGEM**:

```
┌─────────────────────────────────────────────────────┐
│  📋 PROCESSO DE ORIGEM                      3 HC   │
│     5000290-98.2026.8.13.0027                       │
├─────────────────────────────────────────────────────┤
│  TJ   HC 1234 · Denegada a ordem      🔴 Negado     │
│  STJ  HC 5678 · Conclusos ao relator  🔵 Aguardando │
│  STF  HC 9012 · Distribuído           🔵 Aguardando │
└─────────────────────────────────────────────────────┘
```

## ⚠️ A ESCADA: **TJ → STJ → STF**

Ele precisa ver **em que degrau está**.

## E o status é lido da movimentação

| | |
|---|---|
| 🟢 **Concedido** | *"concedida a ordem", "alvará de soltura"* |
| 🔴 **Negado** | *"denegada", "indeferido", "prejudicado"* |
| ⚡ **Liminar** | *"liminar"* |
| 🔵 **Aguardando** | *"conclusos", "distribuído", "vista"* |

## ⚠️ E o `conexoDe` **já existe no banco**

```prisma
model Processo {
  conexoDe  String?   // ← o processo de origem
  @@index([conexoDe])
}
```

**A rota `POST /manual` com `conexoDe` já vincula.** É só usar.

---

# ⚠️ A TELA GRANDE PERMITE **EXPLICAR**

**No celular, cada palavra disputa espaço. Ele corta.**

**Aqui sobra tela.** Então:

```
⚡ Habeas Corpus
   É liberdade. Um processo pode ter vários — TJ, STJ, STF.
   Clique e veja todos, agrupados pela origem.
```

```
🟣 Recursos
   Apelação, agravo, RESP, RE. Atravessa todas as áreas —
   clique e veja todos.
```

**Ele entende o que está olhando.**

---

# 🔜 O QUE FALTA

| | |
|---|---|
| **Detalhe do processo em 2 colunas** | capa + movimentações \| relatório + prazos + audiências |
| **Ficha do Cliente** | processos · contrato · procuração · honorários · cobranças |
| **FinaisJus com arrastar e soltar** | o PDF de 800 páginas e o vídeo de 3 GB, **na tela** |
| **SSE para o SOS** | tempo real — hoje é polling de 30s |
| **Convidar cliente** | executar o convite |

---

# 📦 SUBIR

```bash
npm install          # gera o package-lock.json
npm run typecheck    # ⚠️ tem que dar ZERO
npm run build
pm2 restart soscjus-estacao
```

---

**SOS Criminal Tecnologia LTDA** · autor do código: Glauber Paiva
