/**
 * Icon.tsx — um só arquivo, todos os ícones.
 *
 * Traço, não preenchimento. 1.75 de espessura — o peso de um dashboard
 * sério, não de um app de banco infantil.
 */

export type Nome =
  // navegação
  | 'inicio' | 'processo' | 'agenda' | 'radar' | 'clientes' | 'convite'
  | 'doc' | 'assinado' | 'dinheiro' | 'busca' | 'balanca' | 'ia'
  | 'relatorio' | 'oab' | 'logo' | 'pix' | 'plano' | 'carro' | 'print'
  // ação
  | 'mais' | 'x' | 'ok' | 'chev' | 'chevBaixo' | 'sync' | 'baixar' | 'subir'
  | 'anexo' | 'link' | 'lixo' | 'editar' | 'filtro' | 'externo' | 'copiar'
  // estado
  | 'sino' | 'alerta' | 'lock' | 'relogio' | 'atividade' | 'olho'
  | 'sair' | 'menu' | 'celular' | 'monitor' | 'sos' | 'chat' | 'escudo'
  | 'wa' | 'pin' | 'segredo';

const P: Record<Nome, React.ReactNode> = {
  inicio: <><path d="M3 10.2 12 3l9 7.2" /><path d="M5 9.5V20h14V9.5" /><path d="M9.5 20v-6h5v6" /></>,
  processo: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  agenda: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  radar: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  clientes: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 5.5a3 3 0 0 1 0 5.5" /><path d="M18.5 20a5.5 5.5 0 0 0-3-4.9" /></>,
  convite: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M18 8v6M15 11h6" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  assinado: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="m9 15 2 2 4-4" /></>,
  dinheiro: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 12h.01M18 12h.01" /></>,
  busca: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.5-4.5" /></>,
  balanca: <><path d="M12 3v18M7 21h10" /><path d="M12 6 5 8l-2.5 6h9L9 8" /><path d="m12 6 7 2 2.5 6h-9L15 8" /></>,
  ia: <><path d="m12 3 1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z" /><path d="M18 17.5 18.7 19.5 20.7 20.2 18.7 20.9 18 23 17.3 20.9 15.3 20.2 17.3 19.5z" /></>,
  relatorio: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M8.5 16v-3M12 16v-5M15.5 16v-2" /></>,
  oab: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2.2" /><path d="M5.5 16.5a4 4 0 0 1 7 0" /><path d="M15 9h4M15 13h4" /></>,
  logo: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.8" /><path d="m4 17 4.5-4.5 3.5 3.5 3-3L20 17" /></>,
  pix: <><path d="M12 3 3 12l9 9 9-9z" /><path d="M8 12h8M12 8v8" /></>,
  plano: <><path d="m12 2 2.9 6.3 6.6.9-4.8 4.6 1.2 6.7L12 17.3 6.1 20.5l1.2-6.7L2.5 9.2l6.6-.9z" /></>,
  carro: <><path d="M5 17h14M5 17a2 2 0 1 1-2-2m2 2v-2m14 2a2 2 0 1 0 2-2m-2 2v-2" /><path d="M3 15v-3l2-5h14l2 5v3" /><path d="M7 12h10" /></>,
  print: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m6 14 4-4 3 3 2-2 3 3" /><circle cx="9" cy="8.5" r="1.2" /></>,
  segredo: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.4" /></>,

  mais: <><path d="M12 5v14M5 12h14" /></>,
  x: <><path d="M18 6 6 18M6 6l12 12" /></>,
  ok: <><path d="m4 12.5 5 5L20 6.5" /></>,
  chev: <><path d="m9 5 7 7-7 7" /></>,
  chevBaixo: <><path d="m5 9 7 7 7-7" /></>,
  sync: <><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 3v5h-5M3 21v-5h5" /></>,
  baixar: <><path d="M12 3v12M7 11l5 5 5-5M4 20h16" /></>,
  subir: <><path d="M12 21V9M7 13l5-5 5 5M4 4h16" /></>,
  anexo: <><path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3l8-8" /></>,
  link: <><path d="M9 15 15 9" /><path d="M11 6.5 13 4.5a4 4 0 0 1 6 6l-2 2" /><path d="M13 17.5 11 19.5a4 4 0 0 1-6-6l2-2" /></>,
  lixo: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" /><path d="M10 11v6M14 11v6" /></>,
  editar: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  filtro: <><path d="M3 5h18l-7 8v6l-4 2v-8z" /></>,
  externo: <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" /></>,
  copiar: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,

  sino: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  alerta: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  atividade: <><path d="M3 12h4l3 8 4-16 3 8h4" /></>,
  olho: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  sair: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  celular: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M10 18h4" /></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  sos: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></>,
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4.2-1L3 20l1.2-4.5A8.4 8.4 0 0 1 3 11.5a8.5 8.5 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4z" /></>,
  escudo: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  wa: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4.2-1L3 20l1.2-4.5A8.4 8.4 0 0 1 3 11.5a8.5 8.5 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4z" /><path d="M8.5 9.5c0 3 2 5 5 5.5" /></>,
  pin: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
};

export default function Icon({
  n,
  s = 20,
  strokeWidth = 1.75,
  ...rest
}: {
  n: Nome;
  s?: number;
  strokeWidth?: number;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {P[n]}
    </svg>
  );
}
