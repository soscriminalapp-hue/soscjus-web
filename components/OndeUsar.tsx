/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📱 vs 🖥️  — a honestidade que ninguém faz
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ NEM TUDO É MELHOR NA ESTAÇÃO. E dizer isso GANHA a confiança dele.
 *
 *  Se ele tenta consultar veículo na estação, digita a placa errada e perde
 *  40.000 tokens — ele culpa o produto.
 *
 *  Se a estação AVISA "fotografe a placa no celular, o app lê sozinho",
 *  ele pensa: "esse pessoal sabe o que faz".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  📱 MELHOR NO CELULAR:
 *
 *    JurisCreator     → 20 segundos e POSTA no Instagram.
 *                       No PC: baixa → manda pro celular → abre o app → posta.
 *    Acionar SOS      → é emergência. Ele está NA RUA.
 *    Analisar Print   → o print ESTÁ no celular dele.
 *    Consultar Veículo→ FOTOGRAFA a placa. No PC ele digita (e erra).
 *    Assinar          → selfie + biometria do iPhone.
 *    Prerrogativa     → ele está na DELEGACIA.
 *    Gravar prova     → câmera + GPS + carimbo de tempo.
 *
 *  🖥️ MELHOR NA ESTAÇÃO:
 *
 *    FinaisJus        → PETIÇÃO SE FAZ NO COMPUTADOR. É o hábito de 30 anos.
 *                       Vídeo de 3 GB, 200 páginas de transcrição, e ele
 *                       ESCREVE. No celular ninguém escreve alegações finais.
 *    Ler o processo   → movimentações + relatório LADO A LADO.
 *    Meus Processos   → 200 processos: tabela, filtro, ordenar, exportar.
 *    Contrato         → edita e IMPRIME.
 *    Cobrança         → monta parcelamento.
 */

import Icon from './Icon';
import s from './ondeusar.module.css';

export type Onde = 'celular' | 'estacao';

export default function OndeUsar({
  onde,
  motivo,
  compacto,
}: {
  onde: Onde;
  /** Uma frase. Por que é melhor lá. */
  motivo: string;
  compacto?: boolean;
}) {
  const cel = onde === 'celular';
  return (
    <div className={`${s.selo} ${cel ? s.cel : s.est} ${compacto ? s.mini : ''}`}>
      <Icon n={cel ? 'celular' : 'monitor'} s={compacto ? 14 : 17} />
      <div>
        <strong>{cel ? 'Melhor no celular' : 'Muito melhor aqui'}</strong>
        {!compacto ? <small>{motivo}</small> : null}
      </div>
    </div>
  );
}
