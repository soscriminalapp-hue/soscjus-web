'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COMPRA DE CRÉDITOS — a ponte PC → celular
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ A ESTAÇÃO NÃO VENDE NADA. Ela mostra um QR.
 *
 *  A Apple EXIGE que a compra passe pelo IAP dela (Guideline 3.1.1).
 *  Vender crédito no site e liberar no app é motivo de REJEIÇÃO.
 *
 *  Então:
 *    1. Ele clica em "Comprar créditos"
 *    2. A estação cria um pedido e mostra o QR
 *    3. Ele aponta o CELULAR
 *    4. O app abre na tela de créditos, com o pacote escolhido
 *    5. Paga pelo StoreKit
 *    6. O app avisa → A ESTAÇÃO DESTRAVA SOZINHA
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔴 O QUE ESTAVA QUEBRADO NO 4.0.1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. A web mandava `feature: 'CREDITOS'` — mas a API espera um PRODUCT ID.
 *     ✅ Agora manda `productId: 'br.com.soscriminal.creditos.500'`
 *
 *  2. A confirmação exigia o COOKIE DO PC — mas quem confirma é o CELULAR.
 *     O fluxo NUNCA FECHAVA. A tela girava pra sempre.
 *     ✅ Agora o celular confirma com o TOKEN que veio no QR.
 *
 *  3. O QR só tinha `soscjus://` — sem o app, dava ERRO no navegador.
 *     ✅ Agora aponta pra /abrir, que tem FALLBACK pras lojas.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import Diamante from './Diamante';
import s from './compra.module.css';

/** ⚠️ ESPELHO do backend. Se divergir, mostra um preço e cobra outro. */
const PACOTES = [
  { productId: 'br.com.soscriminal.creditos.100', creditos: 100, preco: 59.9, bonus: 0 },
  { productId: 'br.com.soscriminal.creditos.250', creditos: 250, preco: 129.9, bonus: 13 },
  { productId: 'br.com.soscriminal.creditos.500', creditos: 500, preco: 249.9, bonus: 17, destaque: true },
  { productId: 'br.com.soscriminal.creditos.800', creditos: 800, preco: 399.9, bonus: 17 },
  { productId: 'br.com.soscriminal.creditos.1200', creditos: 1200, preco: 599.9, bonus: 17 },
];

interface Pedido {
  id: string;
  creditos: number;
  precoBRL: number;
  expiraEm: number;
  qrUrl: string;
  deeplink: string;
}

