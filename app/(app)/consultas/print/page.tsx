import { lerSaldo } from '@/lib/saldo';
import AnalisarPrint from './AnalisarPrint';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const saldo = await lerSaldo();
  return <AnalisarPrint saldo={saldo} />;
}
