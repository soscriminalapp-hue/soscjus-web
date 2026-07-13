/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  O QUE SÓ O COMPUTADOR TEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ISTO É O MOTIVO DA ESTAÇÃO EXISTIR.
 *
 *  O celular não exporta Excel. Não imprime. Não arrasta arquivo. Não tem
 *  Ctrl+P nem Ctrl+C rico. Não abre em nova aba.
 *
 *  Nada aqui usa biblioteca externa — é tudo API nativa do navegador.
 *  Zero dependência, zero peso no bundle.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   📊 EXPORTAR PARA EXCEL
   ═══════════════════════════════════════════════════════════════════════════

   ⚠️ NÃO É CSV DISFARÇADO. É um .xls de verdade (SpreadsheetML), que o Excel
      e o LibreOffice abrem com as colunas já separadas, sem perguntar nada.

   O advogado exporta os 284 processos e manda pro contador. Ou filtra os
   honorários em aberto e cobra. Isso é IMPOSSÍVEL no celular.
   ═══════════════════════════════════════════════════════════════════════════ */

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportarExcel(
  nome: string,
  colunas: string[],
  linhas: Array<Array<string | number | null | undefined>>,
) {
  const cab = colunas
    .map((c) => `<Cell ss:StyleID="h"><Data ss:Type="String">${esc(c)}</Data></Cell>`)
    .join('');

  const corpo = linhas
    .map((l) => {
      const cs = l
        .map((v) => {
          const num = typeof v === 'number' && Number.isFinite(v);
          return `<Cell><Data ss:Type="${num ? 'Number' : 'String'}">${esc(v)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cs}</Row>`;
    })
    .join('');

  const xml =
    `<?xml version="1.0"?>` +
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">` +
    `<Styles><Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#D8A631" ss:Pattern="Solid"/></Style></Styles>` +
    `<Worksheet ss:Name="SOSC JUS"><Table><Row>${cab}</Row>${corpo}</Table></Worksheet>` +
    `</Workbook>`;

  baixar(
    new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8' }),
    `${nome}.xls`,
  );
}

/** CSV — quando ele quiser abrir no Google Sheets. */
export function exportarCSV(
  nome: string,
  colunas: string[],
  linhas: Array<Array<string | number | null | undefined>>,
) {
  const cel = (v: unknown) => {
    const x = String(v ?? '');
    return /[";\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x;
  };
  const txt = [colunas.map(cel).join(';'), ...linhas.map((l) => l.map(cel).join(';'))].join('\r\n');
  // ⚠️ o BOM (\uFEFF) faz o Excel brasileiro ler os acentos certo
  baixar(new Blob(['\uFEFF' + txt], { type: 'text/csv;charset=utf-8' }), `${nome}.csv`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   📅 O CALENDÁRIO DELE — .ics
   ═══════════════════════════════════════════════════════════════════════════

   ⚠️ Um clique e a audiência cai no Google Calendar, no Outlook, no calendário
      do Mac. COM ALARME.

      O celular até abre .ics, mas ninguém baixa arquivo no celular pra depois
      importar. No computador é natural.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Evento {
  titulo: string;
  inicio: Date;
  fim?: Date;
  local?: string;
  descricao?: string;
  /** Alarme em minutos antes. Prazo → 1440 (1 dia). Audiência → 120. */
  alarmeMin?: number;
}

function z(n: number) {
  return String(n).padStart(2, '0');
}
function utc(d: Date) {
  return (
    d.getUTCFullYear() +
    z(d.getUTCMonth() + 1) +
    z(d.getUTCDate()) +
    'T' +
    z(d.getUTCHours()) +
    z(d.getUTCMinutes()) +
    '00Z'
  );
}
function dobra(l: string) {
  // RFC 5545: linha no máximo 75 octetos
  const out: string[] = [];
  let x = l;
  while (x.length > 74) {
    out.push(x.slice(0, 74));
    x = ' ' + x.slice(74);
  }
  out.push(x);
  return out.join('\r\n');
}
function txt(v: string) {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function exportarICS(nome: string, eventos: Evento[]) {
  const L: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SOSC JUS//Estacao do Advogado//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const [i, e] of eventos.entries()) {
    const fim = e.fim ?? new Date(e.inicio.getTime() + 60 * 60_000);
    L.push('BEGIN:VEVENT');
    L.push(`UID:${Date.now()}-${i}@soscjus`);
    L.push(`DTSTAMP:${utc(new Date())}`);
    L.push(`DTSTART:${utc(e.inicio)}`);
    L.push(`DTEND:${utc(fim)}`);
    L.push(dobra(`SUMMARY:${txt(e.titulo)}`));
    if (e.local) L.push(dobra(`LOCATION:${txt(e.local)}`));
    if (e.descricao) L.push(dobra(`DESCRIPTION:${txt(e.descricao)}`));

    // ⏰ O ALARME — é ele que salva o prazo
    if (e.alarmeMin) {
      L.push('BEGIN:VALARM');
      L.push('ACTION:DISPLAY');
      L.push(dobra(`DESCRIPTION:${txt(e.titulo)}`));
      L.push(`TRIGGER:-PT${e.alarmeMin}M`);
      L.push('END:VALARM');
    }
    L.push('END:VEVENT');
  }

  L.push('END:VCALENDAR');
  baixar(new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' }), `${nome}.ics`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   🖨️ IMPRIMIR — Ctrl+P
   ═══════════════════════════════════════════════════════════════════════════

   ⚠️ O advogado IMPRIME. Contrato, procuração, pauta do mês, relatório.
      No celular isso não existe. Aqui é um clique.

      E o navegador já gera PDF de graça ("Salvar como PDF" no diálogo de
      impressão) — não precisamos de biblioteca nenhuma.
   ═══════════════════════════════════════════════════════════════════════════ */

export function imprimir() {
  window.print();
}

/**
 * Imprime SÓ um pedaço da tela, num documento limpo.
 * Serve para contrato e procuração — sai com a cara de documento, não de site.
 */
export function imprimirHTML(titulo: string, html: string, css = '') {
  const w = window.open('', '_blank', 'width=820,height=1000');
  if (!w) return;

  w.document.write(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title>
<style>
  @page { size: A4; margin: 2.5cm 2.5cm 2cm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.65;
    color: #000;
    margin: 0;
  }
  h1 { font-size: 15pt; text-align: center; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 26pt; }
  h2 { font-size: 12.5pt; margin: 18pt 0 8pt; }
  p { margin: 0 0 11pt; text-align: justify; text-indent: 1.2cm; }
  .sem-recuo { text-indent: 0; }
  ol, ul { margin: 0 0 11pt 1.2cm; }
  li { margin-bottom: 5pt; text-align: justify; }
  .logo { display: block; max-height: 70px; margin: 0 auto 22pt; }
  .assina { margin-top: 60pt; text-align: center; page-break-inside: avoid; }
  .assina hr { width: 62%; border: none; border-top: 1px solid #000; margin: 0 auto 6pt; }
  .assina p { text-indent: 0; text-align: center; margin: 0; font-size: 11pt; }
  .local-data { text-align: right; text-indent: 0; margin: 34pt 0 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 11pt; }
  td, th { border: 1px solid #999; padding: 6pt 8pt; text-align: left; font-size: 11pt; }
  th { background: #eee; }
  ${css}
</style></head><body>${html}</body></html>`);

  w.document.close();
  w.focus();
  // deixa a fonte carregar antes de abrir o diálogo
  setTimeout(() => {
    w.print();
  }, 260);
}

/* ═══════════════════════════════════════════════════════════════════════════
   📋 COPIAR RICO — cola no Word JÁ FORMATADO
   ═══════════════════════════════════════════════════════════════════════════

   ⚠️ Isto é o que o advogado quer de verdade: escreve o contrato aqui, aperta
      "copiar", cola no Word — e vem com negrito, parágrafo, tudo.

      No celular, copiar formatado não existe.
   ═══════════════════════════════════════════════════════════════════════════ */

export async function copiarRico(html: string, texto: string) {
  try {
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([texto], { type: 'text/plain' }),
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    // navegador antigo: cai pro texto puro
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      return false;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   📝 BAIXAR .DOCX — o Word abre sem reclamar
   ═══════════════════════════════════════════════════════════════════════════

   ⚠️ Truque honesto: um .doc em HTML com o namespace do Word. O Word abre,
      mantém a formatação, e ele edita à vontade. Sem biblioteca de 2 MB.
   ═══════════════════════════════════════════════════════════════════════════ */

export function baixarDoc(nome: string, titulo: string, html: string) {
  const doc =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><title>${esc(titulo)}</title>` +
    `<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->` +
    `<style>@page { size: A4; margin: 2.5cm; } ` +
    `body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.65; } ` +
    `h1 { font-size: 15pt; text-align: center; text-transform: uppercase; } ` +
    `p { text-align: justify; text-indent: 1.2cm; }</style></head>` +
    `<body>${html}</body></html>`;

  baixar(
    new Blob(['\uFEFF' + doc], { type: 'application/msword;charset=utf-8' }),
    `${nome}.doc`,
  );
}

/* ─── o motor de download ─── */
export function baixar(b: Blob, nome: string) {
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(u), 1200);
}

/** Data no padrão do arquivo: 2026-07-13 */
export function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
