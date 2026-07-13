'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SHELL — a moldura. O menu, a topbar, o saldo.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ A ORDEM DO MENU NÃO É ALFABÉTICA NEM ESTÉTICA.
 *     É A ORDEM DO DIA DO ADVOGADO:
 *
 *     1. PROCESSOS + PRAZOS   → o que aperta HOJE. É o que ele abre pra ver.
 *     2. PLANTÃO ADV.         → a conexão com o usuário. O cliente NOVO.
 *     3. CLIENTES             → tudo sobre a PESSOA (inclusive as consultas
 *                               de CPF/mandado/processual — são sobre pessoa)
 *     4. FERRAMENTAS          → veículo, print, FinaisJus, JurisCreator
 *     5. ESCRITÓRIO           → tokens, OAB, logo, PIX
 *
 *  ⚠️ TODO ITEM DAQUI ABRE E FUNCIONA. Não existe "em breve" — se não
 *     funciona, não está no menu.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🎯 O ITEM ATIVO PRECISA GRITAR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  O pecado capital de todo dashboard ruim: ele clica e não sabe onde está.
 *  Aqui: barra dourada à esquerda + fundo aceso + ícone e texto em ouro.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Icon, { type Nome } from './Icon';
import Saldo from './Saldo';
import Sino from './Sino';
import s from './shell.module.css';

export interface Advogado {
  nome: string;
  email: string;
  oab: string | null;
  plano: string;
  saldoTokens?: number;
  ilimitado?: boolean;
  fundador?: boolean;
}

interface Item {
  href: string;
  rotulo: string;
  icone: Nome;
  /** A cor do item — o menu não é cinza. Cada área tem a sua. */
  cor?: 'gold' | 'risk' | 'lime' | 'tech' | 'money' | 'mind';
  /** 📱 é melhor no celular — avisa, mas não bloqueia. */
  celular?: boolean;
}

