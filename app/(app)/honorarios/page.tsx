import { buscarSosc } from '@/lib/proxy';
import Honorarios from './Honorarios';

export const dynamic = 'force-dynamic';

interface Cobranca {
  id: string;
  clientName?: string;
  clientId?: string;
  amount?: number;
  description?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  paidAt?: string;
}
interface Cliente { id: string; fullName?: string }
interface Banco { pixKey?: string; bankName?: string; holderName?: string }

export default async function Page() {
  const [c, cl, b] = await Promise.all([
    buscarSosc<{ charges?: Cobranca[] }>('/honorarios/charges'),
    buscarSosc<{ clients?: Cliente[] }>('/clients'),
    buscarSosc<Banco>('/honorarios/bank-account'),
  ]);

  return (
    <Honorarios
      cobrancas={c.data?.charges ?? []}
      clientes={cl.data?.clients ?? []}
      banco={b.data ?? null}
    />
  );
}
