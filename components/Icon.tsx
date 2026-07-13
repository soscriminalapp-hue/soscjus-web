/**
 * Icon.tsx — ícones em SVG, sem dependência externa.
 * Traço de 1.7 para combinar com a tipografia serif.
 */

import type { SVGProps } from 'react';

export type Nome =
  | 'inicio' | 'processo' | 'agenda' | 'radar' | 'clientes' | 'doc' | 'assinado'
  | 'dinheiro' | 'pix' | 'busca' | 'alerta' | 'carro' | 'print' | 'balanca'
  | 'ia' | 'relatorio' | 'oab' | 'logo' | 'plano' | 'sair' | 'menu' | 'sino'
  | 'chev' | 'mais' | 'x' | 'ok' | 'sync' | 'olho' | 'baixar' | 'subir'
  | 'lock' | 'pin' | 'wa' | 'relogio' | 'atividade' | 'convite' | 'chat'
  | 'apple' | 'play' | 'externo' | 'copiar' | 'celular' | 'escudo';

const P: Record<Nome, JSX.Element> = {
  inicio: <><path d="M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/></>,
  processo: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
  agenda: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  radar: <><circle cx="12" cy="12" r="2"/><path d="M12 12 19 5"/><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="10.5"/></>,
  clientes: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  doc: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
  assinado: <><path d="m3 17 3-3 3 3M6 14V4"/><path d="M11 18h10M13 6l3 3 5-5"/></>,
  dinheiro: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/></>,
  pix: <><path d="m12 3 4.5 4.5L12 12 7.5 7.5z"/><path d="m12 12 4.5 4.5L12 21l-4.5-4.5z"/><path d="M3 12h4M17 12h4"/></>,
  busca: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  alerta: <><path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/></>,
  carro: <><path d="M5 17h14M3 17v-4l2-6h14l2 6v4"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/></>,
  print: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
  balanca: <><path d="M12 3v18M5 21h14M6 7l-3 7h6zM18 7l-3 7h6zM4 7h16"/></>,
  ia: <><path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8zM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8z"/></>,
  relatorio: <><path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="m9 15 2 2 4-4"/></>,
  oab: <><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 22l5-2.5L17 22l-1.5-9.5"/></>,
  logo: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 17 5-5 4 4 3-3 4 4"/></>,
  plano: <><path d="M3 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 9V6a2 2 0 0 1 2-2h11M16 14h4"/></>,
  sair: <><path d="M15 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M10 12h11M18 9l3 3-3 3"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  sino: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  chev: <><path d="m9 18 6-6-6-6"/></>,
  mais: <><path d="M12 5v14M5 12h14"/></>,
  x: <><path d="M18 6 6 18M6 6l12 12"/></>,
  ok: <><path d="m4 12 5 5L20 6"/></>,
  sync: <><path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/></>,
  olho: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  baixar: <><path d="M12 4v11M7 11l5 5 5-5M4 20h16"/></>,
  subir: <><path d="M12 19V8M7 12l5-5 5 5M4 4h16"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  pin: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
  wa: <><path d="M3 21l1.8-5.2A8.5 8.5 0 1 1 8.5 19.6z"/><path d="M8.4 9.3c.3 2.6 3.7 6 6.3 6.3l1.3-1.5-2-1.2-1 .9c-1-.5-2.1-1.6-2.6-2.6l.9-1-1.2-2z"/></>,
  relogio: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  atividade: <><path d="M3 12h4l3 8 4-16 3 8h4"/></>,
  convite: <><path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></>,
  chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></>,
  apple: <><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.3.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.8c1.4 0 2.3-1.3 3.2-2.6.6-.9 1-1.9 1.3-2.9-2.9-1.1-2.8-4-2.8-4z"/><path d="M14.3 4.6c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z"/></>,
  play: <><path d="M4 3.5v17a1 1 0 0 0 1.5.9l13-8.5a1 1 0 0 0 0-1.7l-13-8.5A1 1 0 0 0 4 3.5z"/></>,
  externo: <><path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></>,
  copiar: <><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
  celular: <><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18h4"/></>,
  escudo: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
};

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  n: Nome;
  s?: number;
}

export default function Icon({ n, s = 20, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {P[n]}
    </svg>
  );
}
