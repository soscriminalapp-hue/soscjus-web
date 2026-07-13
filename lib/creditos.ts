/**
 * lib/creditos.ts — ESPELHO do backend.
 *
 * ⚠️ Este arquivo TEM QUE BATER com backend/src/lib/entitlements.ts.
 *    Se divergirem, o card mostra um preço e o backend cobra outro — e o
 *    advogado descobre que foi enganado.
 *
 * Fonte da verdade: o BACKEND. A web só espelha para mostrar o preço ANTES
 * do clique. Quem debita é o servidor.
 *
 *      R$  2,90  →    6 💎
 *      R$  9,90  →   20 💎
 *      R$ 19,90  →   40 💎
 *      R$ 79,90  →  160 💎
 */

export const VALOR_CREDITO = 0.5;

export type Feature =
  | 'MEU_MANDADO'
  | 'ACOMPANHAMENTO'
  | 'CONSULTA_MANDADO'
  | 'ANEXAR_CONEXO'
  | 'CONSULTA_CADASTRAL'
  | 'CONSULTA_PROCESSUAL'
  | 'ATUALIZACAO_NACIONAL'
  | 'CADASTRO_MANUAL'
  | 'PENTE_FINO_VEICULO'
  | 'RELATORIO'
  | 'JURISCREATOR'
  | 'FINAISJUS';

export interface Ferramenta {
  nome: string;
  entrega: string;
  creditos: number;
  reais: number;
  relatorioIncluso: boolean;
  recorrente?: boolean;
}

