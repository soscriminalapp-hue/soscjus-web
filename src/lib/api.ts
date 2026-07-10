// Cliente HTTP central. Fala com o backend Fastify (backend-unified).
// - Injeta o accessToken em toda chamada autenticada.
// - Em 401, tenta UMA vez renovar via /auth/refresh e repete a chamada.
// - Se o refresh falhar, limpa a sessão e redireciona pro /login.

import { tokens } from './tokens';
import type {
  LoginResponse,
  DocumentTemplate,
  RenderedDocument,
  DocKind,
  ClientLite,
  MeusProcessosResponse,
  Anexo,
  AuthUser,
  ConsultaResponse,
  AntecedentesResponse,
  MandadoResponse,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.soscriminalapp.com.br/api/v1';

export class ApiException extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiException';
  }
}

function redirectToLogin() {
  tokens.clear();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

// Renova o access token. Retorna o novo token ou null se não for possível.
let refreshInFlight: Promise<string | null> | null = null;
async function refreshAccess(): Promise<string | null> {
  // Coalesce: várias 401 simultâneas disparam um único refresh.
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = tokens.getRefresh();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as LoginResponse;
      tokens.set(data.accessToken, data.refreshToken, data.user);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

interface RequestOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // default true
  // Quando true, devolve o Response cru (usado pra baixar PDF como blob).
  raw?: boolean;
  signal?: AbortSignal;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = 'GET', body, auth = true, raw = false, signal } = opts;

  const doFetch = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  let res = await doFetch(auth ? tokens.getAccess() : null);

  // 401 → tenta renovar o token uma vez e repete.
  if (res.status === 401 && auth) {
    const newToken = await refreshAccess();
    if (!newToken) {
      redirectToLogin();
      throw new ApiException(401, 'Unauthorized', 'Sessão expirada. Faça login novamente.');
    }
    res = await doFetch(newToken);
  }

  if (raw) {
    if (!res.ok) {
      throw new ApiException(res.status, 'RawError', `Falha ao baixar (${res.status}).`);
    }
    return res as unknown as T;
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const code = (data && typeof data === 'object' && 'error' in data ? (data as any).error : 'Error') as string;
    const msg =
      (data && typeof data === 'object' && 'message' in data ? (data as any).message : null) ??
      `Erro ${res.status}`;
    throw new ApiException(res.status, code, msg);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ─────────────────────────────────────────────
// Métodos tipados por domínio
// ─────────────────────────────────────────────

export const api = {
  // AUTH
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    tokens.set(data.accessToken, data.refreshToken, data.user);
    return data;
  },

  async me(): Promise<AuthUser> {
    return request<AuthUser>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      tokens.clear();
    }
  },

  // DOCUMENTOS
  // Lista os 2 documentos fixos (procuração + honorários) com estado atual.
  async getDocumento(kind: DocKind): Promise<DocumentTemplate> {
    return request<DocumentTemplate>(`/documents/${kind}`);
  },

  // Salva o template editado do advogado.
  async salvarDocumento(kind: DocKind, title: string, body: string): Promise<DocumentTemplate> {
    return request<DocumentTemplate>('/documents/', {
      method: 'PUT',
      body: { kind, title, body },
    });
  },

  // Volta o template ao padrão.
  async resetarDocumento(kind: DocKind): Promise<DocumentTemplate> {
    return request<DocumentTemplate>(`/documents/${kind}`, { method: 'DELETE' });
  },

  // Renderiza (preenche variáveis) — opcionalmente com um cliente e overrides.
  async renderDocumento(
    kind: DocKind,
    clientId?: string,
    variables?: Record<string, string>,
  ): Promise<RenderedDocument> {
    return request<RenderedDocument>(`/documents/${kind}/render`, {
      method: 'POST',
      body: { clientId, variables },
    });
  },

  // CLIENTES
  async listarClientes(): Promise<ClientLite[]> {
    // O backend expõe clientes vinculados; normalizamos pro shape ClientLite.
    const raw = await request<any>('/clients');
    const arr: any[] = Array.isArray(raw) ? raw : (raw?.clients ?? raw?.resultados ?? []);
    return arr.map((c) => ({
      id: c.id,
      cpf: c.cpf ?? null,
      fullName: c.fullName ?? c.user?.fullName ?? c.nome ?? null,
      planTier: c.planTier,
    }));
  },

  // PROCESSOS
  async meusProcessos(refresh = false): Promise<MeusProcessosResponse> {
    const q = refresh ? '?fonte=refresh' : '';
    return request<MeusProcessosResponse>(`/processos/meus-processos${q}`);
  },

  // ANEXOS (PDF)
  async listarAnexos(): Promise<Anexo[]> {
    const raw = await request<any>('/documents/anexos');
    return Array.isArray(raw) ? raw : (raw?.anexos ?? raw?.resultados ?? []);
  },

  // Pede uma URL pré-assinada de upload (o backend devolve { url, key/fields }).
  async anexoUploadUrl(fileName: string, contentType: string): Promise<any> {
    return request<any>('/documents/anexos/upload-url', {
      method: 'POST',
      body: { fileName, contentType },
    });
  },

  // Registra o anexo após subir pro storage.
  async registrarAnexo(payload: Record<string, unknown>): Promise<Anexo> {
    return request<Anexo>('/documents/anexos', { method: 'POST', body: payload });
  },

  async excluirAnexo(id: string): Promise<void> {
    await request(`/documents/anexos/${id}`, { method: 'DELETE' });
  },

  // ── CONSULTAS (as três batem no backend real; 402 = precisa comprar no app) ──

  // Consulta processual por CNJ ou CPF.
  async consultaProcessual(
    tipo: 'cnj' | 'cpf',
    valor: string,
    signedTransaction?: string,
  ): Promise<ConsultaResponse> {
    return request<ConsultaResponse>('/processos/consulta', {
      method: 'POST',
      body: { tipo, valor: valor.trim(), signedTransaction },
    });
  },

  // Antecedentes criminais por CPF + nome.
  async antecedentes(
    cpf: string,
    nome: string,
    signedTransaction?: string,
  ): Promise<AntecedentesResponse> {
    return request<AntecedentesResponse>('/processos/cpf/antecedentes', {
      method: 'POST',
      body: { cpf: cpf.replace(/\D/g, ''), nome: nome.trim(), signedTransaction },
    });
  },

  // Consulta de mandado de prisão (BNMP) por CPF + nome (+ nome da mãe opcional).
  async mandadoConsulta(
    cpf: string,
    nome: string,
    nomeMae?: string,
    signedTransaction?: string,
  ): Promise<MandadoResponse> {
    return request<MandadoResponse>('/processos/mandado/consulta', {
      method: 'POST',
      body: {
        cpf: cpf.replace(/\D/g, ''),
        nome: nome.trim(),
        nomeMae: nomeMae?.trim() || undefined,
        signedTransaction,
      },
    });
  },
};

export { BASE as API_BASE };
