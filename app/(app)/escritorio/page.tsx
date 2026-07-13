import { buscarSosc } from '@/lib/proxy';
import { sessaoAtual } from '@/lib/session';
import Escritorio from './Escritorio';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const ses = await sessaoAtual();
  const [adv, banco] = await Promise.all([
    buscarSosc<{ officeName?: string; logoUrl?: string; address?: string }>('/lawyers/me'),
    buscarSosc<{ pixKey?: string; bankName?: string; holderName?: string }>(
      '/honorarios/bank-account',
    ),
  ]);

  return (
    <Escritorio
      nome={ses?.nome ?? ''}
      oab={ses?.oab ?? ''}
      escritorio={adv.data?.officeName ?? ''}
      logo={adv.data?.logoUrl ?? ''}
      pix={banco.data?.pixKey ?? ''}
      banco={banco.data?.bankName ?? ''}
      titular={banco.data?.holderName ?? ''}
    />
  );
}
