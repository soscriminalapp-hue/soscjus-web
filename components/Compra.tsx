'use client';

/**
 * Compra.tsx — o modal do QR Code.
 *
 * ═══════════════════════════════════════════════════════════════
 *  A ESTAÇÃO NÃO VENDE. A ESTAÇÃO PEDE PRO CELULAR VENDER.
 * ═══════════════════════════════════════════════════════════════
 *
 * Quando a cota acaba, o backend responde 402. A estação abre isto:
 * o advogado aponta o celular no QR, o app abre já na tela de pagamento
 * da Apple/Google, ele confirma com a digital — e a estação, que está
 * fazendo polling, DESTRAVA SOZINHA e executa a ação pendente.
 *
 * Ele não precisa voltar ao computador e clicar de novo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { compra, type PedidoCompra, type EstadoCompra } from '@/lib/api';
import Icon from './Icon';
import s from './compra.module.css';

interface Props {
  /** Chave da feature (ex.: 'CONSULTA_CADASTRAL'). null = fechado. */
  feature: string | null;
  onFechar: () => void;
  /** Chamado quando a loja confirma. Aqui a tela refaz a ação. */
  onConfirmado: () => void;
}

export default function Compra({ feature, onFechar, onConfirmado }: Props) {
  const [pedido, setPedido] = useState<PedidoCompra | null>(null);
  const [estado, setEstado] = useState<EstadoCompra>('AGUARDANDO');
  const [erro, setErro] = useState('');
  const [restante, setRestante] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const parar = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  // Cria o pedido ao abrir
  useEffect(() => {
    if (!feature) {
      setPedido(null);
      setEstado('AGUARDANDO');
      setErro('');
      parar();
      return;
    }
    let vivo = true;
    setErro('');
    setPedido(null);
    setEstado('AGUARDANDO');

    compra
      .criar(feature)
      .then((p) => {
        if (vivo) setPedido(p);
      })
      .catch(() => {
        if (vivo) setErro('Não foi possível preparar a compra. Tente de novo.');
      });

    return () => {
      vivo = false;
      parar();
    };
  }, [feature, parar]);

  // Polling: a estação escuta o celular
  useEffect(() => {
    if (!pedido || estado !== 'AGUARDANDO') return;

    timer.current = setInterval(async () => {
      try {
        const r = await compra.ler(pedido.id);
        setEstado(r.estado);
        if (r.estado === 'CONFIRMADA') {
          parar();
          // Deixa o ✓ na tela por um momento, depois destrava.
          setTimeout(() => {
            onConfirmado();
            onFechar();
          }, 2200);
        }
        if (r.estado === 'EXPIRADA' || r.estado === 'CANCELADA') parar();
      } catch {
        /* rede oscilou — tenta de novo no próximo tick */
      }
    }, 2000);

    return parar;
  }, [pedido, estado, parar, onConfirmado, onFechar]);

  // Contagem regressiva
  useEffect(() => {
    if (!pedido || estado !== 'AGUARDANDO') return;
    const t = setInterval(() => {
      const ms = pedido.expiraEm - Date.now();
      setRestante(Math.max(0, Math.floor(ms / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [pedido, estado]);

  // ESC fecha
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
    if (pedido && estado === 'AGUARDANDO') {
      void compra.cancelar(pedido.id).catch(() => {});
    }
    parar();
    onFechar();
  }

  if (!feature) return null;

  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');

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
        <header className={s.topo}>
          <div className={s.tit}>
            <small>Compra avulsa</small>
            <strong>{pedido?.titulo ?? 'Preparando…'}</strong>
          </div>
          <button className={s.fechar} onClick={fechar} aria-label="Fechar">
            <Icon n="x" s={20} strokeWidth={2.2} />
          </button>
        </header>

        <div className={s.corpo}>
          {erro ? (
            <div className={s.erro}>
              <Icon n="alerta" s={18} />
              <p>{erro}</p>
            </div>
          ) : estado === 'CONFIRMADA' ? (
            /* ─── PAGOU ─── */
            <div className={s.sucesso}>
              <div className={s.check}>
                <Icon n="ok" s={38} strokeWidth={2.6} />
              </div>
              <strong>Pronto! Liberado.</strong>
              <p>
                Já estamos abrindo para você — não precisa clicar em mais nada.
              </p>
            </div>
          ) : estado === 'EXPIRADA' ? (
            <div className={s.expirou}>
              <Icon n="relogio" s={34} />
              <strong>O tempo acabou</strong>
              <p>Ninguém foi cobrado. Feche e tente de novo quando quiser.</p>
              <button className="btn b-ghost" onClick={fechar}>
                Fechar
              </button>
            </div>
          ) : (
            /* ─── AGUARDANDO ─── */
            <>
              <ol className={s.passos}>
                <li>
                  <span className={s.n}>1</span>
                  <div>
                    <strong>Pegue o seu celular</strong>
                    <p>Aquele onde o SOSC JUS já está instalado.</p>
                  </div>
                </li>
                <li>
                  <span className={s.n}>2</span>
                  <div>
                    <strong>Aponte a câmera para o quadrado abaixo</strong>
                    <p>O aplicativo abre sozinho, já na tela de pagamento.</p>
                  </div>
                </li>
                <li>
                  <span className={s.n}>3</span>
                  <div>
                    <strong>Confirme com a digital ou o rosto</strong>
                    <p>
                      Como você já faz para comprar qualquer coisa no celular.
                    </p>
                  </div>
                </li>
              </ol>

              <div className={s.qrBox}>
                {pedido ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={pedido.qr} alt="QR Code para pagar no celular" className={s.qr} />
                ) : (
                  <div className={s.qrVazio}>
                    <span className="spin" style={{ borderTopColor: '#5a5348' }} />
                  </div>
                )}
                {pedido ? <div className={s.codigo}>{pedido.codigo}</div> : null}
                <div className={s.lojas}>
                  <span>
                    <Icon n="apple" s={15} fill="currentColor" strokeWidth={0} /> App Store
                  </span>
                  <span>
                    <Icon n="play" s={15} fill="currentColor" strokeWidth={0} /> Google Play
                  </span>
                </div>
              </div>

              <div className={s.esperando}>
                <div className={s.pulso}>
                  <i />
                  <i />
                  <b />
                </div>
                <div>
                  <strong>Esperando você confirmar no celular…</strong>
                  <p>
                    Pode deixar esta tela aberta. Assim que pagar, ela destrava
                    sozinha.
                    {restante > 0 ? (
                      <>
                        {' '}
                        <span className={s.cron}>
                          {mm}:{ss}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              <p className={s.rodape}>
                <Icon n="lock" s={14} />
                A cobrança é feita pela loja onde você já tem cadastro. A estação
                nunca pede o seu cartão.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
