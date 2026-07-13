import { buscarSosc } from '@/lib/proxy';
import Cabecalho from '@/components/Cabecalho';
import Icon from '@/components/Icon';
import s from './agenda.module.css';

export const dynamic = 'force-dynamic';

interface Prazo {
  id?: string;
  numeroProcesso?: string;
  cliente?: string;
  tipo?: string;
  dataFim?: string;
  dataFimEfetiva?: string;
  diasRestantes?: number;
  confianca?: 'ALTA' | 'MEDIA' | 'BAIXA' | null;
  base?: string;
  contagem?: string | null;
  origem?: string;
  precisaConfirmar?: boolean;
}
interface Audiencia {
  id?: string;
  numeroProcesso?: string;
  cliente?: string;
  tipo?: string;
  data?: string;
  varaComarca?: string;
  linkVideo?: string | null;
  dataConfirmada?: boolean;
}

export default async function Agenda() {
  const [p, a] = await Promise.all([
    buscarSosc<{ prazos?: Prazo[] }>('/processos/meus-prazos?dias=180'),
    buscarSosc<{ audiencias?: Audiencia[] }>('/processos/minhas-audiencias?dias=180'),
  ]);

  const prazos = p.data?.prazos ?? [];
  const audiencias = a.data?.audiencias ?? [];
  const vencidos = prazos.filter((x) => (x.diasRestantes ?? 0) < 0).length;

  return (
    <>
      <Cabecalho
        eyebrow="Janela de 180 dias · vencidos recentes aparecem"
        titulo="Prazos e"
        destaque="Audiências"
        tom="risk"
        texto="O sistema lê as movimentações e avisa. Confirme ou baixe cada um — nada some sozinho."
      />

      {vencidos > 0 ? (
        <div className="nota risk">
          <Icon n="alerta" s={20} />
          <p>
            <b>
              {vencidos} {vencidos === 1 ? 'prazo venceu' : 'prazos venceram'} e ainda
              não {vencidos === 1 ? 'foi baixado' : 'foram baixados'}.
            </b>{' '}
            Se você já peticionou, baixe da lista. Se não, este é o primeiro item do seu
            dia.
          </p>
        </div>
      ) : null}

      <div className={s.duas}>
        {/* PRAZOS */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-h">
            <h2>Prazos</h2>
            <span className={s.n}>{prazos.length}</span>
          </div>
          <div className="card-b flush">
            {prazos.length === 0 ? (
              <div className={s.nada}>
                <Icon n="relogio" s={30} />
                <p>Nenhum prazo na janela de 180 dias.</p>
              </div>
            ) : (
              prazos.map((x, i) => {
                const d = x.diasRestantes ?? 0;
                const venc = d < 0;
                const urg = d >= 0 && d <= 7;
                const semData = !x.dataFimEfetiva && !x.dataFim;
                return (
                  <div
                    key={x.id ?? i}
                    className={`${s.linha} ${venc ? s.venc : urg ? s.urg : ''} ${semData ? s.incompleto : ''}`}
                  >
                    <div className={s.dias}>
                      <strong>{semData ? '??' : d}</strong>
                      <span>{venc ? 'venceu' : 'dias'}</span>
                    </div>
                    <div className={s.corpo}>
                      <div className={s.tags}>
                        <span>
                          {x.origem === 'MANUAL' ? 'VOCÊ CADASTROU' : 'O SISTEMA ACHOU'}
                        </span>
                        {x.confianca ? (
                          <b className={s[x.confianca.toLowerCase()]}>{x.confianca}</b>
                        ) : null}
                      </div>
                      <strong>{x.tipo ?? 'Prazo'}</strong>
                      <p>{x.numeroProcesso}</p>
                      <small className={semData ? s.aviso : ''}>
                        {semData
                          ? 'Falta a data-base — confira nos autos'
                          : [x.base, x.contagem].filter(Boolean).join(' · ')}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AUDIÊNCIAS */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-h">
            <h2>Audiências</h2>
            <span className={s.n}>{audiencias.length}</span>
          </div>
          <div className="card-b flush">
            {audiencias.length === 0 ? (
              <div className={s.nada}>
                <Icon n="agenda" s={30} />
                <p>Nenhuma audiência na janela de 180 dias.</p>
              </div>
            ) : (
              audiencias.map((x, i) => {
                const dt = x.data ? new Date(x.data) : null;
                const ok = dt && !Number.isNaN(dt.getTime());
                return (
                  <div
                    key={x.id ?? i}
                    className={`${s.linha} ${x.dataConfirmada === false ? s.incompleto : ''}`}
                  >
                    <div className={s.data}>
                      <strong>{ok ? String(dt.getDate()).padStart(2, '0') : '??'}</strong>
                      <span>
                        {ok
                          ? dt
                              .toLocaleDateString('pt-BR', { month: 'short' })
                              .replace('.', '')
                              .toUpperCase()
                          : '—'}
                      </span>
                      <em>
                        {ok
                          ? dt.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </em>
                    </div>
                    <div className={s.corpo}>
                      <div className={s.tags}>
                        <span>{x.linkVideo ? 'VIRTUAL' : 'PRESENCIAL'}</span>
                      </div>
                      <strong>{x.tipo ?? 'Audiência'}</strong>
                      <p>{x.cliente ?? x.numeroProcesso}</p>
                      <small className={x.dataConfirmada === false ? s.aviso : ''}>
                        {x.dataConfirmada === false
                          ? 'Data e local precisam ser conferidos nos autos'
                          : (x.varaComarca ?? '')}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="nota risk">
        <Icon n="alerta" s={20} />
        <p>
          <b>Isto é um aviso, não uma certidão.</b> Antes de peticionar, confira a
          publicação, o calendário do tribunal, o termo inicial e a forma de contagem
          nos autos. A responsabilidade pelo prazo é sua.
        </p>
      </div>
    </>
  );
}
