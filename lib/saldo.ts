import { buscarSosc } from './proxy';

/** O saldo, para as telas server-side. Se o backend não responder, 0. */
export async function lerSaldo(): Promise<number> {
  const c = await buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>(
    '/creditos/saldo',
  );
  return c.data?.saldo?.ilimitado
    ? Number.POSITIVE_INFINITY
    : (c.data?.saldo?.total ?? 0);
}
