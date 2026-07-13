import { buscarSosc } from '@/lib/proxy';
import Tokens from './Tokens';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const r = await buscarSosc<{
    saldo?: {
      doPlano?: number | null;
      comprados?: number | null;
      total?: number | null;
      ilimitado?: boolean;
      fundador?: boolean;
    };
    plano?: string;
  }>('/creditos/saldo');

  return <Tokens saldo={r.data?.saldo ?? null} plano={r.data?.plano ?? 'DEFESA'} />;
}
