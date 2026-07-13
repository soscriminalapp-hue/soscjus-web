/**
 * tipos.ts — o que o Escavador (API v2) devolve.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  A ECONOMIA POR TRÁS DESTES TIPOS — leia antes de mexer
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  R$ 4,50  → busca por CPF ou OAB. Traz até 200 processos, cada um com
 *             CAPA COMPLETA + MOVIMENTAÇÕES. Isso fica salvo no banco.
 *  R$ 0,15  → movimentação individual, quando precisa.
 *  R$ 2,90  → RELATÓRIO. Não re-sincroniza nada. Lê o que já está salvo e
 *             vai DIRETO NO CNJ buscar o inteiro teor.
 *
 *  ⚠️ O relatório NUNCA dispara sincronização. Se disparasse, cada relatório
 *     custaria R$ 4,50 + R$ 2,90 — e a margem morreria. Ele já tem o CNJ.
 * ═══════════════════════════════════════════════════════════════════════
 */

/** Papel de quem assina — é o que separa ATO DECISÓRIO de ruído cartorário. */
export type Autoridade =
  | 'MINISTRO'
  | 'DESEMBARGADOR'
  | 'JUIZ'
  | 'PROMOTOR'
  | 'DELEGADO'
  | 'ESCRIVAO'
  | 'OUTRO';

/** Peso do ato: define a ordem e o destaque na tela. */
export const PESO: Record<Autoridade, number> = {
  MINISTRO: 6,
  DESEMBARGADOR: 5,
  JUIZ: 4,
  PROMOTOR: 3,
  DELEGADO: 2,
  ESCRIVAO: 1,
  OUTRO: 0,
};

export const ROTULO: Record<Autoridade, string> = {
  MINISTRO: 'Ministro',
  DESEMBARGADOR: 'Desembargador',
  JUIZ: 'Juiz',
  PROMOTOR: 'Promotor de Justiça',
  DELEGADO: 'Delegado de Polícia',
  ESCRIVAO: 'Escrivão',
  OUTRO: 'Cartório',
};

/**
 * Infere quem assinou a partir do tipo do documento.
 *
 * O Escavador devolve o TIPO ("SENTENÇA", "PARECER", "CERTIDÃO"). Quando o
 * nome e o cargo vêm junto, usamos. Quando não vêm, o tipo já diz: sentença
 * é juiz, parecer é promotor, certidão é escrivão.
 */
export function quemAssinou(tipo: string, cargo?: string | null): Autoridade {
  const c = (cargo ?? '').toUpperCase();
  if (/MINISTR/.test(c)) return 'MINISTRO';
  if (/DESEMBARG/.test(c)) return 'DESEMBARGADOR';
  if (/JU[IÍ]Z|MAGISTRAD/.test(c)) return 'JUIZ';
  if (/PROMOTOR|MINIST[EÉ]RIO P[UÚ]BLICO|PROCURADOR/.test(c)) return 'PROMOTOR';
  if (/DELEGAD|AUTORIDADE POLICIAL/.test(c)) return 'DELEGADO';
  if (/ESCRIV|CHEFE DE SECRETARIA|SERVENTU/.test(c)) return 'ESCRIVAO';

  const t = (tipo ?? '').toUpperCase();
  if (/AC[OÓ]RD[AÃ]O|DECIS[AÃ]O MONOCR[AÁ]TICA|VOTO/.test(t)) return 'DESEMBARGADOR';
  if (/SENTEN[CÇ]A|DECIS[AÃ]O|DESPACHO|LIMINAR/.test(t)) return 'JUIZ';
  if (/PARECER|MANIFESTA[CÇ][AÃ]O DO MP|DEN[UÚ]NCIA|COTA MINISTERIAL/.test(t)) return 'PROMOTOR';
  if (/RELAT[OÓ]RIO DE INQU[EÉ]RITO|INDICIAMENTO|AUTO DE PRIS[AÃ]O/.test(t)) return 'DELEGADO';
  if (/CERTID[AÃ]O|CERTIFICO/.test(t)) return 'ESCRIVAO';
  return 'OUTRO';
}

/** Um documento de inteiro teor — assinado por alguém. */
export interface AtoDecisorio {
  tipo: string;
  autoridade: Autoridade;
  /** Nome do magistrado/promotor, quando o Escavador devolve. */
  assinante?: string | null;
  data: string | null;
  /** O teor. Pode ser longo. */
  texto: string;
  pdfUrl?: string | null;
}

/** Uma movimentação da linha do tempo. */
export interface Movimentacao {
  data: string | null;
  descricao: string;
  /** Se esta movimentação corresponde a um ato assinado. */
  ato?: AtoDecisorio | null;
}

