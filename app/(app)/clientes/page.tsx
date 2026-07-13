import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import Icon from '@/components/Icon';
import s from './clientes.module.css';

export const dynamic = 'force-dynamic';

interface Cliente {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  processosCount?: number;
  createdAt?: string;
}

export default async function Clientes() {
  const r = await buscarSosc<{ clients?: Cliente[] }>('/clients');
  const lista = r.data?.clients ?? [];

  return (
    <>
      <header className={s.topo}>
        <div>
          <h1>Meus Clientes</h1>
          <p>
            Quem já está com você no SOSC JUS. Clique para ver os processos, o
            contrato e as cobranças.
          </p>
        </div>
        <Link href="/clientes/convidar" className="btn b-lime">
          <Icon n="convite" s={17} />
          Convidar cliente
        </Link>
      </header>

      {lista.length === 0 ? (
        <div className={`card ${s.vazio}`}>
          <Icon n="clientes" s={38} />
          <p>Nenhum cliente ainda.</p>
          <small>
            Quando você convida um cliente e ele entra, o SOSC JUS busca{' '}
            <b>todos os processos dele</b> — inclusive os que você não sabia que
            existiam.
          </small>
          <Link href="/clientes/convidar" className="btn b-lime">
            <Icon n="convite" s={17} />
            Convidar o primeiro
          </Link>
        </div>
      ) : (
        <div className={s.grade}>
          {lista.map((c) => (
            <Link key={c.id} href={`/clientes/${c.id}`} className={`card ${s.cli}`}>
              <span className={s.avatar}>
                {(c.fullName ?? '?')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()}
              </span>

              <div className={s.info}>
                <strong>{c.fullName ?? 'Cliente'}</strong>
                <small>{c.email ?? c.phone ?? '—'}</small>
              </div>

              {typeof c.processosCount === 'number' ? (
                <span className={s.n}>
                  <b className="num">{c.processosCount}</b>
                  <em>processos</em>
                </span>
              ) : null}

              <Icon n="chev" s={17} className={s.seta} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