export const PRECOS: Record<Feature, Ferramenta> = {
  /* ── R$ 2,90 · 6 💎 ── */
  RELATORIO: {
    nome: 'Relatório',
    entrega: 'Outro relatório do mesmo item — o primeiro já veio no pacote.',
    creditos: 6,
    reais: 2.9,
    relatorioIncluso: false,
  },
  JURISCREATOR: {
    nome: 'Criativo do JurisCreator',
    entrega: 'A jurisprudência vira um post pronto para publicar.',
    creditos: 6,
    reais: 2.9,
    relatorioIncluso: false,
  },
  MEU_MANDADO: {
    nome: 'Consultar meu CPF',
    entrega: 'Só o seu CPF: existe mandado em aberto contra você?',
    creditos: 6,
    reais: 2.9,
    relatorioIncluso: true,
  },

  /* ── R$ 9,90 · 20 💎 ── */
  CONSULTA_MANDADO: {
    nome: 'Consulta de Mandado',
    entrega: 'O CPF de outra pessoa. Com relatório e comprovante.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: true,
  },
  CONSULTA_CADASTRAL: {
    nome: 'Consulta Cadastral',
    entrega:
      'Nome, CPF, celular ou e-mail. Traz tudo da pessoa — ficha, antecedentes, e mandado se houver.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: true,
  },
  CONSULTA_PROCESSUAL: {
    nome: 'Consulta Processual SOSC',
    entrega: 'Pente-fino. Todos os processos da pessoa no Brasil inteiro.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: true,
  },
  ACOMPANHAMENTO: {
    nome: 'Acompanhar um processo',
    entrega: 'O tribunal publicou? Você fica sabendo. Um pacote, um processo.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: true,
    recorrente: true,
  },
  ATUALIZACAO_NACIONAL: {
    nome: 'Sincronizar a lista de novo',
    entrega: 'A primeira busca foi por nossa conta. Esta é a atualização.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: false,
  },
  CADASTRO_MANUAL: {
    nome: 'Buscar o processo no tribunal',
    entrega: 'Cadastrar o CNJ é grátis. Isto é a busca.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: true,
  },
  ANEXAR_CONEXO: {
    nome: 'Anexar processo conexo',
    entrega: 'O Escavador busca e atualiza as movimentações do conexo.',
    creditos: 20,
    reais: 9.9,
    relatorioIncluso: true,
  },

  /* ── R$ 19,90 · 40 💎 ── */
  PENTE_FINO_VEICULO: {
    nome: 'Pente-Fino do Veículo',
    entrega: 'Placa, modelo, FIPE, restrições — e quem é o dono, com o CPF.',
    creditos: 40,
    reais: 19.9,
    relatorioIncluso: true,
  },

  /* ── R$ 79,90 · 160 💎 ── */
  FINAISJUS: {
    nome: 'Peça do FinaisJus Pro',
    entrega: 'O processo e a audiência viram a peça escrita.',
    creditos: 160,
    reais: 79.9,
    relatorioIncluso: true,
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   🟢 GRÁTIS — nunca desconta crédito
   ═══════════════════════════════════════════════════════════════════════ */

export const CORTESIAS = {
  PRIMEIRA_BUSCA: {
    nome: 'A primeira busca',
    porque: 'Cortesia SOSC JUS — seus créditos ficam intactos.',
  },
  PRIMEIRO_ACOMPANHAMENTO: {
    nome: 'Um processo acompanhado por 30 dias',
    porque: 'Escolha o mais importante. Por nossa conta, no primeiro mês.',
  },
  ANALISAR_PRINT: {
    nome: 'Analisar Print',
    porque: 'Grátis. Sempre.',
  },
  ACIONAR_SOS: {
    nome: 'Acionar o SOS',
    porque: 'Nunca vai custar crédito. É para isso que o app existe.',
  },
  VERIFICAR_PROVA: {
    nome: 'Verificar prova ou gravação SOSC',
    porque: 'É o nosso próprio selo. Conferir não custa nada.',
  },
  PLANTAO: {
    nome: 'Plantão Adv.',
    porque: 'Grátis no seu plano. Não desconta crédito.',
  },
} as const;

/**
 * ASSINATURA À PARTE — não toca no crédito.
 *
 * ⚠️ Só o USUÁRIO. O advogado não fica consultando o próprio mandado.
 *
 * A matemática vende sozinha:
 *     R$ 2,90 × 30 dias = R$ 87,00
 *     Ou R$ 39,90/mês — menos da metade.
 */
export const ALERTA_DIARIO = {
  nome: 'Alerta de Mandado Diário',
  precoBRL: 39.9,
  productId: 'br.com.soscriminal.user.mandado.monthly',
  debitaCredito: false,
} as const;

/* ═══════════════════════════════════════════════════════════════════════
   PLANOS
   ═══════════════════════════════════════════════════════════════════════ */

export const PLANOS = {
  DEFESA: { nome: 'Defesa', precoBRL: 9.9, creditos: 20 },
  ELITE: { nome: 'Elite', precoBRL: 29.9, creditos: 70 },
  ESSENCIAL: { nome: 'Essencial', precoBRL: 9.9, creditos: 20 },
} as const;

/** PRO / OPERACIONAL → ELITE. */
export function creditosDoPlano(tier: string, fundador?: boolean): number {
  if (fundador) return 30; // os 50
  const t = tier === 'PRO' || tier === 'OPERACIONAL' ? 'ELITE' : tier;
  if (t === 'ELITE') return 70;
  if (t === 'DEFESA' || t === 'ESSENCIAL') return 20;
  return 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   RECARGA
   ═══════════════════════════════════════════════════════════════════════

   ⚠️ Teto da Apple: R$ 599,90 POR TRANSAÇÃO. E só os price tiers dela.

      Mas o pacote é CONSUMÍVEL — compra quantas vezes quiser.
      Precisa de 2.400 💎? Compra o de R$ 599,90 duas vezes.

   ⚠️ Nenhum pacote desce abaixo de R$ 0,495/crédito — que é o preço do
      crédito no PLANO. Se descesse, ninguém assinaria, e assinatura é MRR.

       💎        Preço       R$/crédito
      100     R$  59,90       R$ 0,599
      250     R$ 129,90       R$ 0,520
      500     R$ 249,90       R$ 0,500
      800     R$ 399,90       R$ 0,500
     1200     R$ 599,90       R$ 0,500

   O PLANO continua ganhando: R$ 0,495 — e é automático.
   ═══════════════════════════════════════════════════════════════════════ */

export interface Pacote {
  id: string;
  creditos: number;
  precoBRL: number;
  bonusPct: number;
  destaque?: boolean;
  productId: string;
}

export const PACOTES: Pacote[] = [
  { id: 'p100', creditos: 100, precoBRL: 59.9, bonusPct: 0, productId: 'br.com.soscriminal.creditos.100' },
  { id: 'p250', creditos: 250, precoBRL: 129.9, bonusPct: 13, productId: 'br.com.soscriminal.creditos.250' },
  { id: 'p500', creditos: 500, precoBRL: 249.9, bonusPct: 17, destaque: true, productId: 'br.com.soscriminal.creditos.500' },
  { id: 'p800', creditos: 800, precoBRL: 399.9, bonusPct: 17, productId: 'br.com.soscriminal.creditos.800' },
  { id: 'p1200', creditos: 1200, precoBRL: 599.9, bonusPct: 17, productId: 'br.com.soscriminal.creditos.1200' },
];

/** Acima disto, confirma. Abaixo, clica e usa. */
export const LIMIAR_CONFIRMACAO = 20;

/* ── helpers ── */

export interface Saldo {
  doPlano: number | null;
  comprados: number | null;
  total: number | null;
  ilimitado: boolean;
  fundador: boolean;
  competencia: string;
}

export function podeGastar(saldo: number, f: Feature): boolean {
  return saldo >= PRECOS[f].creditos;
}

export function precisaConfirmar(f: Feature): boolean {
  return PRECOS[f].creditos > LIMIAR_CONFIRMACAO;
}

export function emReais(creditos: number): string {
  return (creditos * VALOR_CREDITO).toFixed(2).replace('.', ',');
}

export function precoDeTabela(f: Feature): string {
  return PRECOS[f].reais.toFixed(2).replace('.', ',');
}

export type TomSaldo = 'ok' | 'baixo' | 'zerado' | 'infinito';

export function tomDoSaldo(total: number, ilimitado?: boolean): TomSaldo {
  if (ilimitado) return 'infinito';
  if (total <= 0) return 'zerado';
  if (total < 20) return 'baixo';
  return 'ok';
}

/** Do barato ao caro. */
export const ORDEM_TABELA: Feature[] = [
  'RELATORIO',
  'JURISCREATOR',
  'MEU_MANDADO',
  'CONSULTA_MANDADO',
  'CONSULTA_CADASTRAL',
  'CONSULTA_PROCESSUAL',
  'ACOMPANHAMENTO',
  'ATUALIZACAO_NACIONAL',
  'CADASTRO_MANUAL',
  'ANEXAR_CONEXO',
  'PENTE_FINO_VEICULO',
  'FINAISJUS',
];

export const ORDEM_CORTESIAS = [
  'PRIMEIRA_BUSCA',
  'PRIMEIRO_ACOMPANHAMENTO',
  'ANALISAR_PRINT',
  'PLANTAO',
  'ACIONAR_SOS',
  'VERIFICAR_PROVA',
] as const;
