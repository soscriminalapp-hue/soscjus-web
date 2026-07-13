'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔔 O SINO — é ele que faz o advogado DEIXAR A ESTAÇÃO ABERTA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Sem isto, ele abre, olha, e fecha.
 *  Com isto, ele deixa aberto — porque a estação CHAMA ELE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ AS ROTAS SÃO REAIS. Verificadas no backend.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  GET /lawyers/notificacoes  → { total, itens[] }  — já vem pronto
 *  GET /sos/active            → { sessions[] }      — o SOS é OUTRA coisa
 *  GET /mural/casos           → { casos[] }         — o Plantão
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  A ORDEM É POR URGÊNCIA — NÃO POR DATA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  🚨 SOS       → o cliente está sendo abordado AGORA (raro: ~1×/mês)
 *  💬 Chat      → o cliente falou com ele
 *  📡 Plantão   → gente procurando advogado (5-10/dia — é o volume)
 *  📄 Relatório → ele PEDIU e está esperando
 *  👤 Vínculo   → cliente novo entrou
 *  💰 Cobrança  → informou pagamento
 *  ● Processo   → o tribunal publicou
 *
 *  ⚠️ O SOS é RARO. Mas quando acontece, é O MAIS URGENTE QUE EXISTE.
 *     Por isso o sino fica VERMELHO E PULSA — e é a única coisa no app
 *     inteiro que tem licença pra gritar.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { sosc } from '@/lib/api';
import Icon, { type Nome } from './Icon';
import s from './sino.module.css';

type Tipo =
  | 'sos' | 'chat' | 'plantao' | 'relatorio' | 'vinculo'
  | 'cobranca' | 'processo' | 'documento' | 'suporte';

interface Aviso {
  id: string;
  tipo: Tipo;
  titulo: string;
  texto: string;
  quando?: string;
  href: string;
  peso: number;
  /** Pede AÇÃO dele — não é só um aviso. */
  pendente?: boolean;
}

const ICONE: Record<Tipo, Nome> = {
  sos: 'sos',
  chat: 'chat',
  plantao: 'radar',
  relatorio: 'relatorio',
  vinculo: 'clientes',
  cobranca: 'dinheiro',
  processo: 'atividade',
  documento: 'doc',
  suporte: 'sino',
};

const COR: Record<Tipo, string> = {
  sos: 'var(--risk-lit)',
  chat: 'var(--miami)',
  plantao: 'var(--lime)',
  relatorio: 'var(--mind-lit)',
  vinculo: 'var(--lime)',
  cobranca: 'var(--money-lit)',
  processo: 'var(--t2)',
  documento: 'var(--gold)',
  suporte: 'var(--t2)',
};

/** ⚠️ A URGÊNCIA. Não é a data. */
const PESO: Record<Tipo, number> = {
  sos: 1000,     // 🚨 ele está sendo abordado AGORA
  chat: 90,
  plantao: 80,   // 📡 o volume: 5-10/dia
  relatorio: 70,
  vinculo: 60,
  cobranca: 50,
  documento: 40,
  processo: 20,
  suporte: 10,
};

function destino(t: Tipo, ref: string): string {
  switch (t) {
    case 'sos':       return `/plantao/sos/${ref}`;
    case 'plantao':   return '/plantao';
    case 'processo':  return ref ? `/processos/${encodeURIComponent(ref)}` : '/processos';
    case 'cobranca':  return '/honorarios';
    case 'chat':
    case 'vinculo':
    case 'relatorio':
    case 'documento': return `/clientes/${ref}`;
    default:          return '/inicio';
  }
}

