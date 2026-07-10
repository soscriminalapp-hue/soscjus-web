'use client';

import Link from 'next/link';
import { useAuth } from '@/store/auth';

const ACOES = [
  {
    href: '/consulta',
    titulo: 'Consulta Processual',
    desc: 'Pesquise por CNJ ou CPF. Capa e movimentações do processo.',
  },
  {
    href: '/mandado',
    titulo: 'Mandado de Prisão',
    desc: 'Consulta nacional no BNMP/CNJ por CPF e nome.',
  },
  {
    href: '/cpf',
    titulo: 'Consultar CPF · Antecedentes',
    desc: 'Ficha cadastral e certidão de antecedentes criminais.',
  },
  {
    href: '/documentos/HONORARIOS',
    titulo: 'Contrato de Honorários',
    desc: 'Gere e imprima na frente do cliente. Preenche sozinho.',
  },
  {
    href: '/documentos/PROCURACAO',
    titulo: 'Procuração',
    desc: 'Mesmos dados do cliente, sem redigitar. Pronta pra assinatura.',
  },
  {
    href: '/processos',
    titulo: 'Meus Processos',
    desc: 'Onde você atua, pela sua OAB. Andamentos em tela cheia.',
  },
  {
    href: '/clientes',
    titulo: 'Clientes',
    desc: 'Veja os clientes vinculados e seus documentos.',
  },
];

// Ferramentas que já são webs próprias no ar (mesma conta SOSC JUS).
// Abrem em nova aba; não são reimplementadas aqui.
const ACOES_EXTERNAS = [
  {
    href: 'https://finaisjus.soscriminal.com.br',
    titulo: 'FinaisJus Pro ↗',
    desc: 'Alegações finais a partir do áudio da audiência + autos.',
  },
  {
    href: 'https://juriscreator.soscriminal.com.br',
    titulo: 'JurisCreator IA ↗',
    desc: 'Criativos jurídicos: jurisprudência + visual pra redes.',
  },
];

export default function DashboardPage() {
  const user = useAuth((s) => s.user);
  const primeiroNome = (user?.fullName ?? '').split(' ')[0] || 'Doutor(a)';

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Olá, {primeiroNome}.</h1>
        <p className="text-texto-sec mt-1">
          Sua estação de trabalho no computador — contratos, procurações e processos.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACOES.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl border border-linha bg-preto-card p-5 hover:border-dourado/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold group-hover:text-dourado transition-colors">
                {a.titulo}
              </h2>
              <span className="text-texto-sec group-hover:text-dourado transition-colors">→</span>
            </div>
            <p className="text-sm text-texto-sec">{a.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-sm text-texto-sec uppercase tracking-wide mt-8 mb-3">
        Produção com IA
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACOES_EXTERNAS.map((a) => (
          <a
            key={a.href}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-linha bg-preto-card p-5 hover:border-dourado/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold group-hover:text-dourado transition-colors">
                {a.titulo}
              </h2>
            </div>
            <p className="text-sm text-texto-sec">{a.desc}</p>
          </a>
        ))}
      </div>

      <p className="text-xs text-texto-sec mt-8">
        Assinaturas e compras avulsas continuam no app. A versão web foca na produção de documentos
        e consulta.
      </p>
    </div>
  );
}
