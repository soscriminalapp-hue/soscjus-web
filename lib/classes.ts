/**
 * lib/classes.ts — as classes processuais, com cor
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ O ADVOGADO NÃO BUSCA POR "ÁREA". Ele busca por O QUE VAI FAZER HOJE.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  "Hoje eu vou trabalhar nos recursos" é um dia de trabalho real.
 *  "Hoje eu vou olhar os HCs" é um dia de trabalho real.
 *
 *  Por isso RECURSO e HABEAS CORPUS têm filtro PRÓPRIO — mesmo atravessando
 *  todas as áreas.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚡ POR QUE O HABEAS CORPUS TEM FILTRO SÓ DELE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  O réu está preso na Ação Penal. O advogado impetra:
 *
 *      AÇÃO PENAL 5000290-98  (o cliente está preso há 287 dias)
 *         ├─ HC 1234 · TJMG → negado
 *         ├─ HC 5678 · TJMG → negado
 *         ├─ HC 9012 · STJ  → liminar indeferida
 *         ├─ HC 3456 · STJ  → aguardando
 *         └─ HC 7890 · STF  → distribuído
 *
 *  CINCO HCs. UM PROCESSO. UM HOMEM PRESO.
 *
 *  Se eles aparecem soltos na lista, o advogado PERDE O FIO.
 *
 *  ⚠️ E é uma escada: TJ → STJ → STF. Ele precisa ver em que degrau está.
 *
 *  É LIBERDADE. É o mais urgente que existe.
 */

export type Cor =
  | 'criminal'
  | 'execucao'
  | 'hc'
  | 'recurso'
  | 'civel'
  | 'trabalhista'
  | 'familia'
  | 'fiscal'
  | 'outro';

export interface Classe {
  id: Cor;
  rotulo: string;
  /** A cor da barra e do chip. */
  cor: string;
  /** Fundo, bem apagado. */
  fundo: string;
  /** O que casa. Testado contra classe + assunto. */
  regex: RegExp;
  /** ⚠️ Atravessa TODAS as áreas (recurso, HC). */
  transversal?: boolean;
  /** Uma frase: o que é. */
  oQueE: string;
}

export const CLASSES: Classe[] = [
  {
    id: 'hc',
    rotulo: 'Habeas Corpus',
    // ⚡ AMARELO-URGENTE. É liberdade.
    cor: '#FFD426',
    fundo: 'rgba(255, 212, 38, .1)',
    regex: /habeas\s*corpus|\bhc\b/i,
    transversal: true,
    oQueE:
      'É liberdade. Um processo pode ter vários — TJ, STJ, STF. Clique e veja todos, agrupados pela origem.',
  },
  {
    id: 'criminal',
    rotulo: 'Criminal',
    cor: '#FF453A',
    fundo: 'rgba(255, 69, 58, .1)',
    regex:
      /a[çc][ãa]o penal|inqu[ée]rito|den[úu]ncia|criminal|crime|termo circunstanciado|jecrim|flagrante/i,
    oQueE: 'Ação penal, inquérito, denúncia — a acusação em curso.',
  },
  {
    id: 'execucao',
    rotulo: 'Execução Penal',
    cor: '#FF9F0A',
    fundo: 'rgba(255, 159, 10, .1)',
    regex: /execu[çc][ãa]o penal|vep\b|livramento|progress[ãa]o|remi[çc][ãa]o|indulto/i,
    oQueE: 'A pena em curso. Progressão, livramento, remição — outro ritmo.',
  },
  {
    id: 'recurso',
    rotulo: 'Recursos',
    cor: '#8B5CF6',
    fundo: 'rgba(139, 92, 246, .1)',
    regex:
      /apela[çc][ãa]o|recurso|agravo|embargos|resp\b|\bre\b|especial|extraordin[áa]rio|revis[ãa]o criminal/i,
    transversal: true,
    oQueE:
      'Apelação, agravo, RESP, RE. Atravessa todas as áreas — clique e veja todos.',
  },
  {
    id: 'civel',
    rotulo: 'Cível',
    cor: '#0A84FF',
    fundo: 'rgba(10, 132, 255, .1)',
    regex:
      /c[íi]vel|indeniza[çc][ãa]o|cobran[çc]a|monit[óo]ria|despejo|usucapi[ãa]o|obriga[çc][ãa]o de fazer|consumidor/i,
    oQueE: 'Indenização, cobrança, consumidor, despejo.',
  },
  {
    id: 'trabalhista',
    rotulo: 'Trabalhista',
    cor: '#30D158',
    fundo: 'rgba(48, 209, 88, .1)',
    regex: /trabalhista|reclamat[óo]ria|\bcltd?\b|v[íi]nculo empregat|rescis/i,
    oQueE: 'Reclamatória, vínculo, verbas rescisórias.',
  },
  {
    id: 'familia',
    rotulo: 'Família',
    cor: '#FF375F',
    fundo: 'rgba(255, 55, 95, .1)',
    regex:
      /fam[íi]lia|div[óo]rcio|alimentos|guarda|invent[áa]rio|uni[ãa]o est[áa]vel|reconhecimento de paternidade|tutela|cura?tela/i,
    oQueE: 'Divórcio, alimentos, guarda, inventário.',
  },
  {
    id: 'fiscal',
    rotulo: 'Fiscal',
    cor: '#D8A631',
    fundo: 'rgba(216, 166, 49, .1)',
    regex:
      /fiscal|tribut[áa]rio|execu[çc][ãa]o fiscal|d[íi]vida ativa|icms|iss\b|ipva|iptu|refis/i,
    oQueE: 'Execução fiscal, dívida ativa, tributário.',
  },
  {
    id: 'outro',
    rotulo: 'Outros',
    cor: '#8B8B91',
    fundo: 'rgba(139, 139, 145, .08)',
    regex: /.^/, // nunca casa — é o fallback
    oQueE: 'O que não entra nas outras.',
  },
];

