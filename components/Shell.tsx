'use client';

/**
 * Shell.tsx — sidebar + topbar. O esqueleto de todas as telas.
 *
 * A ordem do menu segue o DIA REAL do advogado:
 *   1. Todo dia    → processos, prazos, plantão
 *   2. Clientes    → contrato, assinatura, cobrança
 *   3. Consultas   → as cinco
 *   4. Ferramentas → FinaisJus, JurisCreator, Relatório
 *   5. Escritório  → configuração, plano
 */

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon, { type Nome } from './Icon';
import Saldo from './Saldo';
import s from './shell.module.css';

interface Item {
  href: string;
  rotulo: string;
  icone: Nome;
  selo?: string;
  tom?: 'risco' | 'tech';
}
interface Grupo {
  titulo?: string;
  itens: Item[];
}

const MENU: Grupo[] = [
  { itens: [{ href: '/inicio', rotulo: 'Início', icone: 'inicio' }] },
  {
    titulo: 'Todo dia',
    itens: [
      { href: '/processos', rotulo: 'Meus Processos', icone: 'processo' },
      { href: '/agenda', rotulo: 'Prazos e Audiências', icone: 'agenda', tom: 'risco' },
      { href: '/plantao', rotulo: 'Plantão Adv.', icone: 'radar', tom: 'tech' },
    ],
  },
  {
    titulo: 'Seus clientes',
    itens: [
      { href: '/clientes', rotulo: 'Clientes', icone: 'clientes' },
      { href: '/documentos', rotulo: 'Contrato e Procuração', icone: 'doc' },
      { href: '/assinados', rotulo: 'Já Assinados', icone: 'assinado' },
      { href: '/cobrancas', rotulo: 'Cobrar Honorários', icone: 'dinheiro' },
    ],
  },
  {
    titulo: 'Consultas',
    itens: [{ href: '/consultas', rotulo: 'Fazer uma Consulta', icone: 'busca' }],
  },
  {
    titulo: 'Ferramentas SOSC',
    itens: [
      { href: '/finaisjus', rotulo: 'FinaisJus Pro', icone: 'balanca' },
      { href: '/juriscreator', rotulo: 'JurisCreator', icone: 'ia' },
      { href: '/relatorio', rotulo: 'Relatório SOSC', icone: 'relatorio' },
    ],
  },
  {
    titulo: 'Seu escritório',
    itens: [
      { href: '/escritorio', rotulo: 'Configurações', icone: 'oab' },
      { href: '/plano', rotulo: 'Meu Plano', icone: 'plano' },
    ],
  },
];

export interface Advogado {
  nome: string;
  email: string;
  oab: string | null;
  plano: string;
  /** Saldo de créditos. Discreto, sempre no topo. */
  creditos?: number;
  /** O dono → ∞ */
  ilimitado?: boolean;
  /** Um dos 50 → selo */
  fundador?: boolean;
}

function iniciais(nome: string) {
  return nome
    .replace(/^Dr[aª]?\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function Shell({
  adv,
  children,
}: {
  adv: Advogado;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  const atual = MENU.flatMap((g) => g.itens.map((i) => ({ ...i, grupo: g.titulo })))
    .find((i) => path.startsWith(i.href));

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <>
      <div
        className={`${s.veu} ${aberto ? s.veuOn : ''}`}
        onClick={() => setAberto(false)}
        aria-hidden
      />

      <div className={s.grade}>
        {/* ═══ SIDEBAR ═══ */}
        <aside className={`${s.rail} ${aberto ? s.railOn : ''}`}>
          <Link href="/inicio" className={s.marca} onClick={() => setAberto(false)}>
            <Image src="/sosc_jus_logo.png" alt="" width={44} height={58} priority />
            <div>
              <strong>
                SOSC <em>JUS</em>
              </strong>
              <span>Estação do Advogado</span>
            </div>
          </Link>

          <nav className={s.nav}>
            {MENU.map((g, gi) => (
              <div key={gi} className={s.grupo}>
                {g.titulo ? <p>{g.titulo}</p> : null}
                {g.itens.map((i) => {
                  const ativo = path.startsWith(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={ativo ? s.on : ''}
                      onClick={() => setAberto(false)}
                    >
                      <Icon n={i.icone} s={21} />
                      <span>{i.rotulo}</span>
                      {i.selo ? (
                        <b
                          className={
                            i.tom === 'risco' ? s.seloRisco : i.tom === 'tech' ? s.seloTech : ''
                          }
                        >
                          {i.selo}
                        </b>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className={s.pe}>
            <div className={s.brasao}>{iniciais(adv.nome)}</div>
            <div className={s.quem}>
              <strong title={adv.nome}>{adv.nome}</strong>
              <span>
                {adv.oab ?? 'Advogado'} · {adv.plano}
              </span>
            </div>
            <button className={s.sair} onClick={sair} title="Sair">
              <Icon n="sair" s={19} />
            </button>
          </div>

          {/* B268 — a versão. Salva horas de debug quando algo não bate. */}
          <div className={s.versao}>SOSC JUS · 4.0.0 (268)</div>
        </aside>

        {/* ═══ PALCO ═══ */}
        <div className={s.palco}>
          <header className={s.topo}>
            <button
              className={s.hamburguer}
              onClick={() => setAberto(true)}
              aria-label="Abrir menu"
            >
              <Icon n="menu" s={22} />
            </button>

            <div className={s.trilha}>
              <span>{atual?.grupo ?? 'Estação'}</span>
              <Icon n="chev" s={13} strokeWidth={2.2} />
              <b>{atual?.rotulo ?? 'Início'}</b>
            </div>

            <div className={s.acoes}>
              <Saldo
                total={adv.creditos ?? 0}
                ilimitado={adv.ilimitado}
                fundador={adv.fundador}
              />
              <Link href="/consultas" className="btn b-gold">
                <Icon n="busca" s={19} strokeWidth={2.1} />
                Nova consulta
              </Link>
            </div>
          </header>

          <div className={s.area}>{children}</div>
        </div>
      </div>
    </>
  );
}