export default function Compra({
  /** Abrir? Passe qualquer coisa não-nula. */
  feature,
  onFechar,
  onConfirmado,
}: {
  feature: string | null;
  onFechar: () => void;
  onConfirmado: () => void;
}) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [qrPng, setQrPng] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState('');
  const [pago, setPago] = useState(false);
  const [resta, setResta] = useState(0);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const parar = useCallback(() => {
    if (poll.current) {
      clearInterval(poll.current);
      poll.current = null;
    }
  }, []);

  /** Cria o pedido do pacote escolhido. */
  async function escolher(productId: string) {
    setCriando(true);
    setErro('');
    try {
      const r = await fetch('/api/compra/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ⚠️ productId — NÃO "feature". Era esse o bug.
        body: JSON.stringify({ productId }),
      });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        throw new Error(b.message ?? 'Não foi possível criar o pedido.');
      }
      const p: Pedido = await r.json();
      setPedido(p);

      // desenha o QR
      const QR = (await import('qrcode')).default;
      const png = await QR.toDataURL(p.qrUrl, {
        width: 260,
        margin: 1,
        color: { dark: '#0a0b0d', light: '#ffffff' },
      });
      setQrPng(png);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar o pedido.');
    } finally {
      setCriando(false);
    }
  }

  /* ─── pergunta "já pagou?" a cada 2s ─── */
  useEffect(() => {
    if (!pedido || pago) return;

    poll.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/compra/${pedido.id}`);
        if (!r.ok) return;
        const b: { estado: string } = await r.json();

        if (b.estado === 'PAGO') {
          parar();
          setPago(true);
          // deixa ele ver o "pronto" antes de sumir
          setTimeout(onConfirmado, 1400);
        } else if (b.estado === 'EXPIRADO' || b.estado === 'CANCELADO') {
          parar();
          setErro('O pedido expirou. Escolha o pacote de novo.');
          setPedido(null);
          setQrPng(null);
        }
      } catch {
        /* silencioso — tenta de novo em 2s */
      }
    }, 2000);

    return parar;
  }, [pedido, pago, parar, onConfirmado]);

  /* ─── o relógio ─── */
  useEffect(() => {
    if (!pedido || pago) return;
    const t = setInterval(() => {
      const seg = Math.max(0, Math.floor((pedido.expiraEm - Date.now()) / 1000));
      setResta(seg);
      if (seg === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [pedido, pago]);

  /* ─── ESC fecha ─── */
  useEffect(() => {
    if (!feature) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, pedido]);

  function fechar() {
    parar();
    if (pedido && !pago) {
      void fetch(`/api/compra/${pedido.id}`, { method: 'DELETE' });
    }
    setPedido(null);
    setQrPng(null);
    setPago(false);
    setErro('');
    onFechar();
  }

  if (!feature) return null;

  const mm = String(Math.floor(resta / 60)).padStart(2, '0');
  const ss = String(resta % 60).padStart(2, '0');

  return (
    <div
      className={s.veu}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={s.modal}>
        <button className={s.x} onClick={fechar} aria-label="Fechar">
          <Icon n="x" s={18} strokeWidth={2.4} />
        </button>

        {/* ─── PAGO ─── */}
        {pago ? (
          <div className={s.pronto}>
            <div className={s.ok}>
              <Icon n="ok" s={30} strokeWidth={2.6} />
            </div>
            <h2>Créditos na conta</h2>
            <p>
              <b>{pedido?.creditos.toLocaleString('pt-BR')} créditos</b> entraram. Você
              já pode continuar.
            </p>
          </div>
        ) : pedido && qrPng ? (
          /* ─── O QR ─── */
          <>
            <header className={s.topo}>
              <Diamante s={30} />
              <div>
                <span className={s.eb}>APONTE O CELULAR</span>
                <h2>
                  {pedido.creditos.toLocaleString('pt-BR')} créditos · R${' '}
                  {pedido.precoBRL.toFixed(2).replace('.', ',')}
                </h2>
              </div>
            </header>

            <div className={s.qr}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPng} alt="Aponte a câmera do celular" />
            </div>

            <ol className={s.passos}>
              <li>Abra a câmera do celular</li>
              <li>Aponte para o código</li>
              <li>Pague pela loja — é o mesmo login</li>
            </ol>

            <div className={s.esperando}>
              <span className="spin" />
              <span>Esperando a confirmação… {mm}:{ss}</span>
            </div>

            <p className={s.porque}>
              <Icon n="lock" s={13} />
              A compra passa pela loja do celular — é exigência da Apple e do Google.
              <b> A estação destrava sozinha</b> quando você terminar.
            </p>
          </>
        ) : (
          /* ─── ESCOLHER O PACOTE ─── */
          <>
            <header className={s.topo}>
              <Diamante s={30} />
              <div>
                <span className={s.eb}>COMPRAR CRÉDITOS</span>
                <h2>Quanto você quer?</h2>
              </div>
            </header>

            {erro ? (
              <div className={s.erro}>
                <Icon n="alerta" s={16} />
                <span>{erro}</span>
              </div>
            ) : null}

            <div className={s.pacotes}>
              {PACOTES.map((p) => (
                <button
                  key={p.productId}
                  className={`${s.pacote} ${p.destaque ? s.destaque : ''}`}
                  onClick={() => void escolher(p.productId)}
                  disabled={criando}
                >
                  {p.destaque ? <span className={s.fita}>Mais escolhido</span> : null}
                  <div className={s.pEsq}>
                    <Diamante s={22} />
                    <div>
                      <strong>{p.creditos.toLocaleString('pt-BR')}</strong>
                      <small>créditos</small>
                    </div>
                  </div>
                  <div className={s.pDir}>
                    {p.bonus > 0 ? (
                      <span className={s.bonus}>−{p.bonus}%</span>
                    ) : null}
                    <b>R$ {p.preco.toFixed(2).replace('.', ',')}</b>
                  </div>
                </button>
              ))}
            </div>

            {criando ? (
              <div className={s.esperando}>
                <span className="spin" />
                <span>Preparando o código…</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
