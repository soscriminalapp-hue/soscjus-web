// Tipos espelhando as respostas do backend Fastify (backend-unified).
// Mantidos frouxos onde o backend também é frouxo, pra não quebrar em campos opcionais.

export type Role = 'CLIENT' | 'LAWYER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  // effectivePlan é injetado pelo backend (withEffectivePlan). Frouxo de propósito.
  effectivePlan?: string | null;
  [k: string]: unknown;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// ── Documentos (contrato de honorários + procuração) ──
export type DocKind = 'PROCURACAO' | 'HONORARIOS';

export interface DocumentTemplate {
  kind: DocKind;
  title: string;
  body: string;
  status?: 'PADRAO' | 'EDITADO';
}

export interface RenderedDocument {
  kind: DocKind;
  title: string;
  body: string;
  variables: Record<string, string>;
}

// ── Cliente ──
export interface ClientLite {
  id: string;
  cpf: string | null;
  fullName: string | null;
  planTier?: string;
}

// ── Processo (formato de /meus-processos) ──
export interface Movimentacao {
  data?: string;
  descricao?: string;
  [k: string]: unknown;
}

export interface Processo {
  numero_processo: string;
  classe: string | null;
  area: string | null;
  tribunal: string | null;
  comarca: string | null;
  instancia: string | null;
  status: string | null;
  polo_ativo: string | null;
  polo_passivo: string | null;
  cliente: string | null;
  ultima_mov: string | null;
  movimentacoes: Movimentacao[];
  monitorado: boolean;
  temNovidade: boolean;
}

export interface MeusProcessosResponse {
  total: number;
  resultados: Processo[];
  fonte: 'cache' | 'refresh' | string;
  usosMes: number;
  cota: number | null;
  plano: string;
  podeMonitorarPlano: boolean;
}

// ── Anexos PDF ──
export interface Anexo {
  id: string;
  title: string | null;
  fileName?: string | null;
  createdAt?: string;
  [k: string]: unknown;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ── Consulta processual (POST /processos/consulta) ──
export interface ConsultaItem {
  numero_processo: string;
  titulo: string | null;
  tribunal: string | null;
  instancia: string | null;
  [k: string]: unknown;
}
export interface ConsultaResponse {
  total: number;
  resultados: ConsultaItem[];
  usosMes: number;
  cota: number | null;
}

// ── Antecedentes (POST /processos/cpf/antecedentes) ──
// O backend faz passthrough do provedor (DirectData); shape é frouxo de propósito.
export interface AntecedentesResponse {
  ok: boolean;
  antecedentes: unknown;
}

// ── Mandado de prisão (POST /processos/mandado/consulta) ──
export interface MandadoResponse {
  mandados: unknown[];
  cpf: string;
  nome: string;
  [k: string]: unknown;
}