/** A capa — tudo que o Escavador entrega nos R$ 4,50 já pagos. */
export interface CapaProcesso {
  cnj: string;
  classe: string | null;
  /** O TEMA (≠ classe, que é o tipo procedimental). */
  assunto: string | null;
  area: string | null;
  valorCausa: string | null;
  dataDistribuicao: string | null;
  tribunal: string | null;
  varaComarca: string | null;
  tituloPoloAtivo: string | null;
  tituloPoloPassivo: string | null;
  status: string;
  arquivado: boolean;
  segredoJustica: boolean;
  /** As partes. Cruza CPF com os clientes cadastrados. */
  envolvidos: Envolvido[];
  monitorado: boolean;
  temNovidade: boolean;
  ultimaMov: string | null;
  movimentacoes: Movimentacao[];
}

export interface Envolvido {
  nome: string;
  /** RÉU, AUTOR, VÍTIMA, TESTEMUNHA, ADVOGADO... */
  tipo: string | null;
  polo?: 'ATIVO' | 'PASSIVO' | null;
  cpf?: string | null;
  /** true quando este envolvido é cliente cadastrado do advogado. */
  meuCliente?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   OS CINCO RELATÓRIOS
   Um motor. A saída é a mesma para o advogado e para o cliente.
   ═══════════════════════════════════════════════════════════════ */

export type TipoRelatorio =
  | 'PROCESSUAL'
  | 'MANDADO'
  | 'CADASTRAL'
  | 'VEICULO'
  | 'PRINT';

export const RELATORIOS: Record<
  TipoRelatorio,
  { nome: string; oQueBusca: string }
> = {
  PROCESSUAL: {
    nome: 'Relatório Processual',
    oQueBusca:
      'A capa completa, todas as movimentações e o inteiro teor — sentença, decisão, despacho, parecer, certidão.',
  },
  MANDADO: {
    nome: 'Relatório de Mandado de Prisão',
    oQueBusca: 'O mandado, o processo de origem e as últimas movimentações dele.',
  },
  CADASTRAL: {
    nome: 'Relatório de Consulta Cadastral',
    oQueBusca:
      'Tudo que a base entrega sobre a pessoa — ficha, antecedentes, e mandado se houver.',
  },
  VEICULO: {
    nome: 'Relatório de Situação do Veículo',
    oQueBusca:
      'Tudo sobre o veículo — modelo, FIPE, proprietário, restrições e histórico.',
  },
  PRINT: {
    nome: 'Relatório de Print ou Gravação',
    oQueBusca: 'A perícia de integridade da imagem e a transcrição do conteúdo.',
  },
};

/**
 * O relatório pronto.
 *
 * ⚠️ REGRA QUE NÃO SE NEGOCIA — o relatório é ESPELHO, não CONSULTOR:
 *
 *   1. NUNCA vai contra o advogado. Se houve decurso de prazo, ele REGISTRA
 *      o ato ("foi certificado o decurso do prazo"), mas NUNCA qualifica
 *      ("a defesa perdeu o prazo", "houve inércia"). Um relatório que acusa
 *      o próprio usuário vira prova contra ele numa ação de responsabilidade.
 *
 *   2. NUNCA sugere o próximo passo. Estratégia é ato privativo de advogado
 *      (Lei 8.906, art. 1º). A IA descreve o que ACONTECEU. O advogado decide
 *      o que FAZER.
 *
 *   3. Fala como o advogado falaria com o cliente. Sem jargão, sem "Egrégia
 *      Câmara", sem print de movimentação. Traduz.
 */
export interface Relatorio {
  id: string;
  tipo: TipoRelatorio;
  /** CNJ, CPF, placa — o que identifica o objeto. */
  referencia: string;
  geradoEm: string;
  /** Veio no pacote de R$ 9,90 ou foi avulso de R$ 2,90? */
  origem: 'PACOTE' | 'AVULSO';
  /** O texto. É isto que o cliente lê. */
  texto: string;
  /** Os atos assinados, separados por autoridade. */
  atos?: AtoDecisorio[];
  /** Quem pediu — só para auditoria. NÃO muda o conteúdo. */
  pedidoPor?: 'ADVOGADO' | 'CLIENTE';
}

/* ═══════════════════════════════════════════════════════════════
   ACOMPANHAMENTO — R$ 9,90/mês
   1 pacote = 1 processo = 1 relatório DAQUELE processo.
   Não vira token. Não acumula. Não migra.
   ═══════════════════════════════════════════════════════════════ */

export interface Acompanhamento {
  /** Pacotes que o plano já dá: Defesa/Essencial = 1 · Elite = 2 */
  inclusos: number;
  /** Quantos processos estão sendo acompanhados agora. */
  emUso: number;
  /** Assinaturas de R$ 9,90/mês ativas. */
  slotsAtivos: number;
  /** Slots pagos que ainda não grudaram em nenhum processo. */
  slotsLivres: number;
  precoExtra: number;
  productId: string;
}