function faz(v?: string) {
  if (!v) return '';
  const min = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d` : `${Math.floor(d / 30)} mês`;
}

export default function Sino() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const ler = useCallback(async () => {
    const out: Aviso[] = [];

    /* 🚨 SOS — o mais urgente que existe */
    try {
      const r = await sosc.get<{
        sessions?: Array<{
          id: string;
          status?: string;
          startedAt?: string;
          client?: { user?: { fullName?: string } };
        }>;
      }>('/sos/active');

      for (const x of r.sessions ?? []) {
        out.push({
          id: `sos-${x.id}`,
          tipo: 'sos',
          titulo: `${x.client?.user?.fullName ?? 'Um cliente'} acionou o SOS`,
          texto:
            x.status === 'PENDING'
              ? 'Aguardando você aceitar. Áudio e GPS ao vivo.'
              : 'Em atendimento. Áudio e GPS ao vivo.',
          quando: x.startedAt,
          href: destino('sos', x.id),
          peso: PESO.sos + (x.status === 'PENDING' ? 100 : 0),
          pendente: x.status === 'PENDING',
        });
      }
    } catch { /* silencioso */ }

    /* 📬 As notificações — a rota já entrega pronto */
    try {
      const r = await sosc.get<{
        itens?: Array<{
          tipo: string; titulo: string; texto: string;
          data: string; refId: string; pendente?: boolean;
        }>;
      }>('/lawyers/notificacoes');

      for (const x of r.itens ?? []) {
        const t = (x.tipo as Tipo) ?? 'suporte';
        out.push({
          id: `${x.tipo}-${x.refId}-${x.data}`,
          tipo: t,
          titulo: x.titulo,
          texto: x.texto,
          quando: x.data,
          href: destino(t, x.refId),
          peso: PESO[t] ?? 10,
          pendente: x.pendente,
        });
      }
    } catch { /* silencioso */ }

    /* 📡 Plantão — o cliente NOVO (é o volume: 5-10/dia) */
    try {
      const r = await sosc.get<{ casos?: Array<{ status?: string }> }>('/mural/casos');
      const n = (r.casos ?? []).filter((c) => !c.status || c.status === 'NOVO').length;
      if (n > 0) {
        out.push({
          id: 'plantao',
          tipo: 'plantao',
          titulo: `${n} ${n === 1 ? 'pessoa procurando' : 'pessoas procurando'} advogado`,
          texto: 'Grátis no seu plano. Não desconta token.',
          href: '/plantao',
          peso: PESO.plantao,
          pendente: true,
        });
      }
    } catch { /* sem perfil no mural — tudo bem */ }

    // ⚠️ ORDENA POR URGÊNCIA
    out.sort((a, b) =>
      b.peso !== a.peso
        ? b.peso - a.peso
        : String(b.quando ?? '').localeCompare(String(a.quando ?? '')),
    );
    setAvisos(out);
  }, []);

  /**
   * ⚠️ POLLING DE 30s — e por que basta (POR ENQUANTO)
   *
   * O backend não tem WebSocket. 30s é aceitável para chat, prazo,
   * movimentação e plantão.
   *
   * ⚠️ Para o SOS, NÃO É. Ele precisa saber AGORA. → SSE numa v4.2.
   */
  useEffect(() => {
    void ler();
    const t = setInterval(ler, 30_000);
    return () => clearInterval(t);
  }, [ler]);

  useEffect(() => {
    if (!aberto) return;
    const h = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [aberto]);

  const temSOS = avisos.some((a) => a.tipo === 'sos');
  const pendentes = avisos.filter((a) => a.pendente).length;
  const n = avisos.length;

  return (
    <div className={s.wrap} ref={caixa}>
      <button
        className={`${s.sino} ${temSOS ? s.sos : n > 0 ? s.ativo : ''}`}
        onClick={() => {
          setAberto((v) => !v);
          if (!aberto) void sosc.post('/lawyers/notificacoes/marcar-visto', {}).catch(() => {});
        }}
        aria-label={`${n} avisos`}
        title={temSOS ? 'SOS ACIONADO' : `${n} avisos`}
      >
        <Icon n="sino" s={20} />
        {n > 0 ? <b className={temSOS ? s.bSos : s.badge}>{n > 9 ? '9+' : n}</b> : null}
      </button>

      {aberto ? (
        <div className={s.painel} role="dialog">
          <header className={s.topo}>
            <strong>Avisos</strong>
            {pendentes > 0 ? (
              <span className={s.pend}>{pendentes} pedem ação</span>
            ) : n > 0 ? (
              <span>{n}</span>
            ) : null}
          </header>

          {n === 0 ? (
            <div className={s.vazio}>
              <Icon n="ok" s={26} strokeWidth={2.2} />
              <p>Nada pendente. Respire.</p>
            </div>
          ) : (
            <div className={s.lista}>
              {avisos.map((a) => (
                <Link
                  key={a.id}
                  href={a.href}
                  className={`${s.aviso} ${a.tipo === 'sos' ? s.avisoSos : ''} ${a.pendente ? s.avisoPend : ''}`}
                  onClick={() => setAberto(false)}
                >
                  <span className={s.ic} style={{ color: COR[a.tipo] }}>
                    <Icon n={ICONE[a.tipo]} s={18} />
                  </span>
                  <div className={s.corpo}>
                    <strong style={a.tipo === 'sos' ? { color: COR.sos } : undefined}>
                      {a.titulo}
                    </strong>
                    <small>{a.texto}</small>
                  </div>
                  {a.quando ? <em>{faz(a.quando)}</em> : null}
                </Link>
              ))}
            </div>
          )}

          <footer className={s.rodape}>Atualiza a cada 30 segundos</footer>
        </div>
      ) : null}
    </div>
  );
}
