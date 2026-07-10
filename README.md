# SOSC JUS — Web (Estação do Advogado)

Versão web do SOSC JUS, **exclusiva do advogado**. Roda no navegador (computador),
consome o **mesmo backend** e o **mesmo login** do app. Foco: produzir Contrato de
Honorários e Procuração na frente do cliente, consultar processos/andamentos e
manusear PDF em tela grande.

Não substitui o app. Assinaturas, compras avulsas, radar de mandado e prerrogativas
continuam no aplicativo.

---

## Stack

- **Next.js 14** (App Router) + React 18 + TypeScript (strict)
- **React Query** (cache/estado servidor) + **Zustand** (sessão)
- **Tailwind** (identidade: dourado `#D8A631`, fundo preto)
- PDF gerado **no navegador** via impressão nativa (`@media print`) — zero dependência
  de binário, layout A4/Times espelhando o `gerar-pdf-documento.ts` do backend.

## O que a web consome do backend (nada é reimplementado)

| Tela | Endpoint |
|------|----------|
| Login | `POST /auth/login` (retorna `accessToken`/`refreshToken`/`user.role`) |
| Refresh automático | `POST /auth/refresh` |
| Contrato / Procuração | `GET /documents/:kind`, `POST /documents/:kind/render`, `PUT /documents/`, `DELETE /documents/:kind` |
| Clientes | `GET /clients` |
| Processos | `GET /processos/meus-processos` (cache) e `?fonte=refresh` (sincroniza) |
| Consulta processual | `POST /processos/consulta` (por CNJ ou CPF) |
| CPF / Antecedentes | `POST /processos/cpf/antecedentes` |
| Mandado de prisão (BNMP) | `POST /processos/mandado/consulta` |
| Anexos PDF | `GET/POST/DELETE /documents/anexos`, `POST /documents/anexos/upload-url` |

---

## Rodar local

```bash
npm install
cp .env.example .env.local   # ajuste a URL se precisar
npm run dev                  # http://localhost:3000
```

Antes de subir, sempre:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # build de produção
```

---

## Deploy na Vercel (deploy automático)

1. Suba este diretório num repositório Git (ou subpasta do monorepo).
2. Na Vercel: **New Project** → aponte pra este diretório.
3. Framework: **Next.js** (detectado sozinho). Build: `next build` (padrão).
4. **Variável de ambiente** (Project Settings → Environment Variables):

   ```
   NEXT_PUBLIC_API_URL = https://api.soscriminalapp.com.br
   ```

5. Deploy. A cada `git push`, a Vercel rebuilda automático.

### ⚠️ CORS no backend (passo obrigatório do Juliano)

O backend (`src/plugins/index.ts`) já libera `env.WEB_URL` no CORS. Basta definir
essa variável no ambiente de produção do backend apontando pro domínio da Vercel:

```
WEB_URL = https://SEU-DOMINIO.vercel.app
```

(ou o domínio custom que você apontar pra Vercel). Sem isso, o navegador bloqueia
as chamadas por CORS. Depois de setar, reinicie o processo (PM2).

---

## Trocar a logo pela oficial

O componente `src/components/ShieldLogo.tsx` usa um escudo SVG de fallback. Para usar
o brasão oficial (mesma imagem do app, `assets/brand/sosc_jus_logo.png`):

1. Copie o PNG pra `public/sosc_jus_logo.png`.
2. Troque o conteúdo do `ShieldLogo` por:

   ```tsx
   import Image from 'next/image';
   export function ShieldLogo({ size = 48 }: { size?: number }) {
     return <Image src="/sosc_jus_logo.png" width={size} height={size} alt="SOSC JUS" priority />;
   }
   ```

---

## Fase 2 (planejada, não incluída)

- **Compra web → confirmação no celular** (purchase-intent): a web dispara a compra
  (ex: FinaisJus Pro, relatório avulso), o app confirma via IAP no celular, a web
  destrava por polling/websocket. O dinheiro passa 100% pelo IAP da Apple — a web
  nunca processa pagamento. Exige `POST /web/purchase-intent`,
  `GET /web/purchase-intent/:id/status` e deeplink `soscjus://purchase/:id`.
