/**
 * lib/creditos.ts — ⚠️ ESPELHO do backend
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🪙 TOKENS — não "créditos", não "R$"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  🔴 O PROBLEMA QUE ISTO RESOLVE
 *
 *     Com "20 créditos", o advogado LIA "R$ 20,00".
 *
 *     · o número BATIA com o preço (R$ 9,90 → 20 créditos)
 *     · "crédito" JÁ é palavra de dinheiro (cartão de crédito, crédito
 *       bancário, "você tem crédito na loja") — 40 anos de treino
 *     · e "20/mês" virava "R$ 20,00 por mês"
 *
 *     Ele achava que estava pagando O DOBRO.
 *
 *  ✅ 1 token = R$ 0,001
 *
 *       R$  2,90  →   3.000 tokens
 *       R$  9,90  →  10.000 tokens
 *       R$ 19,90  →  20.000 tokens
 *       R$ 79,90  →  80.000 tokens
 *
 *     "10.000 tokens" NÃO parece "R$ 9,90". Ele não faz a conta de cabeça.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ AS 3 REGRAS — NÃO QUEBRE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. SEMPRE escreva "tokens".      ❌ 10.000   ✅ 10.000 tokens
 *  2. Frequência é LEGENDA.         ❌ 10.000/mês
 *                                   ✅ 10.000 tokens · cobrado todo mês
 *  3. Mostre o que SOBRA.           ❌ "custa 10.000"
 *                                   ✅ "você tem 35.000 · fica com 25.000"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ FONTE DA VERDADE: O BACKEND.
 *     Se divergirem, o card mostra um preço e o backend cobra outro.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const VALOR_TOKEN = 0.001;

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
  /** O que ela FAZ. Não "relatório já vem junto". */
  entrega: string;
  /** 🪙 tokens */
  tokens: number;
  reais: number;
  relatorioIncluso: boolean;
  /** Cobrado todo mês. ⚠️ vira LEGENDA, nunca sufixo. */
  recorrente?: boolean;
  /** 🇧🇷 Varre o Brasil inteiro. */
  nacional?: boolean;
}

