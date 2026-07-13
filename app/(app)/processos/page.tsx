import { buscarSosc } from '@/lib/proxy';
import Tabela from './Tabela';

export const dynamic = 'force-dynamic';

/**
 * MEUS PROCESSOS — a tabela.
 *
 * ⚠️ ELE TEM 284 PROCESSOS.
 *
 * No celular isso é uma lista infinita — ele rola, rola, e não acha.
 * Na tela grande isso é uma TABELA: filtro, ordenação, busca, cor por área.
 *
 * É a MESMA ferramenta. Melhor apresentada.
 *
 * ⚠️ E NÃO SINCRONIZA AO ABRIR. Lê o que já está salvo. Sincronizar de novo
 *    custa 10.000 tokens — e é um BOTÃO, não um efeito colateral.
 */

interface Proc {
  numero_processo?: string;
  cnj?: string;
  classe?: string;
  assunto?: string;
  tribunal?: string;
  varaComarca?: string;
  cliente?: string;
  poloAtivo?: string;
  poloPassivo?: string;
  ultima_mov?: string;
  ultimaMov?: string;
  ultimaMovData?: string;
  dataDistribuicao?: string;
  monitorado?: boolean;
  temNovidade?: boolean;
  conexoDe?: string | null;
  segredoJustica?: boolean;
}

export default async function Processos() {
  const [r, c] = await Promise.all([
    buscarSosc<{ resultados?: Proc[]; processos?: Proc[] }>('/processos/meus-processos'),
    buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>('/creditos/saldo'),
  ]);

  const lista = r.data?.resultados ?? r.data?.processos ?? [];
  const ilimitado = c.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Number.POSITIVE_INFINITY : (c.data?.saldo?.total ?? 0);

  return <Tabela processos={lista} saldo={saldo} />;
}
