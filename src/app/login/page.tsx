'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiException } from '@/lib/api';
import { tokens } from '@/lib/tokens';
import { useAuth } from '@/store/auth';
import { ShieldLogo } from '@/components/ShieldLogo';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      // A web é exclusiva do advogado. Bloqueia contas de cliente.
      if (data.user.role !== 'LAWYER') {
        tokens.clear();
        setErro('Esta é a área do advogado. Use o app SOSC JUS para contas de usuário.');
        setLoading(false);
        return;
      }
      setUser(data.user);
      router.replace('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiException ? err.message : 'Falha ao entrar. Tente novamente.';
      setErro(msg);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <ShieldLogo size={64} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            SOSC <span className="text-dourado">JUS</span>
          </h1>
          <p className="text-texto-sec text-sm mt-1">Estação do Advogado</p>
        </div>

        <div className="rounded-2xl border border-linha bg-preto-card p-6">
          <div className="mb-5">
            <span className="inline-block text-xs font-medium text-dourado border border-dourado/40 rounded-full px-3 py-1">
              Sou Advogado
            </span>
          </div>

          {/* Não usar <form> nativo dentro de artifacts, mas aqui é app real:
              usamos onSubmit normalmente. */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-texto-sec mb-1.5">
                E-mail ou nº SOSC ADV
              </label>
              <input
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-preto-elev border border-linha px-3.5 py-2.5 text-sm outline-none focus:border-dourado transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-texto-sec mb-1.5">Senha</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-preto-elev border border-linha px-3.5 py-2.5 text-sm outline-none focus:border-dourado transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {erro && (
              <p className="text-sm text-alerta bg-alerta/10 border border-alerta/30 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-dourado text-black font-semibold py-2.5 text-sm hover:bg-dourado-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-texto-sec mt-6">
          Mesma conta do app. Assinaturas e compras são feitas no aplicativo.
        </p>
      </div>
    </main>
  );
}
