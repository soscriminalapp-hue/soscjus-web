'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📡 PLANTÃO ADV. — A CONEXÃO COM O USUÁRIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Do outro lado, no app do usuário, isso se chama "Buscar Advogado".
 *  É o MESMO mural — os dois lados da mesma ponte.
 *
 *  ⚠️ É AQUI QUE O CLIENTE NOVO CHEGA. 5 a 10 por dia.
 *
 *  Compare: o SOS acontece ~1×/mês. O Plantão é o VOLUME.
 *  Por isso ele vem antes de tudo que é "ferramenta".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ NUNCA COBRE POR ISTO. NUNCA.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. EFEITO DE REDE. Se ele achar que desconta token, DESLIGA. O mural
 *     esvazia. O usuário busca advogado e não acha ninguém. O PRODUTO MORRE.
 *
 *  2. PROVIMENTO 205 (OAB). Cobrar por caso recebido é COBRANÇA POR LEAD —
 *     vedado. É o que separa "software" de "intermediação de clientela".
 *
 *  Por isso o selo verde-limão: "Grátis · não desconta token".
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { sosc } from '@/lib/api';
import Icon from '@/components/Icon';
import s from './plantao.module.css';

interface Perfil {
  disponivel?: boolean;
  areas?: string[];
  cidade?: string;
}
interface Caso {
  id: string;
  area?: string;
  cidade?: string;
  resumo?: string;
  criadoEm?: string;
  status?: string;
}

export default function Plantao() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mudando, setMudando] = useState(false);
  const [semPerfil, setSemPerfil] = useState(false);

  const ler = useCallback(async () => {
    try {
      const p = await sosc.get<Perfil>('/mural/meu-perfil');
      setPerfil(p);
      try {
        const c = await sosc.get<{ casos?: Caso[] }>('/mural/casos');
        setCasos((c.casos ?? []).filter((x) => !x.status || x.status === 'NOVO'));
      } catch { /* sem casos ainda */ }
    } catch {
      // Nunca configurou o perfil do mural — mostramos o convite.
      setSemPerfil(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void ler(); }, [ler]);

  async function alternar() {
    if (!perfil || mudando) return;
    const novo = !perfil.disponivel;
    setMudando(true);
    setPerfil({ ...perfil, disponivel: novo });   // otimista — responde na hora
    try {
      await sosc.patch('/mural/disponibilidade', { disponivel: novo });
    } catch {
      setPerfil({ ...perfil, disponivel: !novo }); // deu errado: volta
    } finally {
      setMudando(false);
    }
  }

  if (carregando) {
    return <div className={`card ${s.skel}`} />;
  }

  /* ─── Nunca configurou: o convite ─── */
  if (semPerfil) {
    return (
      <section className={`card ${s.card} ${s.convite}`}>
        <div className={s.corpo}>
          <span className={s.ic}>
            <Icon n="radar" s={24} />
          </span>
          <div className={s.txt}>
            <h2>Plantão Adv.</h2>
            <p>
              Do outro lado, o usuário abre o <b>Buscar Advogado</b> — e você
              aparece. <b>5 a 10 pessoas por dia</b> procuram advogado no SOSC JUS.
            </p>
            <span className={s.gratis}>Grátis no seu plano · não desconta token</span>
          </div>
          <Link href="/plantao" className="btn b-lime">
            Configurar
            <Icon n="chev" s={16} strokeWidth={2.4} />
          </Link>
        </div>
      </section>
    );
  }

  const ligado = Boolean(perfil?.disponivel);

  return (
    <section className={`card ${s.card} ${ligado ? s.on : s.off}`}>
      <div className={s.corpo}>
        <span className={`${s.ic} ${ligado ? s.icOn : ''}`}>
          <Icon n="radar" s={24} />
        </span>

        <div className={s.txt}>
          <div className={s.titulo}>
            <h2>Plantão Adv.</h2>
            {casos.length > 0 ? (
              <b className={s.n}>{casos.length} esperando</b>
            ) : null}
          </div>

          {/* ⚠️ DESLIGADO = ELE ESTÁ INVISÍVEL. Isso precisa DOER. */}
          <p>
            {ligado ? (
              casos.length > 0 ? (
                <>
                  <b>
                    {casos.length}{' '}
                    {casos.length === 1 ? 'pessoa está procurando' : 'pessoas estão procurando'}{' '}
                    advogado
                  </b>{' '}
                  — e você aparece pra elas.
                </>
              ) : (
                <>
                  Você está <b>visível</b> no Buscar Advogado. Quando alguém
                  precisar, você aparece.
                </>
              )
            ) : (
              <b className={s.invisivel}>
                Você está invisível. Ninguém te encontra no Buscar Advogado.
              </b>
            )}
          </p>

          <span className={s.gratis}>Grátis no seu plano · não desconta token</span>
        </div>

        <div className={s.acoes}>
          {/* O SWITCH — o que ele mais usa (júri, férias, plantão) */}
          <button
            className={`${s.sw} ${ligado ? s.swOn : ''}`}
            onClick={alternar}
            disabled={mudando}
            aria-label={ligado ? 'Ficar invisível' : 'Ficar visível'}
            title={ligado ? 'Ficar invisível' : 'Ficar visível'}
          >
            <i />
          </button>

          {casos.length > 0 ? (
            <Link href="/plantao" className="btn b-lime">
              Ver casos
              <Icon n="chev" s={16} strokeWidth={2.4} />
            </Link>
          ) : (
            <Link href="/plantao" className="btn b-ghost">
              Meu perfil
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
