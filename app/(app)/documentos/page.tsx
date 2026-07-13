import Cabecalho from '@/components/Cabecalho';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';

/**
 * Contrato e Procuração
 *
 * ─── PARA O JULIANO ───────────────────────────────────────────
 * Esta tela consome, via proxy (/api/sosc/** ou /api/finaisjus/**):
 *
 *   GET /documents/preencher/:kind/:clientId · POST /documents/:kind/render · POST /documents/send
 *
 * O padrão de todas as telas é o mesmo:
 *   1. Server Component busca com buscarSosc()  → veja /processos
 *   2. Ações do usuário usam sosc.post/patch    → veja /consultas
 *   3. Erro 402 abre <Compra/>                  → veja /consultas
 * ──────────────────────────────────────────────────────────────
 */

const ROTAS = 'GET /documents/preencher/:kind/:clientId · POST /documents/:kind/render · POST /documents/send';

export default function Pagina() {
  return (
    <>
      <Cabecalho
        eyebrow="Em integração"
        titulo="Contrato e"
        destaque="Procuração"
        tom="gold"
        texto="Preencha o formulário, veja o A4 pronto com a sua logomarca, imprima ou mande o cliente assinar."
      />

      <div className="card">
        <div className={'card-b'} style={CAIXA}>
          <div style={{ color: 'var(--gold)', marginBottom: 20 }}>
            <Icon n="doc" s={44} />
          </div>
          <h2 style={TITULO}>Tela pronta — falta plugar</h2>
          <p style={TEXTO_ST}>
            O desenho, o roteamento e o proxy já estão de pé. O que falta é ligar nos
            endpoints do backend — que já existem.
          </p>
          <code style={CODIGO}>{ROTAS}</code>
        </div>
      </div>

      <div className="nota">
        <Icon n="lock" s={20} />
        <p>
          <b>Como plugar.</b> Copie o padrão de{' '}
          <code style={INLINE}>app/(app)/processos/page.tsx</code> (leitura no servidor)
          e de <code style={INLINE}>app/(app)/consultas/page.tsx</code> (ação do usuário
          + tratamento do 402 → QR de compra). O cliente já está pronto em{' '}
          <code style={INLINE}>lib/api.ts</code>.
        </p>
      </div>
    </>
  );
}

const CAIXA: React.CSSProperties = {
  padding: 60,
  textAlign: 'center',
  maxWidth: '56ch',
  margin: '0 auto',
};
const TITULO: React.CSSProperties = {
  fontFamily: 'var(--serif)',
  fontSize: '1.5rem',
  fontWeight: 600,
  color: 'var(--paper)',
  marginBottom: 12,
};
const TEXTO_ST: React.CSSProperties = {
  fontSize: '1rem',
  color: 'var(--t2)',
  lineHeight: 1.7,
};
const CODIGO: React.CSSProperties = {
  display: 'block',
  marginTop: 22,
  padding: '14px 16px',
  borderRadius: 8,
  background: 'var(--g800)',
  border: '1px solid var(--line2)',
  fontFamily: 'var(--mono)',
  fontSize: '.82rem',
  color: 'var(--t3)',
  textAlign: 'left',
  lineHeight: 1.7,
  wordBreak: 'break-all',
};
const INLINE: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '.86em',
  color: 'var(--gold-lit)',
};
