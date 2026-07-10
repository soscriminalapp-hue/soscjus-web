# CHECKLIST JULIANO — Publicar a Web do SOSC JUS

Guia passo a passo para colocar a **versão web (advogado)** no ar, com todas as
APIs funcionando de verdade. Tempo total: ~20 minutos.

O código já está pronto e testado (tipagem validada). Não é demonstração — as telas
chamam os endpoints reais do backend. Falta só publicar e liberar o CORS.

---

## Visão geral

- **App:** Next.js 14 (pasta `soscjus-web/`).
- **Backend:** o mesmo de sempre — `api.soscriminalapp.com.br`. **Nada muda no backend**, exceto setar uma variável de ambiente (CORS).
- **Hospedagem:** Vercel (recomendado — deploy automático via git) ou a própria VPS.

O que já funciona ligado à API real:
- Login (`/auth/login`) + refresh de token
- Contrato de Honorários e Procuração (`/documents/...`) + PDF
- Clientes (`/clients`)
- Meus Processos + andamentos (`/processos/meus-processos`)
- Consulta Processual (`/processos/consulta`)
- CPF / Antecedentes (`/processos/cpf/antecedentes`)
- Mandado de Prisão / BNMP (`/processos/mandado/consulta`)

As consultas que têm cobrança avulsa (IAP) mostram, quando a cota grátis acaba, um
aviso para concluir a compra **no app do celular** — a web nunca processa pagamento
(regra da Apple). Isso é intencional.

---

## PASSO 1 — Subir o código no Git

```bash
cd soscjus-web
git init
git add .
git commit -m "SOSC JUS web — estação do advogado"
# crie um repo (GitHub/GitLab) e:
git remote add origin <URL_DO_SEU_REPO>
git push -u origin main
```

(Ou coloque `soscjus-web/` como subpasta do monorepo que já existe.)

---

## PASSO 2 — Deploy na Vercel

1. Entre em vercel.com → **Add New → Project**.
2. Importe o repositório. Se `soscjus-web` for subpasta, defina **Root Directory = `soscjus-web`**.
3. Framework: **Next.js** (detectado automaticamente). Deixe os comandos padrão.
4. Em **Environment Variables**, adicione:

   | Nome | Valor |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://api.soscriminalapp.com.br` |

5. Clique **Deploy**. Ao final, a Vercel dá um domínio, ex: `https://soscjus-web.vercel.app`.
   (Se for apontar domínio próprio — ex: `app.soscriminalapp.com.br` — configure em Settings → Domains.)

A partir daqui, **todo `git push` refaz o deploy sozinho**.

---

## PASSO 3 — Liberar o CORS no backend (obrigatório)

Sem isso, o navegador bloqueia todas as chamadas. O backend já está preparado —
o `src/plugins/index.ts` inclui `env.WEB_URL` na lista de origens permitidas. Só
falta setar essa variável.

No ambiente de produção do backend (`.env` da VPS), adicione/ajuste:

```
WEB_URL=https://soscjus-web.vercel.app
```

(use o domínio exato que a Vercel gerou, ou o domínio próprio se configurou um).

Depois reinicie o processo:

```bash
pm2 restart <nome-do-processo-do-backend>
```

Pronto. A web já conversa com a API.

> Se um dia mudar o domínio da web, é só atualizar `WEB_URL` e reiniciar o PM2.

---

## PASSO 4 — Testar

1. Abra o domínio da Vercel.
2. Faça login com uma conta **de advogado** (mesmo login do app; contas de usuário são bloqueadas).
3. Verifique:
   - Contrato/Procuração → preencher → **Imprimir/Salvar PDF**.
   - Meus Processos → deve listar; botão **Sincronizar** puxa do Escavador.
   - Consulta Processual / CPF / Mandado → retornam dados reais (ou o aviso de compra no celular se a cota acabou).

---

## Alternativa: hospedar na própria VPS (sem Vercel)

Se preferir tudo na VPS:

```bash
cd soscjus-web
npm install
npm run build
npm run start           # sobe em localhost:3000
# rode sob PM2:
pm2 start "npm run start" --name soscjus-web
```

Depois aponte um subdomínio (ex: `app.soscriminalapp.com.br`) via nginx para a porta 3000,
e use esse subdomínio como `WEB_URL` no backend (Passo 3). Não esqueça o SSL (certbot).

---

## Notas

- **Logo:** hoje usa um escudo SVG de fallback. Para o brasão oficial, coloque o PNG em
  `soscjus-web/public/sosc_jus_logo.png` e ajuste `src/components/ShieldLogo.tsx` (instruções no README.md).
- **O que NÃO entra na web (fica só no app):** radar de mandado ativo (push), assinatura de
  planos/IAP, prerrogativas de campo, PIX e logomarca (cadastro). São ações de celular.
- **FinaisJus Pro e JurisCreator IA:** já são webs próprias no ar
  (`finaisjus.soscriminal.com.br` e `juriscreator.soscriminal.com.br`), com o mesmo login
  SOSC JUS. A estação web **linka** para elas (abrem em nova aba) em vez de reimplementá-las.
- **Fase 2 planejada:** compra web → confirmação no celular (purchase-intent). Detalhes no README.md.
