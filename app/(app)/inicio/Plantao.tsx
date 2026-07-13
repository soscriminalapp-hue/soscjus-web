'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📡 PLANTÃO ADV. — o resumo na home
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ESPELHO do backend real: GET /mural/meu-perfil devolve SEMPRE 200,
 *     envelopado em { perfil: {...} | null }. Nunca 404.
 *
 *     Bug corrigido: a versão anterior lia a resposta como se já fosse o
 *     perfil — então perfil=null virava "disponivel: undefined" → o card
 *     mostrava "invisível" (vermelho) em vez do convite pra configurar.
 *
 *  ⚠️ NUNCA desconta token — efeito de rede (Provimento 205 OAB).
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { sosc } from '@/lib/api';
import Icon from '@/components/Icon';
import s from './plantao.module.css';

interface PerfilMural {
  nomeExibicao: string;
  disponivel: boolean;
  oabValidada: boolean;
  perfilPublicado: boolean;
}

export default function Plantao() {
  const [perfil, setPerfil] = useState<PerfilMural | null>(null);
  const [novos, setNovos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [mudando, setMudando] = useState(false);

  const ler = useCallback(async () => {
    try {
      const r = await sosc.get<{ perfil: PerfilMural | null }>('/mural/meu-perfil');
      setPerfil(r.perfil);

      if (r.perfil?.perfilPublicado) {
        try {
          const c = await sosc.get<{ stats?: { novos?: number } }>('/mural/casos?status=NOVO');
          setNovos(c.stats?.novos ?? 0);
        } catch {
          /* sem assinatura ativa — não é erro fatal na home */
        }
      }
    } catch {
      setPerfil(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void ler();
  }, [ler]);

  async function alternar() {
    if (!perfil || mudando) return;
    const novo = !perfil.disponivel;
    setMudando(true);
    setPerfil({ ...perfil, disponivel: novo }); // otimista
    try {
      await sosc.patch('/mural/disponibilidade', { disponivel: novo });
    } catch {
      setPerfil({ ...perfil, disponivel: !novo }); // desfaz — provável 409 sem perfil
    } finally {
      setMudando(false);
    }
  }

  if (carregando) {
    return <div className={`card ${s.skel}`} />;
  }

  /* ─── Nunca configurou: o convite, nunca o vermelho ─── */
  if (!perfil) {
    return (
      <section className={`card ${s.card} ${s.convite}`}>
        <div className={s.corpo}>
          <span className={s.ic}>
            <Icon n="radar" s={24} />
          </span>
          <div className={s.txt}>
            <h2>Plantão Adv.</h2>
            <p>
              Do outro lado, o usuário abre o <b>Buscar Advogado</b> — e você aparece.{' '}
              <b>5 a 10 pessoas por dia</b> procuram advogado no SOSC JUS.
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

  const ligado = perfil.disponivel;

  return (
    <section className={`card ${s.card} ${ligado ? s.on : s.off}`}>
      <div className={s.corpo}>
        <span className={`${s.ic} ${ligado ? s.icOn : ''}`}>
          <Icon n="radar" s={24} />
        </span>

        <div className={s.txt}>
          <div className={s.titulo}>
            <h2>Plantão Adv.</h2>
            {novos > 0 ? <b className={s.n}>{novos} esperando</b> : null}
          </div>

          <p>
            {!perfil.oabValidada ? (
              <b className={s.pendente}>Sua OAB ainda está sendo validada.</b>
            ) : ligado ? (
              novos > 0 ? (
                <>
                  <b>
                    {novos} {novos === 1 ? 'pessoa está procurando' : 'pessoas estão procurando'}{' '}
                    advogado
                  </b>{' '}
                  — e você aparece pra elas.
                </>
              ) : (
                <>
                  Você está <b>visível</b> no Buscar Advogado.
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
          <button
            className={`${s.sw} ${ligado ? s.swOn : ''}`}
            onClick={() => void alternar()}
            disabled={mudando || !perfil.oabValidada}
            aria-label={ligado ? 'Ficar invisível' : 'Ficar visível'}
            title={!perfil.oabValidada ? 'A OAB precisa ser validada primeiro' : ''}
          >
            <i />
          </button>

          {novos > 0 ? (
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
