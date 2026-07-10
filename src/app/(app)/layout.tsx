'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth';
import { tokens } from '@/lib/tokens';
import { ShieldLogo } from '@/components/ShieldLogo';

const NAV_GROUPS: { grupo?: string; itens: { href: string; label: string; icon: string }[] }[] = [
  { itens: [{ href: '/dashboard', label: 'Início', icon: '▚' }] },
  {
    grupo: 'Documentos',
    itens: [
      { href: '/documentos/HONORARIOS', label: 'Contrato de Honorários', icon: '₪' },
      { href: '/documentos/PROCURACAO', label: 'Procuração', icon: '§' },
    ],
  },
  {
    grupo: 'Consultas',
    itens: [
      { href: '/consulta', label: 'Consulta Processual', icon: '⌕' },
      { href: '/cpf', label: 'CPF / Antecedentes', icon: '⊡' },
      { href: '/mandado', label: 'Mandado de Prisão', icon: '⚠' },
      { href: '/processos', label: 'Meus Processos', icon: '⚖' },
    ],
  },
  {
    grupo: 'Escritório',
    itens: [{ href: '/clientes', label: 'Clientes', icon: '☰' }],
  },
];

// Ferramentas que já são webs próprias (abrem em nova aba).
const NAV_EXTERNOS = [
  { href: 'https://finaisjus.soscriminal.com.br', label: 'FinaisJus Pro ↗', icon: '▤' },
  { href: 'https://juriscreator.soscriminal.com.br', label: 'JurisCreator IA ↗', icon: '✦' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated, logout } = useAuth();

  // Guarda de rota: sem token → login. Só decide depois de hidratar.
  useEffect(() => {
    if (hydrated && !tokens.getAccess()) {
      router.replace('/login');
    }
  }, [hydrated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-texto-sec text-sm">
        Carregando…
      </div>
    );
  }

  if (!tokens.getAccess()) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-linha bg-preto-card flex flex-col print:hidden">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-linha">
          <ShieldLogo size={34} />
          <div>
            <div className="font-semibold text-sm leading-tight">
              SOSC <span className="text-dourado">JUS</span>
            </div>
            <div className="text-[11px] text-texto-sec">Estação do Advogado</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi}>
              {g.grupo && (
                <div className="text-[10px] uppercase tracking-wide text-[#5a5a5a] px-3 pt-3 pb-1">
                  {g.grupo}
                </div>
              )}
              {g.itens.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-dourado/10 text-dourado border border-dourado/30'
                        : 'text-texto-sec hover:text-white hover:bg-preto-elev border border-transparent'
                    }`}
                  >
                    <span className="w-4 text-center opacity-80">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Ferramentas-satélite: webs próprias, abrem em nova aba */}
          <div className="text-[10px] uppercase tracking-wide text-[#5a5a5a] px-3 pt-3 pb-1">
            Produção IA
          </div>
          {NAV_EXTERNOS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-texto-sec hover:text-white hover:bg-preto-elev border border-transparent transition-colors"
            >
              <span className="w-4 text-center opacity-80">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-linha">
          <div className="text-sm truncate">{user?.fullName ?? 'Advogado'}</div>
          <div className="text-[11px] text-texto-sec truncate mb-3">{user?.email}</div>
          <button
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
            className="text-xs text-texto-sec hover:text-alerta transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
