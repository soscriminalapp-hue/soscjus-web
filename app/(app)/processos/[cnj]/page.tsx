import { notFound } from 'next/navigation';
import { buscarSosc } from '@/lib/proxy';
import Detalhe from './Detalhe';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  O DETALHE DO PROCESSO — em DUAS COLUNAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ISTO É O MOTIVO DA ESTAÇÃO EXISTIR.
 *
 *  No celular ele vê UMA coisa por vez: ou a capa, ou as movimentações, ou o
 *  relatório. Ele rola pra cima e pra baixo, e PERDE O FIO.
 *
 *  Aqui:
 *    ESQUERDA  → a capa e a linha do tempo inteira
 *    DIREITA   → o que ele FAZ: acompanhar, relatório, peça, conexo
 *
 *  Ele lê a movimentação e clica em "gerar relatório" SEM TROCAR DE TELA.
 */

interface Mov {
  data?: string;
  descricao?: string;
  tipo?: string;
  temTeor?: boolean;
}
interface Parte {
  nome?: string;
  polo?: string;
  tipo?: string;
}
interface Capa {
  numero_processo?: string;
  cnj?: string;
  classe?: string;
  assunto?: string;
  tribunal?: string;
  varaComarca?: string;
  vara?: string;
  comarca?: string;
  juiz?: string;
  valorCausa?: number;
  dataDistribuicao?: string;
  status?: string;
  segredoJustica?: boolean;
  monitorado?: boolean;
  temNovidade?: boolean;
  relatorioDisponivel?: boolean;
  cliente?: string;
  clientUserId?: string;
  movimentacoes?: Mov[];
  partes?: Parte[];
  poloAtivo?: string;
  poloPassivo?: string;
}

export default async function Page({ params }: { params: { cnj: string } }) {
  const cnj = decodeURIComponent(params.cnj);

  const [p, c] = await Promise.all([
    buscarSosc<Capa>(`/processos/${encodeURIComponent(cnj)}/salvo`),
    buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>('/creditos/saldo'),
  ]);

  if (!p.ok || !p.data) notFound();

  const ilimitado = c.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Number.POSITIVE_INFINITY : (c.data?.saldo?.total ?? 0);

  return <Detalhe cnj={cnj} capa={p.data} saldo={saldo} />;
}
