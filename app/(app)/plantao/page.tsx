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
 *
 * B272 — o <Mural> agora é client-component e busca os próprios dados
 * (/mural/meu-perfil + /mural/casos) no browser; a página só o renderiza.
 */
export default function Page() {
  return <Mural />;
}
