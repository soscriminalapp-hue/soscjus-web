import { buscarSosc } from '@/lib/proxy';
import Cabecalho from '@/components/Cabecalho';
import TabelaProcessos from './TabelaProcessos';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MEUS PROCESSOS — a tabela profissional
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ELE TEM 284 PROCESSOS.
 *
 *  No celular isso é uma lista infinita — ele rola, rola, e não acha.
 *
 *  Na tela grande isso é uma TABELA: filtro, ordenação, busca, cor por área.
 *
 *  É a MESMA ferramenta. Melhor apresentada.
 *
 *  ⚠️ E NÃO SINCRONIZA AO ABRIR. Lê o que já está salvo.
 *     Sincronizar de novo custa 💎 20 — e é um botão, não um efeito colateral.
 */

interface Proc {
  numero_processo?: string;
  cnj?: string;
  classe?: string;
  assunto?: string;
  area?: string;
  tribunal?: string;
  varaComarca?: string;
  status?: string;
  cliente?: string;
  poloAtivo?: string;
  poloPassivo?: string;
  ultima_mov?: string;
  ultimaMov?: string;
  ultimaMovData?: string;
  monitorado?: boolean;
  temNovidade?: boolean;
  conexoDe?: string | null;
  dataDistribuicao?: string;
}

export default async function Processos() {
  const [r, s] = await Promise.all([
    buscarSosc<{ resultados?: Proc[]; processos?: Proc[] }>('/processos/meus-processos'),
    buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>(
      '/creditos/saldo',
    ),
  ]);

  const lista = r.data?.resultados ?? r.data?.processos ?? [];
  const ilimitado = s.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Infinity : (s.data?.saldo?.total ?? 0);

  return (
    <>
      <Cabecalho
        eyebrow="Buscados pela sua OAB · em todos os tribunais"
        titulo="Meus"
        destaque="Processos"
        texto="Onde você atua. Filtre por classe, ordene, e acompanhe os que importam."
      />

      <TabelaProcessos
        processos={lista}
        saldo={saldo}
        ilimitado={ilimitado}
      />
    </>
  );
}
