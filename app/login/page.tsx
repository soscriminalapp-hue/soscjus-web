'use client';

/**
 * Tela de login — o portão da estação.
 *
 * Mesmo e-mail e senha do aplicativo. Aceita também o número SOSC ADV.
 * O token nunca chega ao navegador: o handler /api/auth/login sela num
 * cookie httpOnly.
 */

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { api, ApiError } from '@/lib/api';
import s from './login.module.css';

// useSearchParams() exige limite de Suspense no App Router (senão o build quebra
// no prerender de /login). Envolvemos o formulário no default export.
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const voltar = params.get('voltar') || '/inicio';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (ocupado) return;
    setOcupado(true);
    setErro('');
    try {
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });
      router.replace(voltar);
      router.refresh();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente de novo.');
      setOcupado(false);
    }
  }

  return (
    <main className={s.tela}>
      {/* ─── lado esquerdo: a tese ─── */}
      <section className={s.vitrine}>
        <div className={s.marca}>
          <Image src="/sosc_jus_logo.png" alt="SOSC JUS" width={56} height={74} priority />
          <div>
            <strong>
              SOSC <em>JUS</em>
            </strong>
            <span>Estação do Advogado</span>
          </div>
        </div>

        <div className={s.tese}>
          <span className={s.eb}>O escritório no computador</span>
          <h1>
            Seus processos.
            <br />
            Seus prazos.
            <br />
            <em>Sua estação.</em>
          </h1>
          <p>
            Tudo que você já usa no aplicativo, agora em tela grande — onde o trabalho
            de verdade acontece.
          </p>

          <ul className={s.pontos}>
            <li>
              <i className={s.dLime} />
              Mesma conta do aplicativo — nada para assinar de novo
            </li>
            <li>
              <i className={s.dMiami} />
              Peças do FinaisJus e criativos do JurisCreator aqui dentro
            </li>
            <li>
              <i className={s.dPink} />
              Contrato, procuração e cobrança sem trocar de tela
            </li>
          </ul>
        </div>

        <div className={s.rodape}>
          <i />
          <span>Conexão protegida · TLS 1.3</span>
        </div>
      </section>

      {/* ─── lado direito: o formulário ─── */}
      <section className={s.painel}>
        <form onSubmit={entrar} className={s.form} noValidate>
          <div className={s.marcaMobile}>
            <Image src="/sosc_jus_logo.png" alt="SOSC JUS" width={44} height={58} />
            <strong>
              SOSC <em>JUS</em>
            </strong>
          </div>

          <span className={s.eb}>Acesso profissional</span>
          <h2>Entrar na estação</h2>
          <p className={s.sub}>Use o mesmo e-mail e senha do aplicativo SOSC JUS.</p>

          <label className="fld">
            <span>E-mail ou número SOSC ADV</span>
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@escritorio.com.br"
              disabled={ocupado}
              autoFocus
            />
          </label>

          <label className="fld">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              disabled={ocupado}
            />
          </label>

          {erro ? (
            <div className={s.erro} role="alert">
              <svg viewBox="0 0 24 24">
                <path d="M12 3 2 20h20z" />
                <path d="M12 9v5M12 17h.01" />
              </svg>
              <span>{erro}</span>
            </div>
          ) : null}

          <button
            type="submit"
            className="btn b-gold full"
            disabled={ocupado || !email.trim() || !senha}
          >
            {ocupado ? (
              <>
                <span className="spin" style={{ borderTopColor: '#151206' }} />
                Entrando…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                Entrar
              </>
            )}
          </button>

          <small className={s.aviso}>
            Exclusivo para advogados com inscrição verificada. O cliente usa o aplicativo.
          </small>
        </form>
      </section>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
