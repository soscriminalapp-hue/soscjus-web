import { buscarSosc } from '@/lib/proxy';
import Cabecalho from '@/components/Cabecalho';
import Icon from '@/components/Icon';
import s from './clientes.module.css';

export const dynamic = 'force-dynamic';

interface Cliente {
  id: string;
  fullName?: string;
  user?: { fullName?: string };
  status?: string;
  planTier?: string;
  _count?: { processos?: number };
  processosCount?: number;
}

function iniciais(n: string) {
  return n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default async function Clientes() {
  const r = await buscarSosc<{ clients?: Cliente[] } | Cliente[]>('/clients');
  const lista: Cliente[] = Array.isArray(r.data)
    ? r.data
    : ((r.data as { clients?: Cliente[] })?.clients ?? []);

  return (
    <>
      <Cabecalho
        eyebrow="Carteira conectada"
        titulo="Clientes"
        texto="Todo mundo que se vinculou a você pelo aplicativo. Cada um traz seus processos, contratos e conversas."
        acoes={
          <button className="btn b-gold">
            <Icon n="convite" s={19} strokeWidth={2.1} />
            Convidar cliente
          </button>
        }
      />

      <div className="card">
        <div className="card-b flush">
          {lista.length === 0 ? (
            <div className={s.vazio}>
              <Icon n="clientes" s={40} />
              <strong>Nenhum cliente vinculado ainda</strong>
              <p>
                Clique em &quot;Convidar cliente&quot;. Ele recebe o convite, baixa o
                aplicativo, e a partir do aceite vocês compartilham processos,
                documentos e a conversa.
              </p>
            </div>
          ) : (
            lista.map((c, i) => {
              const nome = c.fullName ?? c.user?.fullName ?? 'Cliente';
              const pendente = /^pending/i.test(String(c.status ?? ''));
              const n = c.processosCount ?? c._count?.processos ?? 0;
              return (
                <div key={c.id ?? i} className={s.linha}>
                  <div className={`${s.av} ${s['a' + ((i % 4) + 1)]}`}>
                    {iniciais(nome)}
                  </div>
                  <div className={s.info}>
                    <strong>{nome}</strong>
                    <span className={pendente ? s.pend : ''}>
                      {pendente
                        ? 'Convite ainda não aceito'
                        : `${n} ${n === 1 ? 'processo' : 'processos'} · ${c.planTier ?? 'ESSENCIAL'}`}
                    </span>
                  </div>
                  <Icon n="chev" s={18} className={s.seta} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
