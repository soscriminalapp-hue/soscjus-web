'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  /abrir — o FALLBACK que faltava
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  🔴 O BUG DO 4.0.1:
 *
 *     O QR apontava direto pra `soscjus://creditos?...`
 *
 *     Se o app NÃO estivesse instalado, o celular abria o navegador,
 *     não sabia o que fazer com `soscjus://`, e dava ERRO.
 *
 *     O advogado ficava olhando uma tela de erro, sem entender nada.
 *
 *  ✅ AGORA:
 *
 *     O QR aponta pra ESTA PÁGINA (https). Ela:
 *
 *       1. Tenta abrir o app (soscjus://)
 *       2. Se em 1,5s a página ainda estiver visível → o app NÃO abriu
 *       3. Mostra os botões da App Store / Google Play
 *
 *     É o padrão que o WhatsApp, o Uber e o iFood usam. Funciona.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import s from './abrir.module.css';

const APP_STORE = 'https://apps.apple.com/br/app/sosc-jus/id6770715490';
const PLAY = 'https://play.google.com/store/apps/details?id=br.com.soscriminal.app';

// useSearchParams() exige limite de Suspense no App Router (senão o prerender
// de /abrir quebra o build). Envolvemos o conteúdo no default export.
function AbrirInner() {
  const params = useSearchParams();
  const [temApp, setTemApp] = useState<boolean | null>(null);

  const pedido = params.get('p');
  const token = params.get('t');
  const sku = params.get('sku');

  useEffect(() => {
    if (!pedido || !token) {
      setTemApp(false);
      return;
    }

    const link = `soscjus://creditos?pedido=${encodeURIComponent(pedido)}&token=${encodeURIComponent(token)}${sku ? `&sku=${encodeURIComponent(sku)}` : ''}`;

    // ⚠️ Se o app abrir, o navegador vai pro fundo → 'visibilitychange' dispara.
    //    Se em 1,5s a página ainda estiver visível, é porque NÃO abriu.
    let abriu = false;
    const marcar = () => {
      if (document.hidden) abriu = true;
    };
    document.addEventListener('visibilitychange', marcar);

    // tenta abrir
    window.location.href = link;

    const t = setTimeout(() => {
      document.removeEventListener('visibilitychange', marcar);
      setTemApp(abriu);
    }, 1500);

    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', marcar);
    };
  }, [pedido, token, sku]);

  const iOS =
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <main className={s.tela}>
      <div className={s.caixa}>
        <div className={s.marca}>
          <strong>
            SOSC <em>JUS</em>
          </strong>
        </div>

        {temApp === null ? (
          <>
            <span className={s.spin} />
            <h1>Abrindo o aplicativo…</h1>
            <p>Se ele não abrir sozinho, os botões aparecem em um instante.</p>
          </>
        ) : temApp ? (
          <>
            <div className={s.ok}>✓</div>
            <h1>Pronto</h1>
            <p>
              O aplicativo abriu na tela de créditos. Termine a compra por lá — e o
              computador destrava sozinho.
            </p>
          </>
        ) : (
          <>
            <h1>Você ainda não tem o aplicativo</h1>
            <p>
              A compra de créditos passa pela loja do seu celular. Baixe o SOSC JUS —
              é o mesmo login.
            </p>

            <div className={s.lojas}>
              <a href={APP_STORE} className={`${s.loja} ${iOS ? s.destaque : ''}`}>
                <strong>App Store</strong>
                <small>iPhone e iPad</small>
              </a>
              <a href={PLAY} className={`${s.loja} ${!iOS ? s.destaque : ''}`}>
                <strong>Google Play</strong>
                <small>Android</small>
              </a>
            </div>

            <button
              className={s.tentar}
              onClick={() => {
                if (!pedido || !token) return;
                window.location.href = `soscjus://creditos?pedido=${encodeURIComponent(pedido)}&token=${encodeURIComponent(token)}`;
              }}
            >
              Já tenho o app — tentar de novo
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function Abrir() {
  return (
    <Suspense fallback={null}>
      <AbrirInner />
    </Suspense>
  );
}
