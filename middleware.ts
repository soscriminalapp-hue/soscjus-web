/**
 * middleware.ts — guarda de rota.
 *
 * Sem cookie de sessão → vai para /login.
 * Com cookie e tentando /login → vai para /inicio.
 *
 * Nota: aqui só checamos a PRESENÇA do cookie (Edge runtime não roda
 * o `jose` com Node crypto). A validação real acontece em cada Route
 * Handler, que abre e decifra a sessão. Um cookie forjado não passa lá.
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE = process.env.SESSION_COOKIE ?? 'soscjus_estacao';

/**
 * Rotas que não exigem login.
 *
 * ⚠️ /abrir É PÚBLICA — e TEM QUE SER.
 *
 * É a página que o QR abre NO CELULAR. Ele não tem o cookie da estação
 * (que vive no navegador do computador).
 *
 * Se ela exigisse login, o QR levaria pra tela de login — e o advogado
 * ficaria sem entender nada.
 */
const PUBLICAS = ['/login', '/abrir'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const temCookie = Boolean(req.cookies.get(COOKIE)?.value);

  if (PUBLICAS.some((p) => pathname.startsWith(p))) {
    // ⚠️ /abrir passa SEMPRE — com ou sem cookie.
    //    Ela roda no CELULAR, não no computador.
    if (pathname.startsWith('/abrir')) {
      return NextResponse.next();
    }
    if (temCookie) {
      return NextResponse.redirect(new URL('/inicio', req.url));
    }
    return NextResponse.next();
  }

  if (!temCookie) {
    const url = new URL('/login', req.url);
    // Volta para onde ele estava tentando ir.
    if (pathname !== '/') url.searchParams.set('voltar', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Tudo, exceto:
     *  - /api/*        (os handlers checam a sessão por conta própria)
     *  - /_next/*      (assets do Next)
     *  - arquivos estáticos
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$).*)',
  ],
};
