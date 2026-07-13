/**
 * SOSC JUS · Áreas do Mural — espelho exato de src/lib/areas.ts (backend).
 *
 * ⚠️ FONTE ÚNICA DUPLICADA POR NECESSIDADE. Se divergir do backend, o
 *    formulário aceita um ID que o schema recusa, ou mostra um título
 *    errado para o ID que vier de volta. Editando um, edite o outro.
 */

export type Ramo = 'CRIMINAL' | 'CIVEL';

export interface Area {
  id: string;
  ico: string;
  titulo: string;
  desc: string;
  slaHoras?: number;
}

export const SLA_PADRAO_HORAS = 48;
export const SLA_URGENTE_HORAS = 6;

export const AREAS_CRIMINAL: readonly Area[] = [
  { id: 'BO', ico: '🚔', titulo: 'B.O Agora', desc: 'Prisão, flagrante, condução, intimação, mandado', slaHoras: SLA_URGENTE_HORAS },
  { id: 'CUSTODIA', ico: '⛓️', titulo: 'Audiência de custódia', desc: 'Preso vai ser apresentado ao juiz', slaHoras: SLA_URGENTE_HORAS },
  { id: 'TRAFICO', ico: '💊', titulo: 'Tráfico', desc: 'Drogas, porte, associação' },
  { id: 'ARMA', ico: '🔫', titulo: 'Arma', desc: 'Posse, porte, disparo' },
  { id: 'FURTO', ico: '🎒', titulo: 'Furto / Roubo', desc: 'Levaram algo, com ou sem violência' },
  { id: 'VIDA', ico: '⚖️', titulo: 'Crimes contra a vida', desc: 'Homicídio, tentativa, júri' },
  { id: 'TRANSITO_C', ico: '🚗', titulo: 'Trânsito', desc: 'Embriaguez, atropelamento, fuga' },
  { id: 'DIGITAL', ico: '💻', titulo: 'Golpe e digital', desc: 'Estelionato, fraude, internet' },
  { id: 'VD', ico: '🏠', titulo: 'Violência doméstica', desc: 'Lei Maria da Penha' },
  { id: 'BRIGA', ico: '👊', titulo: 'Briga', desc: 'Lesão, ameaça, injúria' },
  { id: 'EXEC', ico: '🔓', titulo: 'Já condenado', desc: 'Progressão, livramento, indulto' },
  { id: 'OUTRO_C', ico: '📋', titulo: 'Outra situação', desc: 'Não sei classificar' },
] as const;

export const AREAS_CIVEL: readonly Area[] = [
  { id: 'COB_IND', ico: '💳', titulo: 'Cobrança indevida', desc: 'Cobraram o que não devo' },
  { id: 'NEGAT', ico: '🚫', titulo: 'Negativação indevida', desc: 'Nome sujo sem motivo' },
  { id: 'VOO', ico: '✈️', titulo: 'Atraso de voo', desc: 'Atraso, cancelamento, overbooking' },
  { id: 'BAGAGEM', ico: '🧳', titulo: 'Extravio de bagagem', desc: 'Mala perdida, danificada ou atrasada' },
  { id: 'SAUDE', ico: '❤️', titulo: 'Plano de saúde', desc: 'Negativa, reajuste, carência' },
  { id: 'VIAGEM', ico: '🌴', titulo: 'Pacotes de viagem', desc: 'Hotel, agência, pacote' },
  { id: 'REEMB', ico: '🔄', titulo: 'Cancelamento e reembolso', desc: 'Não devolveram meu dinheiro' },
  { id: 'GOLPE_V', ico: '🛡', titulo: 'Golpes contra o consumidor', desc: 'Fraude, site falso, PIX' },
  { id: 'ACID', ico: '🚗', titulo: 'Acidente de trânsito', desc: 'Bateram no meu carro' },
  { id: 'INSS', ico: '👥', titulo: 'Desconto indevido INSS', desc: 'Desconto que não autorizei' },
  { id: 'DANOS', ico: '⚖️', titulo: 'Danos morais', desc: 'Fui humilhado ou prejudicado' },
  { id: 'CONTAS', ico: '⚡', titulo: 'Contas (água, luz, telefone)', desc: 'Conta errada, corte indevido' },
  { id: 'DIVIDAS', ico: '🧾', titulo: 'Cobrança de dívidas', desc: 'Quero receber o que me devem' },
  { id: 'VIZINHO', ico: '🏘', titulo: 'Problemas de vizinhança', desc: 'Barulho, infiltração, muro' },
  { id: 'OUTRO_V', ico: '📋', titulo: 'Outra situação', desc: 'Não sei classificar' },
] as const;

export const RAMOS = {
  CRIMINAL: { nome: 'Criminal', areas: AREAS_CRIMINAL },
  CIVEL: { nome: 'Pequenas Causas', areas: AREAS_CIVEL },
} as const;

export const TODAS_AREAS: readonly Area[] = [...AREAS_CRIMINAL, ...AREAS_CIVEL];
export const AREA_POR_ID = new Map(TODAS_AREAS.map((a) => [a.id, a]));

export function acharArea(id: string): Area | undefined {
  return AREA_POR_ID.get(id);
}

/** Cores do módulo — a identidade visual real do Mural. */
export const CORES_MURAL = {
  miami: '#00A9E0', // advogado
  lima: '#B6FF00', // usuário
  vermelho: '#E23B3B', // criminal
} as const;
