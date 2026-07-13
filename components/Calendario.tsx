'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📅 O CALENDÁRIO — o mês inteiro numa tela
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ISTO NÃO EXISTE NO CELULAR. Não cabe.
 *
 *  Ele bate o olho e vê o mês: onde tem prazo, onde tem audiência, onde a
 *  semana está pesada. É o que ele faz com a agenda de papel — e nenhum app
 *  de celular conseguiu substituir, porque a tela é pequena demais.
 *
 *  E daqui ele:
 *    · exporta pro Google Calendar (.ics, com ALARME)
 *    · imprime a pauta do mês (Ctrl+P)
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import s from './calendario.module.css';

export interface Item {
  id: string;
  tipo: 'prazo' | 'audiencia';
  titulo: string;
  data: Date;
  cliente?: string;
  cnj?: string;
  local?: string;
  /** dias até vencer (só prazo) */
  dias?: number;
}

const MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendario({ itens }: { itens: Item[] }) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [aberto, setAberto] = useState<Date | null>(null);

  /** As células do mês — incluindo os dias vizinhos, para fechar a grade. */
  const celulas = useMemo(() => {
    const primeiro = new Date(ano, mes, 1);
    const inicio = new Date(primeiro);
    inicio.setDate(inicio.getDate() - primeiro.getDay());

    const out: Array<{ d: Date; doMes: boolean; itens: Item[] }> = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      out.push({
        d,
        doMes: d.getMonth() === mes,
        itens: itens.filter((x) => mesmoDia(x.data, d)),
      });
    }
    return out;
  }, [mes, ano, itens]);

  const doMes = itens.filter(
    (i) => i.data.getMonth() === mes && i.data.getFullYear() === ano,
  );
  const nPrazos = doMes.filter((i) => i.tipo === 'prazo').length;
  const nAud = doMes.filter((i) => i.tipo === 'audiencia').length;

  function andar(n: number) {
    const d = new Date(ano, mes + n, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
    setAberto(null);
  }

  const abertos = aberto ? itens.filter((x) => mesmoDia(x.data, aberto)) : [];

  return (
    <div className={s.wrap}>
      {/* ─── O CABEÇALHO ─── */}
      <header className={s.topo}>
        <div className={s.nav}>
          <button onClick={() => andar(-1)} aria-label="Mês anterior">
            <Icon n="chev" s={17} strokeWidth={2.4} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2>
            {MES[mes]} <em>{ano}</em>
          </h2>
          <button onClick={() => andar(1)} aria-label="Próximo mês">
            <Icon n="chev" s={17} strokeWidth={2.4} />
          </button>
        </div>

        <div className={s.resumo}>
          {nPrazos > 0 ? (
            <span className={s.rPrazo}>
              <i />
              {nPrazos} {nPrazos === 1 ? 'prazo' : 'prazos'}
            </span>
          ) : null}
          {nAud > 0 ? (
            <span className={s.rAud}>
              <i />
              {nAud} {nAud === 1 ? 'audiência' : 'audiências'}
            </span>
          ) : null}
          <button
            className="btn b-ghost sm"
            onClick={() => {
              setMes(hoje.getMonth());
              setAno(hoje.getFullYear());
            }}
          >
            Hoje
          </button>
        </div>
      </header>

      {/* ─── A GRADE ─── */}
      <div className={s.grade}>
        {DIA.map((d) => (
          <span key={d} className={s.cabDia}>
            {d}
          </span>
        ))}

        {celulas.map((c, i) => {
          const ehHoje = mesmoDia(c.d, hoje);
          const temPrazo = c.itens.some((x) => x.tipo === 'prazo');
          const vencido = c.itens.some((x) => x.tipo === 'prazo' && (x.dias ?? 9) < 0);

          return (
            <button
              key={i}
              className={`${s.cel} ${c.doMes ? '' : s.fora} ${ehHoje ? s.hoje : ''} ${
                aberto && mesmoDia(c.d, aberto) ? s.sel : ''
              } ${vencido ? s.vencido : temPrazo ? s.comPrazo : ''}`}
              onClick={() => setAberto(c.itens.length > 0 ? c.d : null)}
            >
              <b className="num">{c.d.getDate()}</b>

              <div className={s.pontos}>
                {c.itens.slice(0, 3).map((x) => (
                  <i
                    key={x.id}
                    className={x.tipo === 'prazo' ? s.pPrazo : s.pAud}
                    title={x.titulo}
                  />
                ))}
                {c.itens.length > 3 ? <em>+{c.itens.length - 3}</em> : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── O DIA ABERTO ─── */}
      {aberto && abertos.length > 0 ? (
        <div className={s.dia}>
          <header>
            <h3>
              {aberto.getDate()} de {MES[aberto.getMonth()]}
            </h3>
            <button onClick={() => setAberto(null)} aria-label="Fechar">
              <Icon n="x" s={16} strokeWidth={2.4} />
            </button>
          </header>

          <div className={s.itens}>
            {abertos.map((x) => (
              <Link
                key={x.id}
                href={`/processos/${encodeURIComponent(x.cnj ?? '')}`}
                className={`${s.item} ${x.tipo === 'prazo' ? s.iPrazo : s.iAud}`}
              >
                <span className={s.iIc}>
                  <Icon n={x.tipo === 'prazo' ? 'relogio' : 'agenda'} s={16} />
                </span>
                <div>
                  <strong>{x.titulo}</strong>
                  <small>
                    {x.cliente ?? '—'}
                    {x.local ? ` · ${x.local}` : ''}
                  </small>
                </div>
                {x.tipo === 'audiencia' ? (
                  <em className="num">
                    {x.data.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </em>
                ) : (
                  <em className={(x.dias ?? 9) < 0 ? s.venceu : ''}>
                    {(x.dias ?? 9) < 0 ? 'venceu' : `${x.dias}d`}
                  </em>
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
