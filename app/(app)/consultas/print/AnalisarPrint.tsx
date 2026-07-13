'use client';

/**
 * 📸 ANALISAR / VERIFICAR PRINT — GRÁTIS. SEMPRE.
 *
 * ⚠️ Detecta indícios de manipulação (EXIF, XMP, ELA) e sela a prova com
 *    hash SHA-256 + carimbo de tempo RFC 3161.
 *
 * ⚠️ 📱 MELHOR NO CELULAR — o print ESTÁ no celular dele. Aqui ele teria que
 *    mandar pro computador primeiro. Mas não bloqueamos: avisamos.
 *    Bloquear seria arrogância. Avisar é respeito.
 */

import { useRef, useState } from 'react';
import { sosc, ApiError } from '@/lib/api';
import Icon from '@/components/Icon';
import { Gratis } from '@/components/Token';
import s from './print.module.css';

const MAX = 12 * 1024 * 1024; // 12 MB

export default function AnalisarPrint({ saldo }: { saldo: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [arq, setArq] = useState<File | null>(null);
  const [previa, setPrevia] = useState('');
  const [contexto, setContexto] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [arrastando, setArrastando] = useState(false);

  function escolher(f: File) {
    if (f.size > MAX) {
      setErro('A imagem passa de 12 MB.');
      return;
    }
    setErro('');
    setArq(f);
    setRes(null);
    const r = new FileReader();
    r.onload = () => setPrevia(String(r.result));
    r.readAsDataURL(f);
  }

  async function analisar() {
    if (!arq) return;
    setOcupado(true);
    setErro('');
    setRes(null);
    try {
      const b64 = await new Promise<string>((ok, no) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result).split(',')[1]);
        r.onerror = () => no(new Error('leitura falhou'));
        r.readAsDataURL(arq);
      });

      // ⚠️ /prova/analisar — NÃO é /print/analisar
      const r = await sosc.post<Record<string, unknown>>('/processos/prova/analisar', {
        imagemBase64: b64,
        mediaType: arq.type || 'image/jpeg',
        contexto: contexto.trim() || undefined,
      });
      setRes(r);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'A análise falhou. Tente de novo.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <header className={s.topo}>
        <span className={s.ic}>
          <Icon n="print" s={26} />
        </span>
        <div>
          <h1>Analisar / Verificar Print</h1>
          <p>
            Print e gravação de tela: indícios de manipulação e cadeia de custódia.
            Sai com o laudo em PDF, hash SHA-256 e carimbo de tempo.
          </p>
        </div>
        <Gratis texto="Grátis, sempre" />
      </header>

      {/* 📱 A HONESTIDADE — avisa, mas não bloqueia */}
      <div className="nota tech">
        <Icon n="celular" s={19} />
        <p>
          <b>Melhor no celular.</b> O print está lá — aqui você teria que mandar pro
          computador primeiro. Mas se já está aqui, pode usar à vontade.
        </p>
      </div>

      <div className={s.duas}>
        <section className="card">
          <div className="card-b">
            {/* ⬆️ ARRASTA E SOLTA — o computador permite isso */}
            <div
              className={`${s.zona} ${arrastando ? s.on : ''} ${previa ? s.temArq : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                const f = e.dataTransfer.files?.[0];
                if (f) escolher(f);
              }}
              onClick={() => input.current?.click()}
              role="button"
              tabIndex={0}
            >
              {previa ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previa} alt="" className={s.previa} />
                  <span className={s.trocar}>
                    <Icon n="sync" s={15} />
                    Trocar imagem
                  </span>
                </>
              ) : (
                <>
                  <Icon n="subir" s={32} />
                  <strong>Arraste o print aqui</strong>
                  <small>ou clique para escolher · PNG, JPG · até 12 MB</small>
                </>
              )}
            </div>

            <input
              ref={input}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) escolher(f);
              }}
            />

            <label className="fld" style={{ marginTop: 18 }}>
              <span>Contexto · opcional</span>
              <textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Ex.: print de conversa enviado pela parte contrária."
                rows={2}
                disabled={ocupado}
              />
            </label>

            {erro ? (
              <div className={s.erro}>
                <Icon n="alerta" s={17} />
                <span>{erro}</span>
              </div>
            ) : null}

            <button
              className="btn b-lime full"
              onClick={() => void analisar()}
              disabled={ocupado || !arq}
            >
              {ocupado ? (
                <>
                  <span className="spin" />
                  Analisando…
                </>
              ) : (
                <>
                  <Icon n="escudo" s={18} strokeWidth={2.1} />
                  Analisar e gerar laudo
                </>
              )}
            </button>
          </div>
        </section>

        <aside className={`card ${s.recebe}`}>
          <div className="card-h">
            <h2>
              <Icon n="ok" s={17} strokeWidth={2.4} />
              O que você recebe
            </h2>
          </div>
          <div className="card-b">
            <ul>
              <li>
                <strong>Indícios de manipulação</strong>
                <span>EXIF, XMP e ELA — se a imagem foi editada, aparece.</span>
              </li>
              <li>
                <strong>Cadeia de custódia</strong>
                <span>Hash SHA-256 e carimbo de tempo RFC 3161.</span>
              </li>
              <li>
                <strong>O laudo em PDF</strong>
                <span>Pronto para juntar aos autos.</span>
              </li>
              <li>
                <strong>E é grátis</strong>
                <span>Sempre foi. É o nosso próprio selo — conferir não custa nada.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {res ? (
        <section className={`card ${s.res}`}>
          <div className="card-h">
            <h2>
              <Icon n="doc" s={18} />O laudo
            </h2>
          </div>
          <div className="card-b">
            <pre className={s.json}>{JSON.stringify(res, null, 2)}</pre>
          </div>
        </section>
      ) : null}
    </>
  );
}
