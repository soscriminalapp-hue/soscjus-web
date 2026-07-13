import Cabecalho from '@/components/Cabecalho';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';

/**
 * Plantão Adv.
 *
 * ─── PARA O JULIANO ───────────────────────────────────────────
 * Esta tela consome, via proxy (/api/sosc/** ou /api/finaisjus/**):
 *
 *   GET/PUT /mural/meu-perfil · PATCH /mural/disponibilidade · GET /mural/casos · PATCH /mural/casos/:id
 *
 * O padrão de todas as telas é o mesmo:
 *   1. Server Component busca com buscarSosc()  → veja /processos
 *   2. Ações do usuário usam sosc.post/patch    → veja /consultas
 *   3. Erro 402 abre <Compra/>                  → veja /consultas
 * ──────────────────────────────────────────────────────────────
 */

const ROTAS = 'GET/PUT /mural/meu-perfil · PATCH /mural/disponibilidade · GET /mural/casos · PATCH /mural/casos/:id';

export default function Pagina() {
  return (
    <>
      <Cabecalho
        eyebrow="Em integração"
        titulo="Plantão"
        destaque="Adv."
        tom="tech"
        texto="O mural. Você diz em que áreas e cidades atende, e quem procura vê o seu cartão. Ninguém escolhe por você."
      />

      <div className="card">
        <div className={'card-b'} style={CAIXA}>
          <div style={{ color: 'var(--tech)', marginBottom: 20 }}>
            <Icon n="radar" s={44} />
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
