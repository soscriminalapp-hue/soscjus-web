import { buscarSosc } from '@/lib/proxy';
import Mural from './Mural';

export const dynamic = 'force-dynamic';

/**
 * 📡 PLANTÃO ADV. — A CONEXÃO COM O USUÁRIO.
 *
 * Do outro lado, no app, isso se chama "Buscar Advogado". É a MESMA ponte.
 *
 * ⚠️ É AQUI QUE O CLIENTE NOVO CHEGA. 5 a 10 por dia — enquanto o SOS
 *    acontece ~1×/mês. O Plantão é o VOLUME.
 *
 * ⚠️ E NUNCA COBRE POR ISTO:
 *
 *   1. EFEITO DE REDE. Se ele achar que desconta token, DESLIGA. O mural
 *      esvazia. O usuário não acha advogado. O PRODUTO MORRE.
 *
 *   2. PROVIMENTO 205 (OAB). Cobrar por caso recebido é COBRANÇA POR LEAD —
 *      vedado. É o que separa "software" de "intermediação de clientela".
 */

interface Perfil {
  disponivel?: boolean;
  areas?: string[];
  cidade?: string;
  uf?: string;
  bio?: string;
  whatsapp?: string;
}
interface Caso {
  id: string;
  area?: string;
  cidade?: string;
  uf?: string;
  resumo?: string;
  criadoEm?: string;
  status?: string;
  nomeCliente?: string;
  whatsapp?: string;
}

export default async function Page() {
  const [p, c] = await Promise.all([
    buscarSosc<Perfil>('/mural/meu-perfil'),
    buscarSosc<{ casos?: Caso[] }>('/mural/casos'),
  ]);

  return (
    <Mural
      perfil={p.data ?? null}
      casos={c.data?.casos ?? []}
      semPerfil={!p.ok || !p.data}
    />
  );
}
