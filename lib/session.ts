/**
 * session.ts — sessão em cookie httpOnly.
 *
 * O accessToken do backend SOSC NUNCA chega ao navegador: fica criptografado
 * dentro do cookie, que o JS da página não consegue ler (httpOnly). Toda
 * chamada ao backend passa pelos Route Handlers do Next, que abrem o cookie
 * no servidor e injetam o Authorization: Bearer.
 *
 * Isso elimina a classe inteira de roubo de token por XSS.
 */

import { cookies } from 'next/headers';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { createHash } from 'node:crypto';
import { env } from './env';

export interface Sessao {
  token: string;
  refresh?: string;
  sub: string;
  nome: string;
  email: string;
  role: 'LAWYER' | 'ADMIN';
  oab?: string;
  plano?: string;
}

function chave(): Uint8Array {
  return new Uint8Array(createHash('sha256').update(env.SESSION_SECRET).digest());
}

const ALG = 'dir';
const ENC = 'A256GCM';
/** 8h — o advogado trabalha o dia; depois disso pede a senha de novo. */
const TTL = 60 * 60 * 8;

export async function selarSessao(s: Sessao): Promise<string> {
  return new EncryptJWT({ ...s })
    .setProtectedHeader({ alg: ALG, enc: ENC })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .encrypt(chave());
}

export async function abrirSessao(selo: string): Promise<Sessao | null> {
  try {
    const { payload } = await jwtDecrypt(selo, chave());
    const s = payload as unknown as Sessao;
    if (!s?.token || !s?.sub) return null;
    return s;
  } catch {
    return null;
  }
}

/** Lê a sessão do cookie da requisição atual. Server-side only. */
export async function sessaoAtual(): Promise<Sessao | null> {
  const c = cookies().get(env.COOKIE)?.value;
  if (!c) return null;
  return abrirSessao(c);
}

export function gravarCookie(selo: string) {
  cookies().set(env.COOKIE, selo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL,
  });
}

export function limparCookie() {
  cookies().set(env.COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
