import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import Cabecalho from '@/components/Cabecalho';
import Icon from '@/components/Icon';
import Sincronizar from './Sincronizar';
import s from './processos.module.css';

export const dynamic = 'force-dynamic';

interface Proc {
  numero_processo: string;
  classe?: string;
  area?: string;
  tribunal?: string;
  comarca?: string;
  cliente?: string;
  ultima_mov?: string;
  ultima_data?: string;
  monitorado?: boolean;
  temNovidade?: boolean;
}

export default async function Processos() {
  const r = await buscarSosc<{ resultados?: Proc[]; total?: number }>(
    '/processos/meus-processos',
  );

  const lista = r.data?.resultados ?? [];
  const falhou = !r.ok;

  return (
    <>
      <Cabecalho
        eyebrow="Lista nacional pela sua OAB"
        titulo="Meus"
        destaque="Processos"
        texto="Todos os processos em que você atua, em qualquer tribunal do país. Os monitorados avisam sozinhos quando andam."
        acoes={<Sincronizar />}
      />

      {falhou ? (
        <div className="nota risk">
          <Icon n="alerta" s={20} />
          <p>
            <b>Não foi possível carregar seus processos agora.</b> Isso não quer dizer
            que você não tem nenhum — quer dizer que o servidor não respondeu. Clique em
            &quot;Sincronizar OAB&quot; para tentar de novo.
          </p>
        </div>
      ) : lista.length === 0 ? (
        <div className={s.vazio}>
          <Icon n="processo" s={40} />
          <strong>Nenhum processo por aqui ainda</strong>
          <p>
            Clique em &quot;Sincronizar OAB&quot; e o sistema busca em todos os
            tribunais os processos em que você aparece como advogado.
          </p>
        </div>
      ) : (
        lista.map((p) => {
          const crim = /crim/i.test(p.area ?? '');
          return (
            <Link
              key={p.numero_processo}
              href={`/processos/${encodeURIComponent(p.numero_processo)}`}
              className={`${s.proc} ${p.temNovidade ? s.novo : ''}`}
            >
              <div className={s.topo}>
                <span className={`${s.area} ${crim ? s.crim : s.civ}`}>
                  {p.area ?? 'Não classificado'}
                </span>
                {p.monitorado ? (
                  <span className={s.mon}>
                    <i /> MONITORADO
                  </span>
                ) : (
                  <span className={`${s.mon} ${s.off}`}>
                    <i /> NÃO MONITORADO
                  </span>
                )}
                {p.ultima_data ? <span className={s.quando}>{p.ultima_data}</span> : null}
              </div>

              <span className={s.cnj}>{p.numero_processo}</span>
              <h3>{p.classe ?? 'Classe não informada'}</h3>
              <p className={s.meta}>
                {[p.cliente, p.tribunal, p.comarca].filter(Boolean).join(' · ')}
              </p>

              {p.ultima_mov ? (
                <div className={s.mov}>
                  <Icon n="atividade" s={17} />
                  <div>
                    <small>Última movimentação</small>
                    <p>{p.ultima_mov}</p>
                  </div>
                </div>
              ) : null}

              <span className={s.abrir}>
                Abrir a capa do processo
                <Icon n="chev" s={16} strokeWidth={2.4} />
              </span>
            </Link>
          );
        })
      )}
    </>
  );
}
