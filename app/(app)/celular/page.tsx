'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📵 SÓ NO CELULAR — e a estação diz POR QUÊ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ Estas ferramentas NÃO funcionam aqui. E não é limitação — é natureza.
 *
 *    🚨 ACIONAR SOS       → é EMERGÊNCIA. Ele está NA RUA, sendo abordado.
 *                           Não vai correr até o computador.
 *
 *    🛡️ PRERROGATIVA      → ele está NA DELEGACIA. Precisa acionar AGORA,
 *                           com GPS e gravação.
 *
 *    📸 GRAVAR PROVA      → câmera + GPS + carimbo de tempo + hash.
 *                           O computador não tem nada disso.
 *
 *  ⚠️ E dizer isso GANHA a confiança dele.
 *
 *     Um produto que finge fazer tudo em todo lugar é um produto que mente.
 *     Um produto que diz "isso aqui é do celular" é um produto que SABE
 *     o que faz.
 */

import { useSearchParams } from 'next/navigation';
import Cabecalho from '@/components/Cabecalho';
import Icon, { type Nome } from '@/components/Icon';
import s from './celular.module.css';

interface Ferramenta {
  id: string;
  nome: string;
  icone: Nome;
  cor: 'risco' | 'jur' | 'tech';
  oQueE: string;
  porQue: string;
  precisa: string[];
}

const FERRAMENTAS: Ferramenta[] = [
  {
    id: 'sos',
    nome: 'Acionar o SOS',
    icone: 'sos',
    cor: 'risco',
    oQueE:
      'Três toques no botão vermelho e o registro começa: câmera, áudio, GPS e carimbo de tempo. O advogado de confiança é avisado na hora.',
    porQue:
      'É EMERGÊNCIA. Ele está na rua, sendo abordado. Não vai correr até o computador.',
    precisa: ['Câmera', 'Microfone', 'GPS', 'Notificação'],
  },
  {
    id: 'prerrogativa',
    nome: 'Prerrogativa',
    icone: 'prerrogativa',
    cor: 'jur',
    oQueE:
      'Prerrogativa violada na delegacia? Aciona, grava, e a OAB e os advogados de confiança são avisados — com a sua localização.',
    porQue:
      'Ele está NA DELEGACIA. Precisa acionar AGORA, com a gravação e o GPS rodando.',
    precisa: ['Câmera', 'GPS', 'Notificação'],
  },
  {
    id: 'prova',
    nome: 'Gravar Prova',
    icone: 'escudo',
    cor: 'tech',
    oQueE:
      'Fotografe ou grave. Sai com hash SHA-256, carimbo de tempo e o GPS de onde foi registrado — a cadeia de custódia inteira.',
    porQue:
      'Câmera, GPS e carimbo de tempo. O computador não tem nada disso — e o que ele fotografa não vale como prova.',
    precisa: ['Câmera', 'GPS', 'Carimbo de tempo'],
  },
];

export default function Celular() {
  const params = useSearchParams();
  const foco = params.get('f');
  const lista = foco
    ? FERRAMENTAS.filter((f) => f.id === foco).concat(
        FERRAMENTAS.filter((f) => f.id !== foco),
      )
    : FERRAMENTAS;

  return (
    <>
      <Cabecalho
        eyebrow="Ferramentas de rua"
        titulo="Isto é"
        destaque="do celular"
        tom="tech"
        texto="Não é limitação da estação — é a natureza da ferramenta. Câmera, GPS e o botão de pânico moram no bolso dele."
      />

      <div className={s.lojas}>
        <a
          href="https://apps.apple.com/br/app/sosc-jus/id6739118571"
          target="_blank"
          rel="noopener noreferrer"
          className={s.loja}
        >
          <Icon n="apple" s={26} />
          <div>
            <small>Baixe na</small>
            <strong>App Store</strong>
          </div>
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=br.com.soscriminal.app"
          target="_blank"
          rel="noopener noreferrer"
          className={s.loja}
        >
          <Icon n="play" s={26} />
          <div>
            <small>Baixe no</small>
            <strong>Google Play</strong>
          </div>
        </a>
      </div>

      <div className={s.grade}>
        {lista.map((f) => (
          <article
            key={f.id}
            className={`${s.card} ${s[f.cor]} ${foco === f.id ? s.foco : ''}`}
          >
            <span className={s.ic}>
              <Icon n={f.icone} s={28} />
            </span>
            <h2>{f.nome}</h2>
            <p className={s.oque}>{f.oQueE}</p>

            <div className={s.porque}>
              <Icon n="celular" s={16} />
              <p>{f.porQue}</p>
            </div>

            <div className={s.precisa}>
              {f.precisa.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="nota tech">
        <Icon n="celular" s={20} />
        <p>
          <b>Um produto que finge fazer tudo em todo lugar é um produto que mente.</b>{' '}
          Estas três coisas dependem da câmera, do GPS e do botão de pânico — e isso
          mora no bolso, não na mesa.
        </p>
      </div>
    </>
  );
}
