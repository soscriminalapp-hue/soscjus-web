import { buscarSosc } from '@/lib/proxy';
import Agenda from './Agenda';

export const dynamic = 'force-dynamic';

/**
 * PRAZOS E AUDIÊNCIAS.
 *
 * ⚠️ SÃO MOTORES DIFERENTES. Um conta dias (CPC, CPP, JECRIM). O outro marca
 *    compromisso (data, hora, local). Nunca misture — mesmo estando na mesma
 *    tela, são ABAS separadas.
 *
 * ⚠️ E O ADVOGADO PODE CRIAR NA MÃO.
 *
 *    O advogado raiz tem 30 anos de método próprio. Se o sistema IMPÕE o
 *    jeito dele fazer, ele volta pro Word.
 *
 *    Automático por padrão. Manual sempre disponível. E o manual é GRÁTIS —
 *    ninguém foi ao tribunal buscar nada.
 */

interface Prazo {
  id?: string;
  tipo?: string;
  cliente?: string;
  numeroProcesso?: string;
  dataFim?: string;
  diasRestantes?: number;
  baseLegal?: string;
  validado?: boolean;
}
interface Audiencia {
  id?: string;
  tipo?: string;
  cliente?: string;
  numeroProcesso?: string;
  data?: string;
  local?: string;
}

export default async function Page() {
  const [p, a, c] = await Promise.all([
    buscarSosc<{ prazos?: Prazo[] }>('/processos/meus-prazos'),
    buscarSosc<{ audiencias?: Audiencia[] }>('/processos/minhas-audiencias'),
    buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>('/creditos/saldo'),
  ]);

  const ilimitado = c.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Number.POSITIVE_INFINITY : (c.data?.saldo?.total ?? 0);

  return (
    <Agenda
      prazos={p.data?.prazos ?? []}
      audiencias={a.data?.audiencias ?? []}
      saldo={saldo}
    />
  );
}
