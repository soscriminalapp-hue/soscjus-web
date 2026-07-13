'use client';

/**
 * FinaisJus Pro — dentro da estação.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  COMO FUNCIONA (e por que é assim)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. O advogado sobe o PDF do processo + o vídeo (ou áudio) da audiência.
 *
 * 2. O VÍDEO SOBE INTEIRO — e está certo. O VPS extrai o áudio com ffmpeg,
 *    que é mais confiável que Web Audio no navegador. O upload passa em
 *    STREAMING pelo proxy: um arquivo de 3 GB não é carregado na memória
 *    do Next.
 *
 * 3. No VPS roda o WhisperX — não a API da OpenAI. Motivo: a API transcreve
 *    mas NÃO DIARIZA. Sem saber quem falou, não existe cruzamento de
 *    depoimento. O WhisperX junta Whisper + wav2vec2 (alinhamento) +
 *    pyannote (diarização), e devolve:
 *
 *       [SPEAKER_01] 00:14:38 — "Vi sim, doutor, ele estava na esquina."
 *       [SPEAKER_01] 01:02:11 — "Não, eu não estava lá naquela hora."
 *                                 ↑ contradição
 *
 * 4. O job é assíncrono (BullMQ + Redis). Uma audiência de 4h leva de
 *    20 a 60 min. A tela faz polling a cada 3s e mostra o progresso real
 *    (chunksProcessados / chunksTotal).
 *
 * 5. Sai um dossiê de 8 abas. A peça pode ser baixada em DOCX timbrado
 *    com a logomarca do escritório.
 *
 * 6. PAYWALL: a web NUNCA cobra. Sem token → 402 → abre o QR e o
 *    advogado paga no celular, pela Apple ou Google.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { finaisjus, ApiError, type StatusFinaisJus, type DossieFinaisJus } from '@/lib/api';
import Cabecalho from '@/components/Cabecalho';
import OndeUsar from '@/components/OndeUsar';
import Icon from '@/components/Icon';
import Compra from '@/components/Compra';
import { PRECOS ,
  fmt,
} from '@/lib/creditos';
import s from './finaisjus.module.css';

type Aba =
  | 'memoriais'
  | 'linhaDoTempo'
  | 'resumo'
  | 'teses'
  | 'nulidades'
  | 'contradicoes'
  | 'pontosAtencao'
  | 'transcricao';

const ABAS: Array<{ id: Aba; rotulo: string }> = [
  { id: 'memoriais', rotulo: 'Peça' },
  { id: 'linhaDoTempo', rotulo: 'Linha do tempo' },
  { id: 'resumo', rotulo: 'Resumo' },
  { id: 'teses', rotulo: 'Teses' },
  { id: 'nulidades', rotulo: 'Nulidades' },
  { id: 'contradicoes', rotulo: 'Contradições' },
  { id: 'pontosAtencao', rotulo: 'Atenção' },
  { id: 'transcricao', rotulo: 'Transcrição' },
];

const TIPOS = [
  'Memoriais (alegações finais)',
  'Alegações finais orais reduzidas a termo',
  'Razões de apelação',
];

function tamanho(bytes: number) {
  if (bytes > 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes > 1_048_576) return `${Math.round(bytes / 1_048_576)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function FinaisJus() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [midia, setMidia] = useState<File | null>(null);
  const [reus, setReus] = useState('');
  const [cnj, setCnj] = useState('');
  const [tipo, setTipo] = useState(TIPOS[0]);

  const [jobId, setJobId] = useState<string | null>(null);
  const [st, setSt] = useState<StatusFinaisJus | null>(null);
  const [dossie, setDossie] = useState<DossieFinaisJus | null>(null);
  const [aba, setAba] = useState<Aba>('memoriais');
  const [enviando, setEnviando] = useState(false);
  const [pctUpload, setPctUpload] = useState(0);
  const [erro, setErro] = useState('');
  const [comprar, setComprar] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const parar = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => parar, [parar]);

  /* ── polling do job ── */
  useEffect(() => {
    if (!jobId) return;
    parar();

    const tick = async () => {
      try {
        const r = await finaisjus.status(jobId);
        setSt(r);
        if (r.estado === 'concluido' && r.resultado) {
          setDossie(r.resultado);
          parar();
        }
        if (r.estado === 'erro') {
          setErro(r.erro ?? 'O processamento falhou. Tente de novo.');
          parar();
        }
      } catch {
        /* rede oscilou — tenta no próximo tick */
      }
    };

    void tick();
    timer.current = setInterval(tick, 3000);
    return parar;
  }, [jobId, parar]);

  /* ── upload com progresso real (XHR: fetch não dá progresso de upload) ── */
  function enviar() {
    if (!pdf && !midia) {
      setErro('Envie ao menos o PDF do processo ou a audiência.');
      return;
    }
    setErro('');
    setEnviando(true);
    setPctUpload(0);
    setDossie(null);
    setSt(null);

    const fd = new FormData();
    if (pdf) fd.append('processo', pdf);
    if (midia) fd.append('audio', midia);
    fd.append('tipoPeca', tipo);
    if (reus.trim()) fd.append('reus', reus.trim());
    if (cnj.trim()) fd.append('numeroProcesso', cnj.trim());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/finaisjus/processar');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setPctUpload(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setEnviando(false);
      let body: { jobId?: string; erro?: string; message?: string } = {};
      try {
        body = JSON.parse(xhr.responseText) as typeof body;
      } catch {
        /* corpo não-JSON */
      }

      // 402 → sem token. A web NÃO cobra: manda pro celular.
      if (xhr.status === 402) {
        setComprar('FINAISJUS');
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300 || !body.jobId) {
        setErro(body.erro ?? body.message ?? 'Não foi possível enviar. Tente de novo.');
        return;
      }
      setJobId(body.jobId);
    };

    xhr.onerror = () => {
      setEnviando(false);
      setErro('A conexão caiu durante o envio. Tente de novo.');
    };

    xhr.send(fd);
  }

  function limpar() {
    parar();
    setJobId(null);
    setSt(null);
    setDossie(null);
    setPdf(null);
    setMidia(null);
    setPctUpload(0);
    setErro('');
  }

  const processando = Boolean(jobId) && !dossie && !erro;
  const chunks =
    st?.chunksTotal && st.chunksTotal > 0
      ? Math.round(((st.chunksProcessados ?? 0) / st.chunksTotal) * 100)
      : null;

  return (
    <>
      <Cabecalho
        eyebrow="Ferramenta SOSC"
        titulo="FinaisJus"
        destaque="Pro"
        tom="mind"
        texto="Envie o processo e a audiência. Ele transcreve separando quem falou, cruza os depoimentos e devolve a peça escrita."
        acoes={
          dossie ? (
            <button className="btn b-ghost" onClick={limpar}>
              <Icon n="mais" s={19} strokeWidth={2.1} />

      {/*
        🖥️ PETIÇÃO SE FAZ NO COMPUTADOR.

        É o hábito de 30 anos do advogado. Ninguém escreve alegações finais
        no celular.

        E aqui ele:
          · sobe vídeo de 3 GB e CONTINUA TRABALHANDO em outra aba
          · lê 200 páginas de transcrição numa tela de 27"
          · marca o trecho, cruza o depoimento, ESCREVE a peça
      */}
      <div className={s.melhorAqui}>
        <OndeUsar
          onde="estacao"
          motivo="Petição se faz no computador. Suba o vídeo da audiência e continue trabalhando — quando terminar, você lê a transcrição inteira e escreve a peça, tudo na mesma tela."
        />
      </div>
              Nova peça
            </button>
          ) : null
        }
      />

      {/* ─────────── DOSSIÊ PRONTO ─────────── */}
      {dossie ? (
        <div className={s.dossie}>
          <div className={s.abas} role="tablist">
            {ABAS.map((a) => {
              const tem = Boolean((dossie as Record<string, unknown>)[a.id]);
              return (
                <button
                  key={a.id}
                  role="tab"
                  aria-selected={aba === a.id}
                  className={aba === a.id ? s.abaOn : ''}
                  onClick={() => setAba(a.id)}
                  disabled={!tem}
                  title={tem ? undefined : 'Esta parte não foi gerada'}
                >
                  {a.rotulo}
                </button>
              );
            })}
          </div>

          <div className={s.folha}>
            {st?.diarizada && aba === 'transcricao' ? (
              <div className={s.diar}>
                <Icon n="ok" s={17} strokeWidth={2.4} />
                <span>
                  <b>Locutores separados.</b> Cada fala está identificada por quem falou —
                  é isso que permite cruzar os depoimentos.
                </span>
              </div>
            ) : null}
            <pre>{(dossie as Record<string, string | undefined>)[aba] ?? '—'}</pre>
          </div>

          <div className={s.pe}>
            {jobId ? (
              <a
                className="btn b-mind"
                href={`/api/finaisjus/docx/${jobId}`}
                download
              >
                <Icon n="baixar" s={19} strokeWidth={2.1} />
                Baixar a peça em DOCX
              </a>
            ) : null}
            <button
              className="btn b-ghost"
              onClick={() => {
                const t = (dossie as Record<string, string | undefined>)[aba] ?? '';
                void navigator.clipboard.writeText(t);
              }}
            >
              <Icon n="copiar" s={19} strokeWidth={2.1} />
              Copiar esta aba
            </button>
          </div>

          <div className="nota risk">
            <Icon n="alerta" s={20} />
            <p>
              <b>Isto é uma minuta, não uma peça pronta para protocolar.</b> O FinaisJus
              escreve a partir do que estava nos autos que você enviou. A revisão, a
              estratégia e a assinatura continuam sendo suas — e a responsabilidade
              técnica também.
            </p>
          </div>
        </div>
      ) : processando ? (
        /* ─────────── PROCESSANDO ─────────── */
        <div className="card">
          <div className={s.trabalhando}>
            <div className={s.orbe}>
              <i />
              <i />
              <Icon n="balanca" s={30} />
            </div>
            <h2>{st?.passo ?? 'Preparando…'}</h2>
            <p>
              Uma audiência longa pode levar de 20 a 60 minutos. Você pode fechar esta
              aba — ao voltar, o resultado estará aqui.
            </p>

            {chunks !== null ? (
              <>
                <div className={s.barra}>
                  <i style={{ width: `${chunks}%` }} />
                </div>
                <span className={s.chunks}>
                  {st?.chunksProcessados ?? 0} de {st?.chunksTotal} trechos transcritos
                  {st?.diarizada ? ' · locutores separados' : ''}
                </span>
              </>
            ) : (
              <div className={s.barra}>
                <i className={s.indef} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─────────── FORMULÁRIO ─────────── */
        <>
          <div className="card">
            <div className="card-b">
              <div className={s.dois}>
                {/* PDF */}
                <label className={`${s.zona} ${pdf ? s.zonaCheia : ''}`}>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
                    disabled={enviando}
                  />
                  <Icon n="doc" s={30} />
                  {pdf ? (
                    <>
                      <b>{pdf.name}</b>
                      <small>{tamanho(pdf.size)} · toque para trocar</small>
                    </>
                  ) : (
                    <>
                      <b>PDF do processo</b>
                      <small>
                        Os autos completos. Ele lê rápido, mesmo com centenas de páginas.
                      </small>
                    </>
                  )}
                </label>

                {/* VÍDEO / ÁUDIO */}
                <label className={`${s.zona} ${midia ? s.zonaCheia : ''}`}>
                  <input
                    type="file"
                    accept="video/*,audio/*,.mp4,.mov,.mp3,.m4a,.wav,.aac,.ogg,.mpeg,.mp2"
                    onChange={(e) => setMidia(e.target.files?.[0] ?? null)}
                    disabled={enviando}
                  />
                  <Icon n="atividade" s={30} />
                  {midia ? (
                    <>
                      <b>{midia.name}</b>
                      <small>{tamanho(midia.size)} · toque para trocar</small>
                    </>
                  ) : (
                    <>
                      <b>Vídeo ou áudio da audiência</b>
                      <small>
                        Pode mandar o vídeo do PJe direto. O servidor extrai o áudio e
                        transcreve separando quem falou.
                      </small>
                    </>
                  )}
                </label>
              </div>

              <div className="f2" style={{ marginTop: 22 }}>
                <label className="fld">
                  <span>Quem você defende</span>
                  <input
                    value={reus}
                    onChange={(e) => setReus(e.target.value)}
                    placeholder="Nome do réu (ou dos réus, separados por vírgula)"
                    disabled={enviando}
                  />
                </label>
                <label className="fld">
                  <span>Número do processo (opcional)</span>
                  <input
                    className="mono"
                    value={cnj}
                    onChange={(e) => setCnj(e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                    disabled={enviando}
                  />
                </label>
              </div>

              <label className="fld">
                <span>Que peça você quer</span>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  disabled={enviando}
                >
                  {TIPOS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>

              {erro ? (
                <div className={s.erro} role="alert">
                  <Icon n="alerta" s={18} />
                  <span>{erro}</span>
                </div>
              ) : null}

              {enviando ? (
                <>
                  <div className={s.barra}>
                    <i style={{ width: `${pctUpload}%` }} />
                  </div>
                  <span className={s.chunks}>
                    Enviando… {pctUpload}%
                    {midia && midia.size > 500_000_000
                      ? ' — arquivo grande, pode demorar alguns minutos'
                      : ''}
                  </span>
                </>
              ) : (
                <button
                  className="btn b-mind full"
                  onClick={enviar}
                  disabled={!pdf && !midia}
                  style={{ padding: 15 }}
                >
                  <Icon n="balanca" s={19} strokeWidth={2.1} />
                  Gerar a peça
                </button>
              )}
            </div>
          </div>

          {/* ─── as 4 etapas ─── */}
          <div className={s.etapas}>
            {[
              {
                n: '01',
                t: 'Transcreve',
                d: 'Áudio e vídeo viram texto — e cada fala fica identificada por quem falou.',
              },
              {
                n: '02',
                t: 'Cruza',
                d: 'Compara os depoimentos e mostra onde a testemunha se contradisse.',
              },
              {
                n: '03',
                t: 'Levanta',
                d: 'Nulidades, cadeia de custódia quebrada, prova ilícita.',
              },
              {
                n: '04',
                t: 'Escreve',
                d: 'A peça sai pronta. Você lê, corrige e assina.',
              },
            ].map((e) => (
              <div key={e.n} className={s.etapa}>
                <span>{e.n}</span>
                <strong>{e.t}</strong>
                <p>{e.d}</p>
              </div>
            ))}
          </div>

          <div className="nota tech">
            <Icon n="lock" s={20} />
            <p>
              <b>Por que a transcrição sabe quem falou.</b> O SOSC JUS não usa a
              transcrição comum — ela devolve um bloco de texto corrido, sem separar as
              pessoas. Aqui os locutores são separados um a um. Sem isso não dá para
              cruzar depoimento, e sem cruzar depoimento não existe contradição
              encontrada.
            </p>
          </div>
        </>
      )}

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          enviar(); // destrava sozinha
        }}
      />
    </>
  );
}
