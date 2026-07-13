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

/** Rotas que não exigem login. */
const PUBLICAS = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const temCookie = Boolean(req.cookies.get(COOKIE)?.value);

  if (PUBLICAS.some((p) => pathname.startsWith(p))) {
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
