import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import Icon from '@/components/Icon';
import s from './relatorios.module.css';

export const dynamic = 'force-dynamic';

/**
 * 📄 RELATÓRIOS — os que o cliente PEDIU e estão esperando você.
 *
 * ⚠️ Quando o cliente pede um relatório no app, ele cai aqui. Se você não
 *    revisar, ele não recebe. É por isso que o sino avisa.
 */

interface Rel {
  id: string;
  numeroProcesso?: string;
  clientName?: string;
  status?: string;
  createdAt?: string;
  rascunho?: string;
}

export default async function Relatorios() {
  const r = await buscarSosc<{ relatorios?: Rel[] }>('/processos/advogado/me/pendentes');
  const lista = r.data?.relatorios ?? [];

  const pendentes = lista.filter((x) => x.status === 'pending' || x.status === 'PENDING');

  return (
    <>
      <header className={s.topo}>
        <div>
          <h1>Relatórios</h1>
          <p>
            O processo explicado ao cliente — sem jargão. Quando ele pede pelo app,
            cai aqui para você revisar antes de enviar.
          </p>
        </div>
        {pendentes.length > 0 ? (
          <span className={s.n}>
            <b>{pendentes.length}</b> esperando você
          </span>
        ) : null}
      </header>

      {lista.length === 0 ? (
        <div className={`card ${s.vazio}`}>
          <Icon n="relatorio" s={38} />
          <p>Nenhum relatório pendente.</p>
          <small>
            Gere um relatório na tela de qualquer processo — ele usa 3.000 tokens e já
            vem pronto para o cliente ler.
          </small>
          <Link href="/processos" className="btn b-gold">
            <Icon n="processo" s={17} />
            Ver meus processos
          </Link>
        </div>
      ) : (
        <div className={s.lista}>
          {lista.map((x) => {
            const pend = x.status === 'pending' || x.status === 'PENDING';
            return (
              <Link
                key={x.id}
                href={`/processos/${encodeURIComponent(x.numeroProcesso ?? '')}`}
                className={`card ${s.rel} ${pend ? s.pend : ''}`}
              >
                <span className={`${s.ic} ${pend ? s.icPend : ''}`}>
                  <Icon n="relatorio" s={20} />
                </span>

                <div className={s.ri}>
                  <strong>{x.clientName ?? 'Cliente'}</strong>
                  <small className="num">{x.numeroProcesso ?? '—'}</small>
                  {x.createdAt ? (
                    <em>{new Date(x.createdAt).toLocaleDateString('pt-BR')}</em>
                  ) : null}
                </div>

                {pend ? (
                  <span className={s.selo}>
                    <i />
                    Revisar
                  </span>
                ) : (
                  <span className={s.ok}>
                    <Icon n="ok" s={13} strokeWidth={3} />
                    Enviado
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
