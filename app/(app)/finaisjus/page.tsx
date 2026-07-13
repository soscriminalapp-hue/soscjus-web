import { lerSaldo } from '@/lib/saldo';
import FinaisJus from './FinaisJus';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const saldo = await lerSaldo();
  return <FinaisJus saldo={saldo} />;
}