export const PRECOS: Record<Feature, Ferramenta> = {
  /* ── R$ 2,90 · 3.000 tokens ── */
  RELATORIO: {
    nome: 'Relatório',
    entrega:
      'O processo explicado — como o advogado falaria com o cliente. Sem jargão.',
    tokens: 3_000,
    reais: 2.9,
    relatorioIncluso: false,
  },
  JURISCREATOR: {
    nome: 'JurisCreator',
    entrega:
      'Jurisprudência + criativo: o post pronto para o Instagram, com legenda.',
    tokens: 3_000,
    reais: 2.9,
    relatorioIncluso: false,
  },
  MEU_MANDADO: {
    nome: 'Consultar meu CPF',
    entrega: 'Existe mandado de prisão contra você? Sai com o comprovante.',
    tokens: 3_000,
    reais: 2.9,
    relatorioIncluso: true,
    nacional: true,
  },

  /* ── R$ 9,90 · 10.000 tokens ── */
  CONSULTA_MANDADO: {
    nome: 'Consulta de Mandado',
    entrega:
      'Existe mandado em aberto contra a pessoa? BNMP/CNJ, com comprovante.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: true,
    nacional: true,
  },
  CONSULTA_CADASTRAL: {
    nome: 'Consulta Cadastral',
    entrega:
      'Nome, CPF, celular ou e-mail → ficha + antecedentes + mandado, num relatório único.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: true,
    nacional: true,
  },
  CONSULTA_PROCESSUAL: {
    nome: 'Consulta Processual SOSC',
    entrega:
      'O pente-fino: até 200 processos da pessoa, em qualquer tribunal do Brasil.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: true,
    nacional: true,
  },
  ACOMPANHAMENTO: {
    nome: 'Acompanhar um processo',
    entrega:
      'O tribunal publicou? Você é avisado — sem precisar entrar aqui para conferir.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: true,
    recorrente: true,
  },
  ATUALIZACAO_NACIONAL: {
    nome: 'Sincronizar a lista',
    entrega: 'Varre a sua OAB de novo — todos os tribunais do Brasil.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: false,
    nacional: true,
  },
  CADASTRO_MANUAL: {
    nome: 'Cadastrar processo',
    entrega:
      'Uma varredura naquele momento: capa e últimas movimentações. Serve para segredo de justiça.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: true,
    nacional: true,
  },
  ANEXAR_CONEXO: {
    nome: 'Anexar processo conexo',
    entrega: 'O Escavador busca o conexo e traz as movimentações dele.',
    tokens: 10_000,
    reais: 9.9,
    relatorioIncluso: true,
    nacional: true,
  },

  /* ── R$ 19,90 · 20.000 tokens ── */
  PENTE_FINO_VEICULO: {
    nome: 'Pente-Fino do Veículo',
    entrega:
      'Placa → FIPE, dono, RENAJUD (penhora), roubo, leilão, chassi remarcado.',
    tokens: 20_000,
    reais: 19.9,
    relatorioIncluso: true,
    nacional: true,
  },

  /* ── R$ 79,90 · 80.000 tokens ── */
  FINAISJUS: {
    nome: 'FinaisJus Pro',
    entrega: 'O PDF do processo e o vídeo da audiência viram a peça escrita.',
    tokens: 80_000,
    reais: 79.9,
    relatorioIncluso: true,
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   🟢 GRÁTIS — nunca desconta token
   ═══════════════════════════════════════════════════════════════════════ */

export const CORTESIAS = {
  PRIMEIRA_BUSCA: {
    nome: 'A primeira busca',
    porque: 'Cortesia SOSC JUS — seus tokens ficam intactos.',
    eraRS: '9,90',
  },
  PRIMEIRO_ACOMPANHAMENTO: {
    nome: 'Um processo acompanhado por 30 dias',
    porque: 'Escolha o mais importante. Por nossa conta, no primeiro mês.',
    eraRS: '9,90',
  },
  ANALISAR_PRINT: {
    nome: 'Analisar / Verificar Print',
    porque: 'Já vem com o laudo em PDF. Grátis. Sempre.',
    eraRS: '9,90',
  },
  PLANTAO: {
    nome: 'Plantão Adv.',
    porque: 'Grátis no seu plano. Não desconta token.',
  },
  PRAZO_MANUAL: {
    nome: 'Criar prazo ou audiência na mão',
    porque: 'Você sabe melhor que a máquina. Não custa nada.',
  },
  ANEXAR_PECA: {
    nome: 'Anexar peça ao processo',
    porque: 'Organizar não custa. Só a leitura por IA é cobrada.',
  },
} as const;

/**
 * ⚠️ ASSINATURA À PARTE — NÃO USA TOKEN.
 *
 * SÓ o USUÁRIO. O advogado não consulta o próprio mandado.
 */
export const ALERTA_DIARIO = {
  nome: 'Alerta de Mandado Diário',
  precoBRL: 39.9,
  productId: 'br.com.soscriminal.user.mandado.monthly',
  debitaToken: false,
} as const;

/* ═══════════════════════════════════════════════════════════════════════
   OS PLANOS
   ═══════════════════════════════════════════════════════════════════════ */

export const PLANOS = {
  DEFESA: { nome: 'Defesa', precoBRL: 9.9, tokens: 10_000 },
  ESSENCIAL: { nome: 'Essencial', precoBRL: 9.9, tokens: 10_000 },
  ELITE: { nome: 'Elite', precoBRL: 29.9, tokens: 35_000 },
} as const;

export function tokensDoPlano(tier: string, fundador?: boolean): number {
  if (fundador) return 15_000;
  const t = tier === 'PRO' || tier === 'OPERACIONAL' ? 'ELITE' : tier;
  if (t === 'ELITE') return 35_000;
  if (t === 'DEFESA' || t === 'ESSENCIAL') return 10_000;
  return 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   OS PACOTES
   ═══════════════════════════════════════════════════════════════════════

   ⚠️ Teto da Apple: R$ 599,90 POR TRANSAÇÃO. E só os price tiers dela.

      Mas o pacote é CONSUMÍVEL — compra quantas vezes quiser.
   ═══════════════════════════════════════════════════════════════════════ */

export interface Pacote {
  id: string;
  tokens: number;
  precoBRL: number;
  bonusPct: number;
  destaque?: boolean;
  productId: string;
}

export const PACOTES: Pacote[] = [
  { id: 'p1', tokens: 60_000, precoBRL: 59.9, bonusPct: 0, productId: 'br.com.soscriminal.creditos.100' },
  { id: 'p2', tokens: 130_000, precoBRL: 129.9, bonusPct: 8, productId: 'br.com.soscriminal.creditos.250' },
  { id: 'p3', tokens: 250_000, precoBRL: 249.9, bonusPct: 17, destaque: true, productId: 'br.com.soscriminal.creditos.500' },
  { id: 'p4', tokens: 400_000, precoBRL: 399.9, bonusPct: 17, productId: 'br.com.soscriminal.creditos.800' },
  { id: 'p5', tokens: 600_000, precoBRL: 599.9, bonusPct: 17, productId: 'br.com.soscriminal.creditos.1200' },
];

/** ⚠️ Acima disto, confirma. Abaixo, clica e usa. */
export const LIMIAR_CONFIRMACAO = 10_000;

/* ─── helpers ─── */

export interface Saldo {
  doPlano: number | null;
  comprados: number | null;
  total: number | null;
  ilimitado: boolean;
  fundador: boolean;
  competencia: string;
}

/** ⚠️ 10000 → "10.000" */
export function fmt(n: number): string {
  return n.toLocaleString('pt-BR');
}

export function podeGastar(saldo: number, f: Feature): boolean {
  return saldo >= PRECOS[f].tokens;
}

export function precisaConfirmar(f: Feature): boolean {
  return PRECOS[f].tokens > LIMIAR_CONFIRMACAO;
}

export type TomSaldo = 'ok' | 'baixo' | 'zerado' | 'infinito';

export function tomDoSaldo(total: number, ilimitado?: boolean): TomSaldo {
  if (ilimitado) return 'infinito';
  if (total <= 0) return 'zerado';
  if (total < 10_000) return 'baixo';
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
  'PRAZO_MANUAL',
  'ANEXAR_PECA',
] as const;
