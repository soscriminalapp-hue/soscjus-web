/**
 * env.ts — leitura estrita das variáveis de ambiente.
 * Falha cedo e alto: melhor quebrar no boot do que 3 telas depois.
 */

function req(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(
      `[SOSC JUS] Variável de ambiente ausente: ${name}. ` +
        `Copie .env.example para .env.local e preencha.`,
    );
  }
  return v.trim().replace(/\/+$/, '');
}

function opt(name: string, fallback: string): string {
  return (process.env[name] ?? fallback).trim().replace(/\/+$/, '');
}

export const env = {
  /** Backend SOSC — sem /api/v1 no final. */
  SOSC: req('SOSC_BACKEND_URL'),
  API: '/api/v1',
  FINAISJUS: opt('FINAISJUS_URL', 'https://finaisjus.soscriminal.com.br'),
  JURISCREATOR: opt('JURISCREATOR_URL', 'https://juriscreator.soscriminal.com.br'),
  SESSION_SECRET: req('SESSION_SECRET'),
  COOKIE: opt('SESSION_COOKIE', 'soscjus_estacao'),
  APP_SCHEME: opt('APP_SCHEME', 'soscjus'),
  APP_STORE: opt('APP_STORE_URL', 'https://apps.apple.com/app/id6770715490'),
  PLAY_STORE: opt(
    'PLAY_STORE_URL',
    'https://play.google.com/store/apps/details?id=br.com.soscriminal.app',
  ),
  SITE: opt('NEXT_PUBLIC_SITE_URL', ''),
} as const;

/** URL completa de um endpoint do backend SOSC. */
export function soscUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${env.SOSC}${env.API}${p}`;
}
