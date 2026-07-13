/**
 * api.ts — cliente do lado do NAVEGADOR.
 *
 * Só fala com /api/* da própria estação. Nunca com o backend direto.
 * O cookie httpOnly vai sozinho (credentials: 'include' é o padrão do
 * same-origin), então não há token para gerenciar aqui.
 */

'use client';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Corpo da resposta, quando veio JSON. Útil para o 402. */
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  /** Cota esgotada — hora de mostrar o QR de compra. */
  get semCota() {
    return this.status === 402;
  }
  /** Sessão morreu. */
  get semSessao() {
    return this.status === 401;
  }
}

async function tratar<T>(r: Response): Promise<T> {
  const txt = await r.text();
  let body: unknown = null;
  try {
    body = txt ? JSON.parse(txt) : null;
  } catch {
    body = txt;
  }

  if (!r.ok) {
    const msg =
      (body as { message?: string; erro?: string } | null)?.message ??
      (body as { erro?: string } | null)?.erro ??
      `Falha na operação (${r.status}).`;
    throw new ApiError(r.status, msg, body);
  }
  return body as T;
}

/** GET / POST / PATCH / etc. em qualquer rota da estação. */
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('content-type', 'application/json');
  }
  const r = await fetch(path, { ...init, headers, cache: 'no-store' });
  return tratar<T>(r);
}

/** Atalhos para o backend SOSC (via proxy). */
export const sosc = {
  get: <T = unknown>(p: string) => api<T>(`/api/sosc${p}`),
  post: <T = unknown>(p: string, body?: unknown) =>
    api<T>(`/api/sosc${p}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(p: string, body?: unknown) =>
    api<T>(`/api/sosc${p}`, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(p: string, body?: unknown) =>
    api<T>(`/api/sosc${p}`, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: <T = unknown>(p: string) => api<T>(`/api/sosc${p}`, { method: 'DELETE' }),
};

/** FinaisJus Pro (via proxy). */
export const finaisjus = {
  get: <T = unknown>(p: string) => api<T>(`/api/finaisjus${p}`),
  /** Upload multipart: PDF do processo + vídeo/áudio da audiência. */
  processar: (fd: FormData) =>
    api<{ jobId: string }>('/api/finaisjus/processar', { method: 'POST', body: fd }),
  status: (jobId: string) => api<StatusFinaisJus>(`/api/finaisjus/status/${jobId}`),
};

/** JurisCreator (via proxy). */
export const juriscreator = {
  get: <T = unknown>(p: string) => api<T>(`/api/juriscreator${p}`),
  gerar: <T = unknown>(body: unknown) =>
    api<T>('/api/juriscreator/generate', { method: 'POST', body: JSON.stringify(body) }),
};

/** Compra avulsa por QR. */
export const compra = {
  criar: (feature: string) =>
    api<PedidoCompra>('/api/compra/criar', {
      method: 'POST',
      body: JSON.stringify({ feature }),
    }),
  ler: (id: string) => api<{ estado: EstadoCompra; titulo: string; feature: string }>(`/api/compra/${id}`),
  cancelar: (id: string) => api(`/api/compra/${id}`, { method: 'DELETE' }),
};

export type EstadoCompra = 'AGUARDANDO' | 'CONFIRMADA' | 'EXPIRADA' | 'CANCELADA';

export interface PedidoCompra {
  id: string;
  codigo: string;
  titulo: string;
  /** data URL do PNG do QR. */
  qr: string;
  deepLink: string;
  expiraEm: number;
  lojas: { apple: string; google: string };
}

/** Resposta de GET /app/status/:id do FinaisJus. */
export interface StatusFinaisJus {
  estado: 'na_fila' | 'processando' | 'concluido' | 'erro';
  passo?: string | null;
  erro?: string | null;
  resultado?: DossieFinaisJus | null;
  chunksTotal?: number | null;
  chunksProcessados?: number | null;
  /** true quando o WhisperX conseguiu separar os locutores. */
  diarizada?: boolean | null;
}

/** As 8 abas do dossiê. */
export interface DossieFinaisJus {
  memoriais?: string;
  linhaDoTempo?: string;
  resumo?: string;
  teses?: string;
  nulidades?: string;
  contradicoes?: string;
  pontosAtencao?: string;
  transcricao?: string;
  chunksTotal?: number;
  chunksProcessados?: number;
  diarizada?: boolean;
}