interface Grupo {
  titulo?: string;
  itens: Item[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   O MENU — na ordem do dia dele
   ═══════════════════════════════════════════════════════════════════════════ */
const MENU: Grupo[] = [
  {
    itens: [{ href: '/inicio', rotulo: 'Início', icone: 'inicio', cor: 'gold' }],
  },

  {
    // 1️⃣ O QUE APERTA HOJE
    titulo: 'Processos',
    itens: [
      { href: '/processos', rotulo: 'Meus Processos', icone: 'processo' },
      { href: '/agenda', rotulo: 'Prazos e Audiências', icone: 'agenda', cor: 'risk' },
    ],
  },

  {
    // 2️⃣ A CONEXÃO COM O USUÁRIO — o cliente NOVO chega aqui
    titulo: 'Plantão',
    itens: [
      { href: '/plantao', rotulo: 'Plantão Adv.', icone: 'radar', cor: 'lime' },
    ],
  },

  {
    // 3️⃣ TUDO SOBRE A PESSOA
    //    ⚠️ As consultas (processual, mandado, cadastral) moram AQUI —
    //       são sobre a PESSOA, não sobre o processo. Quando ele clica em
    //       "Clientes", ele está no MODO PESSOA.
    titulo: 'Clientes',
    itens: [
      { href: '/clientes', rotulo: 'Meus Clientes', icone: 'clientes' },
      { href: '/clientes/convidar', rotulo: 'Convidar Cliente', icone: 'convite' },
      { href: '/consultas/processual', rotulo: 'Consulta Processual', icone: 'busca', cor: 'gold' },
      { href: '/consultas/mandado', rotulo: 'Consulta de Mandado', icone: 'alerta', cor: 'risk' },
      { href: '/consultas/cadastral', rotulo: 'Consulta Cadastral', icone: 'oab', cor: 'gold' },
      { href: '/documentos', rotulo: 'Contrato e Procuração', icone: 'doc' },
      { href: '/assinados', rotulo: 'Já Assinados', icone: 'assinado' },
      { href: '/honorarios', rotulo: 'Cobrar Honorários', icone: 'dinheiro', cor: 'money' },
    ],
  },

  {
    // 4️⃣ AS FERRAMENTAS AVULSAS
    titulo: 'Ferramentas',
    itens: [
      { href: '/consultas/veiculo', rotulo: 'Consultar Veículo', icone: 'carro', cor: 'mind' },
      { href: '/consultas/print', rotulo: 'Analisar Print', icone: 'print', cor: 'lime', celular: true },
      { href: '/finaisjus', rotulo: 'FinaisJus Pro', icone: 'balanca', cor: 'tech' },
      { href: '/juriscreator', rotulo: 'JurisCreator', icone: 'ia', cor: 'mind', celular: true },
      { href: '/relatorios', rotulo: 'Relatórios', icone: 'relatorio' },
    ],
  },

  {
    // 5️⃣ O ESCRITÓRIO
    titulo: 'Escritório',
    itens: [
      { href: '/tokens', rotulo: 'Meus Tokens', icone: 'plano', cor: 'tech' },
      { href: '/escritorio', rotulo: 'OAB, Logo e PIX', icone: 'logo' },
    ],
  },
];

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

  /** Qual item está ativo? O mais específico que casa. */
  const ativo = MENU.flatMap((g) => g.itens)
    .filter((i) => path === i.href || path.startsWith(i.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const grupo = MENU.find((g) => g.itens.some((i) => i.href === ativo?.href));

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className={s.shell}>
      {/* ═══ A SIDEBAR ═══ */}
      <aside className={`${s.side} ${aberto ? s.sideOn : ''}`}>
        {/* 🏠 o logo LEVA pro início — o atalho universal */}
        <Link href="/inicio" className={s.marca} onClick={() => setAberto(false)}>
          <Image src="/sosc_jus_logo.png" alt="" width={38} height={38} />
          <div>
            <strong>
              SOSC <em>JUS</em>
            </strong>
            <span>ESTAÇÃO DO ADVOGADO</span>
          </div>
        </Link>

        <nav className={s.nav}>
          {MENU.map((g, gi) => (
            <div key={gi} className={s.grupo}>
              {g.titulo ? <h3>{g.titulo}</h3> : null}

              {g.itens.map((i) => {
                const on = ativo?.href === i.href;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={`${s.item} ${on ? s.on : ''} ${i.cor ? s[i.cor] : ''}`}
                    onClick={() => setAberto(false)}
                  >
                    <Icon n={i.icone} s={19} />
                    <span>{i.rotulo}</span>

                    {/* 📱 melhor no celular — avisa, não bloqueia */}
                    {i.celular ? (
                      <em className={s.cel} title="Melhor no celular">
                        <Icon n="celular" s={12} strokeWidth={2.2} />
                      </em>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ─── O RODAPÉ: quem ele é ─── */}
        <div className={s.rodape}>
          <div className={s.eu}>
            <span className={s.avatar}>
              {adv.nome
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()}
            </span>
            <div className={s.euTxt}>
              <strong>{adv.nome}</strong>
              <small>
                {adv.oab ? `OAB ${adv.oab}` : 'Advogado'} · {adv.plano}
              </small>
            </div>
            <button onClick={sair} className={s.sair} title="Sair" aria-label="Sair">
              <Icon n="sair" s={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* véu no celular */}
      {aberto ? <div className={s.veu} onClick={() => setAberto(false)} /> : null}

      {/* ═══ O CONTEÚDO ═══ */}
      <div className={s.main}>
        <header className={s.topbar}>
          <button
            className={s.hamb}
            onClick={() => setAberto((v) => !v)}
            aria-label="Menu"
          >
            <Icon n="menu" s={22} />
          </button>

          {/* a trilha — some no celular, o espaço é sagrado lá */}
          <div className={s.trilha}>
            {grupo?.titulo ? (
              <>
                <span>{grupo.titulo}</span>
                <Icon n="chev" s={13} strokeWidth={2.2} />
              </>
            ) : null}
            <b>{ativo?.rotulo ?? 'Início'}</b>
          </div>

          <div className={s.acoes}>
            {/* 🔔 é o sino que faz ele deixar a estação ABERTA */}
            <Sino />

            <Saldo
              total={adv.saldoTokens ?? 0}
              ilimitado={adv.ilimitado}
              fundador={adv.fundador}
            />
          </div>
        </header>

        <main className={s.conteudo}>{children}</main>
      </div>
    </div>
  );
}
