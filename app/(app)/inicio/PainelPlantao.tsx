'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📡 PLANTÃO ADV. — o card mais importante da estação
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  "Advogado que não tem cliente, adianta ter ferramenta?"
 *
 *  NÃO. Por isso o Plantão é a PRIMEIRA coisa que ele vê. Não é a 3ª aba.
 *
 *  Se está DESLIGADO, o card fica cinza e GRITA:
 *    "Você está invisível. Ninguém te encontra."
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ NUNCA COBRE POR ISTO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. EFEITO DE REDE. Se ele achar que desconta token, DESLIGA.
 *     O mural esvazia. O usuário busca advogado e não acha ninguém.
 *     O PRODUTO MORRE.
 *
 *  2. PROVIMENTO 205 (OAB). Cobrar por caso recebido é COBRANÇA POR LEAD
 *     — vedado. É o que separa "software" de "intermediação de clientela".
 *
 *  Por isso o selo verde-limão: "Grátis no seu plano · não desconta token".
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { sosc } from '@/lib/api';
import Icon from '@/components/Icon';
import s from './plantao.module.css';

interface Perfil {
  disponivel?: boolean;
  areas?: string[];
  cidades?: string[];
}
interface Caso {
  id?: string;
  area?: string;
  cidade?: string;
  criadoEm?: string;
  resumo?: string;
  status?: string;
}

function faz(v?: string) {
  if (!v) return '';
  const min = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function PainelPlantao() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const ler = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        sosc.get<Perfil>('/mural/meu-perfil'),
        sosc.get<{ casos?: Caso[] }>('/mural/casos'),
      ]);
      setPerfil(p);
      setCasos((c.casos ?? []).filter((x) => x.status !== 'RECUSADO'));
    } catch {
      /* sem assinatura ou offline — o card ainda convida */
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void ler();
  }, [ler]);

  async function alternar() {
    setOcupado(true);
    try {
      await sosc.patch('/mural/disponibilidade', {
        disponivel: !perfil?.disponivel,
      });
      await ler();
    } catch {
      /* silencioso */
    } finally {
      setOcupado(false);
    }
  }

  const ligado = Boolean(perfil?.disponivel);
  const semPerfil = !carregando && !perfil?.areas?.length;

  return (
    <section className={`${s.painel} ${ligado ? s.on : s.off}`}>
      <header className={s.topo}>
        <div className={s.tit}>
          <span className={s.radar}>
            <i />
            <i />
            <Icon n="radar" s={22} />
          </span>
          <div>
            <h2>Plantão Adv.</h2>
            <small>
              {ligado
                ? 'Quem precisa de advogado vê o seu cartão'
                : 'Você está invisível — ninguém te encontra'}
            </small>
          </div>
        </div>

        <div className={s.controle}>
          <span className={s.gratis}>Grátis · não desconta token</span>
          <button
            className={`${s.sw} ${ligado ? s.swOn : ''}`}
            onClick={alternar}
            disabled={ocupado || carregando || semPerfil}
            role="switch"
            aria-checked={ligado}
            aria-label="Ligar o plantão"
          />
        </div>
      </header>

      {/* ─── SEM PERFIL: ele nunca configurou ─── */}
      {semPerfil ? (
        <div className={s.convite}>
          <Icon n="alerta" s={20} />
          <div>
            <strong>Diga em que áreas e cidades você atende</strong>
            <p>
              Sem isso, ninguém te encontra. Leva 1 minuto — e a partir daí você
              recebe casos.
            </p>
          </div>
          <Link href="/plantao" className="btn b-tech">
            Configurar
          </Link>
        </div>
      ) : ligado ? (
        casos.length > 0 ? (
          /* ─── 🔴 TEM GENTE PROCURANDO ─── */
          <>
            <div className={s.alerta}>
              <span className={s.pulso}>
                <i />
                <i />
                <b />
              </span>
              <strong>
                {casos.length}{' '}
                {casos.length === 1 ? 'pessoa procurando' : 'pessoas procurando'}{' '}
                advogado agora
              </strong>
            </div>

            <div className={s.casos}>
              {casos.slice(0, 3).map((c, i) => (
                <Link key={c.id ?? i} href="/plantao" className={s.caso}>
                  <span className={s.area}>{c.area ?? 'Criminal'}</span>
                  <div className={s.cCorpo}>
                    <strong>{c.cidade ?? 'Sua cidade'}</strong>
                    <small>{faz(c.criadoEm)}</small>
                  </div>
                  <span className={s.cBtn}>
                    Ver caso
                    <Icon n="chev" s={14} strokeWidth={2.4} />
                  </span>
                </Link>
              ))}
            </div>

            {casos.length > 3 ? (
              <Link href="/plantao" className={s.maisCasos}>
                + {casos.length - 3} aguardando
              </Link>
            ) : null}
          </>
        ) : (
          /* ─── LIGADO, MAS VAZIO ─── */
          <div className={s.esperando}>
            <span className={s.pulso}>
              <i />
              <i />
              <b />
            </span>
            <div>
              <strong>No ar. Esperando.</strong>
              <p>
                {perfil?.areas?.join(' · ')}
                {perfil?.cidades?.length ? ` · ${perfil.cidades.join(', ')}` : ''}
              </p>
            </div>
            <Link href="/plantao" className={s.ajustar}>
              Ajustar
            </Link>
          </div>
        )
      ) : (
        /* ─── DESLIGADO: o grito ─── */
        <div className={s.desligado}>
          <Icon n="alerta" s={20} />
          <div>
            <strong>Você está invisível.</strong>
            <p>
              Quem precisa de advogado <b>não te encontra</b>. Ligue e comece a
              receber casos — sem custo nenhum.
            </p>
          </div>
          <button className="btn b-tech" onClick={alternar} disabled={ocupado}>
            {ocupado ? (
              <>
                <span className="spin" />
                Ligando…
              </>
            ) : (
              <>
                <Icon n="radar" s={18} strokeWidth={2.1} />
                Ligar o plantão
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
