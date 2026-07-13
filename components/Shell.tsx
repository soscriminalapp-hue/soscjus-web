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
import Sino from './Sino';
import s from './shell.module.css';

interface Item {
  href: string;
  rotulo: string;
  icone: Nome;
  selo?: string;
  tom?: 'risco' | 'tech';
  /**
   * ⚠️ A tela existe e abre — mas ainda NÃO está plugada no backend.
   *
   * Sem este aviso, o advogado clica, vê "Tela pronta — falta plugar", e
   * acha que o app está quebrado. Melhor ele saber ANTES de clicar.
   */
  emBreve?: boolean;
  /**
   * 📱 ESTA FERRAMENTA É MELHOR NO CELULAR.
   *
   * ⚠️ Dizer isso GANHA a confiança dele.
   *
   * Se ele tenta consultar veículo aqui, digita a placa errada e perde
   * 40 créditos — ele culpa o produto.
   *
   * Se a estação AVISA "fotografe a placa no celular", ele pensa:
   * "esse pessoal sabe o que faz".
   */
  celular?: boolean;
  /** Só no app — nem abre aqui. */
  soApp?: boolean;
}
interface Grupo {
  titulo?: string;
  itens: Item[];
}

/*
  ═══════════════════════════════════════════════════════════════════════════
   ✅ FUNCIONA DE VERDADE (7):
      Início · Meus Processos · Prazos e Audiências · Clientes ·
      Fazer uma Consulta · FinaisJus Pro · Meus Créditos

   🔧 A TELA ABRE, mas ainda NÃO está plugada no backend (7):
      Plantão · Contrato e Procuração · Já Assinados · Cobrar Honorários ·
      JurisCreator · Relatório SOSC · Configurações

      ⚠️ Elas levam o selo "em breve" — para o advogado saber ANTES de clicar.
         Sem isso, ele clica, vê "Tela pronta — falta plugar", e acha que o
         app está quebrado.

      Cada uma traz, no próprio arquivo, a lista dos endpoints que precisa.
  ═══════════════════════════════════════════════════════════════════════════
*/
const MENU: Grupo[] = [
  { itens: [{ href: '/inicio', rotulo: 'Início', icone: 'inicio' }] },

  {
    titulo: 'Todo dia',
    itens: [
      { href: '/processos', rotulo: 'Meus Processos', icone: 'processo' },
      { href: '/agenda', rotulo: 'Prazos e Audiências', icone: 'agenda', tom: 'risco' },
      { href: '/plantao', rotulo: 'Plantão Adv.', icone: 'radar', tom: 'tech', emBreve: true },
    ],
  },

  {
    titulo: 'Seus clientes',
    itens: [
      { href: '/clientes', rotulo: 'Clientes', icone: 'clientes' },
      { href: '/clientes?convidar=1', rotulo: 'Convidar Cliente', icone: 'convite' },
      { href: '/documentos', rotulo: 'Contrato e Procuração', icone: 'doc', emBreve: true },
      { href: '/assinados', rotulo: 'Já Assinados', icone: 'assinado', emBreve: true },
      { href: '/cobrancas', rotulo: 'Cobrar Honorários', icone: 'dinheiro', emBreve: true },
    ],
  },

  {
    titulo: 'Consultas',
    itens: [{ href: '/consultas', rotulo: 'Fazer uma Consulta', icone: 'busca' }],
  },

  {
    titulo: 'Ferramentas SOSC',
    itens: [
      // 🖥️ PETIÇÃO SE FAZ NO COMPUTADOR. É o hábito de 30 anos.
      { href: '/finaisjus', rotulo: 'FinaisJus Pro', icone: 'balanca' },
      // 📱 20 segundos e POSTA no Instagram. No PC ele teria que baixar,
      //    mandar pro celular, abrir o app... Aqui é 3 toques.
      { href: '/juriscreator', rotulo: 'JurisCreator', icone: 'ia', celular: true },
      { href: '/relatorio', rotulo: 'Relatório SOSC', icone: 'relatorio', emBreve: true },
    ],
  },

  {
    titulo: 'Seu escritório',
    itens: [
      { href: '/escritorio', rotulo: 'Minha OAB', icone: 'oab', emBreve: true },
      { href: '/escritorio?t=logo', rotulo: 'Minha Logomarca', icone: 'logo', emBreve: true },
      { href: '/escritorio?t=pix', rotulo: 'Chave PIX', icone: 'pix', emBreve: true },
      { href: '/plano', rotulo: 'Meus Créditos', icone: 'plano' },
    ],
  },

  {
    // ⚠️ ISTO NÃO ABRE NA WEB. É ferramenta de rua.
    titulo: 'Só no celular',
    itens: [
      { href: '/celular?f=sos', rotulo: 'Acionar SOS', icone: 'sos', soApp: true },
      { href: '/celular?f=prerrogativa', rotulo: 'Prerrogativa', icone: 'prerrogativa', soApp: true },
      { href: '/celular?f=prova', rotulo: 'Gravar Prova', icone: 'escudo', soApp: true },
    ],
  },
];

/*
  ═══════════════════════════════════════════════════════════════════════════
   ✅ FUNCIONA (7):
      Início · Meus Processos · Prazos e Audiências · Clientes ·
      Convidar · Fazer uma Consulta · FinaisJus Pro · Meus Créditos

   🔧 A TELA ABRE, mas ainda não está plugada (7):
      Plantão · Contrato e Procuração · Já Assinados · Cobrar Honorários ·
      Relatório SOSC · Minha OAB · Logomarca · Chave PIX

      Levam o selo "em breve" — para ele saber ANTES de clicar.

   📱 MELHOR NO CELULAR (1):
      JurisCreator — 20 segundos e POSTA no Instagram.

   📵 SÓ NO CELULAR (3):
      Acionar SOS · Prerrogativa · Gravar Prova
      São ferramentas de RUA. Câmera, GPS, push. Não abrem aqui.
  ═══════════════════════════════════════════════════════════════════════════
*/

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
                      {/* ⚠️ Avisa ANTES do clique. */}
                      {i.soApp ? (
                        <b className={s.soApp} title="Só no aplicativo">
                          <Icon n="celular" s={12} strokeWidth={2.2} />
                        </b>
                      ) : i.celular ? (
                        <b className={s.melhorCel} title="Melhor no celular">
                          <Icon n="celular" s={12} strokeWidth={2.2} />
                        </b>
                      ) : i.emBreve ? (
                        <b className={s.emBreve}>em breve</b>
                      ) : null}
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
          <div className={s.versao}>SOSC JUS · 4.0.1 (269)</div>
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

            {/* A trilha: o primeiro nível LEVA de volta */}
            <div className={s.trilha}>
              <span>{atual?.grupo ?? 'Estação'}</span>
              <Icon n="chev" s={13} strokeWidth={2.2} />
              <b>{atual?.rotulo ?? 'Início'}</b>
            </div>

            <div className={s.acoes}>
              {/* 🔔 O SINO — é ele que faz o advogado deixar a estação ABERTA */}
              <Sino />

              <Saldo
                total={adv.creditos ?? 0}
                ilimitado={adv.ilimitado}
                fundador={adv.fundador}
              />
              <Link href="/consultas" className="btn b-gold">
                <Icon n="busca" s={19} strokeWidth={2.1} />
                {/* ⚠️ o texto some no celular — o botão era cortado na borda */}
                <span>Nova consulta</span>
              </Link>
            </div>
          </header>

          <div className={s.area}>{children}</div>
        </div>
      </div>
    </>
  );
}
