'use client';

/**
 * LOGIN — a primeira impressão.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ O MESMO LOGIN DO APLICATIVO.
 *
 *  Não é conta nova. Não é cadastro. É a MESMA conta — o mesmo e-mail e
 *  senha que ele já usa no celular. Isso precisa estar ÓBVIO na tela, senão
 *  ele acha que precisa se cadastrar de novo e desiste.
 *
 *  E o cadastro NÃO acontece aqui: quem cria conta é o app (Apple exige o
 *  IAP dela para a assinatura). A estação só autentica.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import s from './login.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [vendo, setVendo] = useState(false);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (ocupado) return;

    setErro('');
    setOcupado(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });

      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        // ⚠️ A mensagem tem que ser ÚTIL. "Erro 401" não ajuda ninguém.
        setErro(
          r.status === 401
            ? 'E-mail ou senha não conferem. É a mesma senha do aplicativo.'
            : r.status === 403
              ? 'Esta conta é de cliente. A Estação é exclusiva para advogados.'
              : (b.message ?? 'Não foi possível entrar. Tente de novo.'),
        );
        return;
      }

      router.push('/inicio');
      router.refresh();
    } catch {
      setErro('Sem conexão com o servidor. Confira sua internet.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className={s.tela}>
      {/* ─── ESQUERDA: a marca, o argumento ─── */}
      <aside className={s.lado}>
        <div className={s.marca}>
          <Image src="/sosc_jus_logo.png" alt="" width={54} height={54} priority />
          <div>
            <strong>
              SOSC <em>JUS</em>
            </strong>
            <span>ESTAÇÃO DO ADVOGADO</span>
          </div>
        </div>

        <div className={s.arg}>
          <h1>
            O escritório inteiro,
            <br />
            <em>na tela grande.</em>
          </h1>
          <p>
            Seus processos, seus prazos, seus clientes — e os casos que chegam
            pelo Plantão. Tudo que está no aplicativo, com o espaço que só o
            computador tem.
          </p>

          <ul className={s.lista}>
            <li>
              <b>284 processos</b> numa tabela, não numa lista infinita
            </li>
            <li>
              <b>Prazos e audiências</b> em um lugar só
            </li>
            <li>
              <b>Plantão Adv.</b> — o cliente novo chega aqui
            </li>
            <li>
              <b>FinaisJus Pro</b> — o vídeo da audiência vira peça
            </li>
          </ul>
        </div>

        <p className={s.rodape}>
          SOS Criminal Tecnologia LTDA · CNPJ 66.476.445/0001-50
        </p>
      </aside>

      {/* ─── DIREITA: o formulário ─── */}
      <section className={s.form}>
        <div className={s.caixa}>
          <header className={s.topo}>
            <h2>Entrar</h2>
            {/* ⚠️ ISTO PRECISA ESTAR ÓBVIO — senão ele tenta se cadastrar */}
            <p>
              Use o <b>mesmo e-mail e senha</b> do aplicativo. É a mesma conta.
            </p>
          </header>

          <form onSubmit={entrar} noValidate>
            <label className="fld">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@escritorio.com.br"
                autoComplete="email"
                autoFocus
                required
                disabled={ocupado}
              />
            </label>

            <label className="fld">
              <span>Senha</span>
              <div className={s.senha}>
                <input
                  type={vendo ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="A mesma do aplicativo"
                  autoComplete="current-password"
                  required
                  disabled={ocupado}
                />
                <button
                  type="button"
                  onClick={() => setVendo((v) => !v)}
                  aria-label={vendo ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {vendo ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {erro ? (
              <div className={s.erro} role="alert">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{erro}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="btn b-gold full lg"
              disabled={ocupado || !email.trim() || !senha}
            >
              {ocupado ? (
                <>
                  <span className="spin" />
                  Entrando…
                </>
              ) : (
                'Entrar na Estação'
              )}
            </button>
          </form>

          {/* ⚠️ O cadastro é NO APP. A Apple exige o IAP dela pra assinatura. */}
          <footer className={s.semConta}>
            <p>
              <b>Ainda não tem conta?</b> O cadastro e a assinatura são feitos no
              aplicativo — depois é só entrar aqui com o mesmo login.
            </p>
            <div className={s.lojas}>
              <a
                href="https://apps.apple.com/br/app/sosc-jus/id6770715490"
                target="_blank"
                rel="noopener noreferrer"
              >
                App Store
              </a>
              <span>·</span>
              <a
                href="https://play.google.com/store/apps/details?id=br.com.soscriminal.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Play
              </a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
