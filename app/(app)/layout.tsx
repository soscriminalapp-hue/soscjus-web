import { redirect } from 'next/navigation';
import { sessaoAtual } from '@/lib/session';
import { buscarSosc } from '@/lib/proxy';
import Shell from '@/components/Shell';

export const dynamic = 'force-dynamic';

interface SaldoAPI {
  saldo?: { total?: number | null; ilimitado?: boolean; fundador?: boolean };
}

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const s = await sessaoAtual();
  if (!s) redirect('/login');

  // O saldo aparece no topo de TODA tela. Se o backend não responder,
  // mostra 0 — mas NUNCA quebra a navegação.
  const c = await buscarSosc<SaldoAPI>('/creditos/saldo');

  return (
    <Shell
      adv={{
        nome: s.nome,
        email: s.email,
        oab: s.oab ?? null,
        plano: s.plano ?? 'DEFESA',
        saldoTokens: c.data?.saldo?.total ?? 0,
        ilimitado: c.data?.saldo?.ilimitado ?? false,
        fundador: c.data?.saldo?.fundador ?? false,
      }}
    >
      {children}
    </Shell>
  );
}
