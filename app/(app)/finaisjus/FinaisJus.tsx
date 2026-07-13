'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚖️ FINAISJUS PRO — MUITO MELHOR AQUI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ PETIÇÃO SE FAZ NO COMPUTADOR. É o hábito de 30 anos.
 *
 *  Ninguém escreve alegações finais no celular. Aqui ele:
 *    · ARRASTA o PDF de 800 páginas e o vídeo de 3 GB
 *    · sobe e CONTINUA TRABALHANDO em outra aba
 *    · lê a transcrição inteira numa tela de 27"
 *    · marca o trecho, cruza o depoimento, ESCREVE
 *
 *  No celular, subir 3 GB é impensável — e ele não ia escrever mesmo.
 */

import { useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import Icon from '@/components/Icon';
import Token from '@/components/Token';
import Gastar from '@/components/Gastar';
import s from './finaisjus.module.css';

type Peca = 'MEMORIAIS' | 'ALEGACOES_ORAIS' | 'APELACAO';

const PECAS: Array<{ id: Peca; nome: string; oQue: string }> = [
  { id: 'MEMORIAIS', nome: 'Memoriais (alegações finais)', oQue: 'A peça completa, com preliminares, mérito e dosimetria.' },
  { id: 'ALEGACOES_ORAIS', nome: 'Alegações finais orais reduzidas a termo', oQue: 'Mais enxuta, para ditar em audiência.' },
  { id: 'APELACAO', nome: 'Razões de apelação', oQue: 'Contra a sentença — com o que foi decidido e o que atacar.' },
];

export default function FinaisJus({ saldo }: { saldo: number }) {
  const params = useSearchParams();
  const router = useRouter();
  const refPdf = useRef<HTMLInputElement>(null);
  const refVid = useRef<HTMLInputElement>(null);

  const [pdf, setPdf] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [arrasta, setArrasta] = useState<'pdf' | 'video' | null>(null);

  const [cnj, setCnj] = useState(params.get('cnj') ?? '');
  const [reus, setReus] = useState('');
  const [peca, setPeca] = useState<Peca>('MEMORIAIS');

  const [gastar, setGastar] = useState<'FINAISJUS' | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');

  const mb = (f: File) => (f.size / 1024 / 1024).toFixed(1);

  async function gerar() {
    setGastar(null);
    if (!pdf) {
      setErro('Suba o PDF do processo.');
      return;
    }
    if (!reus.trim()) {
      setErro('Informe o réu que você representa.');
      return;
    }

    setOcupado(true);
    setErro('');
    setOk('');
    setProgresso(0);

    try {
      const fd = new FormData();
      fd.append('pdf', pdf);
      if (video) fd.append('midia', video);
      fd.append('numeroProcesso', cnj.replace(/\D/g, ''));
      fd.append('reus', reus.trim());
      fd.append('tipoPeca', peca);

      // ⚠️ upload longo — o proxy já dá 10 min pra /pecas
      const r = await fetch('/api/sosc/pecas/gerar', { method: 'POST', body: fd });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        throw new ApiError(r.status, b.message ?? 'Não foi possível gerar a peça.', b);
      }

      setOk('A peça entrou na fila. Você é avisado quando ficar pronta — pode fechar esta aba.');
      setProgresso(100);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        router.push('/tokens');
        return;
      }
      setErro(e instanceof ApiError ? e.message : 'Não foi possível gerar a peça.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <header className={s.topo}>
        <span className={s.ic}>
          <Icon n="balanca" s={26} />
        </span>
        <div>
          <h1>
            FinaisJus <em>Pro</em>
          </h1>
          <p>
            O PDF do processo e o vídeo da audiência viram a peça escrita — com os
            depoimentos transcritos, diarizados e cruzados.
          </p>
        </div>
        <Token n={80_000} saldo={saldo} />
      </header>

      {/* 🖥️ A HONESTIDADE — aqui é muito melhor, e a gente diz por quê */}
      <div className="nota tech">
        <Icon n="monitor" s={19} />
        <p>
          <b>Muito melhor aqui.</b> Petição se faz no computador — é o hábito de 30
          anos. Suba o vídeo da audiência e <b>continue trabalhando</b>: quando
          terminar, você lê a transcrição inteira e escreve a peça, tudo na mesma tela.
        </p>
      </div>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}
      {ok ? (
        <div className={s.ok}>
          <Icon n="ok" s={17} strokeWidth={2.6} />
          <span>{ok}</span>
        </div>
      ) : null}

      <div className={s.duas}>
        <section className="card">
          <div className="card-h">
            <h2>
              <span className={s.passo}>01</span>
              Os autos e a audiência
            </h2>
          </div>
          <div className="card-b">
            {/* ⬆️ ARRASTA O PDF */}
            <div
              className={`${s.zona} ${arrasta === 'pdf' ? s.on : ''} ${pdf ? s.tem : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setArrasta('pdf');
              }}
              onDragLeave={() => setArrasta(null)}
              onDrop={(e) => {
                e.preventDefault();
                setArrasta(null);
                const f = e.dataTransfer.files?.[0];
                if (f) setPdf(f);
              }}
              onClick={() => refPdf.current?.click()}
              role="button"
              tabIndex={0}
            >
              <span className={s.zIc}>
                <Icon n={pdf ? 'ok' : 'doc'} s={22} strokeWidth={pdf ? 2.6 : 1.75} />
              </span>
              <div>
                <strong>{pdf ? pdf.name : 'Arraste o PDF do processo'}</strong>
                <small>
                  {pdf ? `${mb(pdf)} MB — pronto` : 'Os autos inteiros. Pode ser grande.'}
                </small>
              </div>
              {pdf ? (
                <button
                  className={s.tirar}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdf(null);
                  }}
                  aria-label="Remover"
                >
                  <Icon n="x" s={15} strokeWidth={2.4} />
                </button>
              ) : null}
            </div>
            <input
              ref={refPdf}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPdf(f);
              }}
            />

            {/* ⬆️ ARRASTA O VÍDEO — 3 GB, e o computador aguenta */}
            <div
              className={`${s.zona} ${arrasta === 'video' ? s.on : ''} ${video ? s.tem : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setArrasta('video');
              }}
              onDragLeave={() => setArrasta(null)}
              onDrop={(e) => {
                e.preventDefault();
                setArrasta(null);
                const f = e.dataTransfer.files?.[0];
                if (f) setVideo(f);
              }}
              onClick={() => refVid.current?.click()}
              role="button"
              tabIndex={0}
            >
              <span className={s.zIc}>
                <Icon n={video ? 'ok' : 'subir'} s={22} strokeWidth={video ? 2.6 : 1.75} />
              </span>
              <div>
                <strong>
                  {video ? video.name : 'Arraste o vídeo ou áudio da audiência'}
                </strong>
                <small>
                  {video
                    ? `${mb(video)} MB — pronto`
                    : 'PJe, e-SAJ, MP4, MP3… até 3 GB. Opcional.'}
                </small>
              </div>
              {video ? (
                <button
                  className={s.tirar}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideo(null);
                  }}
                  aria-label="Remover"
                >
                  <Icon n="x" s={15} strokeWidth={2.4} />
                </button>
              ) : null}
            </div>
            <input
              ref={refVid}
              type="file"
              accept="video/*,audio/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setVideo(f);
              }}
            />

            {ocupado ? (
              <div className={s.barra}>
                <i style={{ width: `${progresso || 12}%` }} />
                <span>Subindo… não feche esta aba até terminar.</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="card">
          <div className="card-h">
            <h2>
              <span className={s.passo}>02</span>
              A peça e o réu
            </h2>
          </div>
          <div className="card-b">
            <label className="fld">
              <span>Processo (CNJ) · opcional</span>
              <input
                value={cnj}
                onChange={(e) => setCnj(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
                disabled={ocupado}
              />
            </label>

            <label className="fld">
              <span>Réu(s) que você representa</span>
              <input
                value={reus}
                onChange={(e) => setReus(e.target.value)}
                placeholder="Ex.: João da Silva (separe por vírgula)"
                disabled={ocupado}
              />
              <small className={s.dica}>A peça defende apenas o(s) réu(s) informado(s).</small>
            </label>

            <div className="fld">
              <span>Tipo de peça</span>
              <div className={s.pecas}>
                {PECAS.map((p) => (
                  <button
                    key={p.id}
                    className={`${s.pc} ${peca === p.id ? s.pcOn : ''}`}
                    onClick={() => setPeca(p.id)}
                    disabled={ocupado}
                  >
                    <i className={s.radio} />
                    <div>
                      <strong>{p.nome}</strong>
                      <small>{p.oQue}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn b-tech full"
              onClick={() => setGastar('FINAISJUS')}
              disabled={ocupado || !pdf || !reus.trim()}
            >
              {ocupado ? (
                <>
                  <span className="spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Icon n="ia" s={18} strokeWidth={2.1} />
                  Gerar a peça
                  <span className={s.bp}>
                    <Token n={80_000} claro mini />
                  </span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      <Gastar
        chave={gastar}
        saldo={saldo}
        onConfirmar={() => void gerar()}
        onCancelar={() => setGastar(null)}
        onRecarregar={() => {
          setGastar(null);
          router.push('/tokens');
        }}
      />
    </>
  );
}