/**
 * Qual classe é este processo?
 *
 * ⚠️ A ORDEM IMPORTA. O HC é testado PRIMEIRO — porque "Habeas Corpus"
 *    também casaria com "criminal", e aí ele sumiria no meio dos 89.
 */
export function classificar(classe?: string | null, assunto?: string | null): Cor {
  const t = `${classe ?? ''} ${assunto ?? ''}`;
  for (const c of CLASSES) {
    if (c.id === 'outro') continue;
    if (c.regex.test(t)) return c.id;
  }
  return 'outro';
}

/** Todas as classes que casam (um processo pode ser CRIMINAL **e** RECURSO). */
export function classificarTodas(classe?: string | null, assunto?: string | null): Cor[] {
  const t = `${classe ?? ''} ${assunto ?? ''}`;
  const out = CLASSES.filter((c) => c.id !== 'outro' && c.regex.test(t)).map((c) => c.id);
  return out.length ? out : ['outro'];
}

export function corDe(id: Cor): Classe {
  return CLASSES.find((c) => c.id === id) ?? CLASSES[CLASSES.length - 1];
}

/* ═══════════════════════════════════════════════════════════════════════════
   O TRIBUNAL — a escada do HC
   ═══════════════════════════════════════════════════════════════════════════

   TJ → STJ → STF

   O advogado precisa ver EM QUE DEGRAU está.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Degrau = 'TJ' | 'TRF' | 'STJ' | 'STF' | 'TST' | '?';

export function degrau(tribunal?: string | null): Degrau {
  const t = (tribunal ?? '').toUpperCase();
  if (/\bSTF\b|SUPREMO/.test(t)) return 'STF';
  if (/\bSTJ\b|SUPERIOR TRIBUNAL DE JUSTI/.test(t)) return 'STJ';
  if (/\bTST\b/.test(t)) return 'TST';
  if (/\bTRF\b|REGIONAL FEDERAL/.test(t)) return 'TRF';
  if (/\bTJ[A-Z]{2}\b|TRIBUNAL DE JUSTI/.test(t)) return 'TJ';
  return '?';
}

/** Quanto mais alto, mais perto do fim. */
export const PESO_DEGRAU: Record<Degrau, number> = {
  STF: 5,
  STJ: 4,
  TST: 4,
  TRF: 3,
  TJ: 2,
  '?': 1,
};

/* ═══════════════════════════════════════════════════════════════════════════
   O STATUS DO HC — o que importa saber de relance
   ═══════════════════════════════════════════════════════════════════════════ */

export type StatusHC = 'concedido' | 'negado' | 'aguardando' | 'liminar' | '?';

export function statusHC(ultimaMov?: string | null): StatusHC {
  const t = (ultimaMov ?? '').toLowerCase();
  if (/conced|deferi|expedi.*alvar|soltura/.test(t)) return 'concedido';
  if (/denega|indefer|neg[ao]|improced|prejudicad/.test(t)) return 'negado';
  if (/liminar/.test(t)) return 'liminar';
  if (/conclus|distribu|aguard|vista|parecer/.test(t)) return 'aguardando';
  return '?';
}

export const COR_STATUS: Record<StatusHC, string> = {
  concedido: '#30D158', // 🟢 saiu
  negado: '#FF453A', // 🔴 negado
  liminar: '#FFD426', // ⚡ tem liminar
  aguardando: '#0A84FF', // 🔵 esperando
  '?': '#8B8B91',
};

export const ROTULO_STATUS: Record<StatusHC, string> = {
  concedido: 'Concedido',
  negado: 'Negado',
  liminar: 'Liminar',
  aguardando: 'Aguardando',
  '?': '—',
};
