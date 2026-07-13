'use client';

/**
 * ⚙️ O ESCRITÓRIO — OAB, logo e PIX.
 *
 * ⚠️ A LOGO É USADA EM TUDO: contrato, procuração, relatório, peça.
 *    Ele sobe uma vez, e ela aparece em todo documento que sair daqui.
 *
 * 💻 E aqui o computador brilha: ARRASTA O ARQUIVO. No celular ele teria
 *    que caçar na galeria.
 */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import Icon from '@/components/Icon';
import { Gratis } from '@/components/Token';
import s from './escritorio.module.css';

const MAX = 2 * 1024 * 1024; // 2 MB

export default function Escritorio({
  nome,
  oab,
  escritorio,
  logo,
  pix,
  banco,
  titular,
}: {
  nome: string;
  oab: string;
  escritorio: string;
  logo: string;
  pix: string;
  banco: string;
  titular: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  const [nomeEsc, setNomeEsc] = useState(escritorio);
  const [novaLogo, setNovaLogo] = useState('');
  const [arrastando, setArrastando] = useState(false);

  const [chave, setChave] = useState(pix);
  const [nomeBanco, setNomeBanco] = useState(banco);
  const [nomeTit, setNomeTit] = useState(titular);

  const [ocupado, setOcupado] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');

  /* 🖼️ A LOGO — arrasta e solta */
  async function subirLogo(f: File) {
    if (f.size > MAX) {
      setErro('A imagem passa de 2 MB.');
      return;
    }
    setOcupado('logo');
    setErro('');
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(new Error('falhou'));
        r.readAsDataURL(f);
      });
      setNovaLogo(b64);

      await sosc.put('/lawyers/me/logo', {
        logoBase64: b64.split(',')[1],
        mimeType: f.type,
      });
      setOk('Logo salva. Ela vai em todo documento que sair daqui.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível subir a logo.');
    } finally {
      setOcupado('');
    }
  }

  async function salvarNome() {
    setOcupado('nome');
    setErro('');
    try {
      await sosc.put('/lawyers/me/office-name', { officeName: nomeEsc.trim() });
      setOk('Nome do escritório salvo.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar.');
    } finally {
      setOcupado('');
    }
  }

  async function salvarPix() {
    setOcupado('pix');
    setErro('');
    try {
      await sosc.put('/honorarios/bank-account', {
        pixKey: chave.trim(),
        bankName: nomeBanco.trim() || undefined,
        holderName: nomeTit.trim() || undefined,
      });
      setOk('Chave PIX salva. Ela vai junto nas cobranças.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar.');
    } finally {
      setOcupado('');
    }
  }

  const verLogo = novaLogo || logo;

  return (
    <>
      <header className={s.topo}>
        <div>
          <h1>Meu Escritório</h1>
          <p>
            Sua identidade nos documentos. A logo vai no contrato, na procuração, no
            relatório e na peça — você sobe uma vez.
          </p>
        </div>
        <Gratis texto="Grátis" />
      </header>

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

      <div className={s.grade}>
        {/* ─── QUEM VOCÊ É ─── */}
        <section className="card">
          <div className="card-h">
            <h2>
              <Icon n="oab" s={18} />
              Sua OAB
            </h2>
          </div>
          <div className="card-b">
            <dl className={s.eu}>
              <div>
                <dt>Nome</dt>
                <dd>{nome}</dd>
              </div>
              <div>
                <dt>OAB</dt>
                <dd className="num">{oab || '—'}</dd>
              </div>
            </dl>
            <p className={s.nota}>
              Vem do seu cadastro no aplicativo. Para mudar, use o app.
            </p>

            <label className="fld" style={{ marginTop: 18, marginBottom: 12 }}>
              <span>Nome do escritório</span>
              <input
                value={nomeEsc}
                onChange={(e) => setNomeEsc(e.target.value)}
                placeholder="Ex.: GP Advocacia"
                disabled={ocupado === 'nome'}
              />
            </label>
            <button
              className="btn b-gold full"
              onClick={() => void salvarNome()}
              disabled={ocupado === 'nome'}
            >
              {ocupado === 'nome' ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
              Salvar
            </button>
          </div>
        </section>

        {/* ─── 🖼️ A LOGO — arrasta e solta ─── */}
        <section className="card">
          <div className="card-h">
            <h2>
              <Icon n="logo" s={18} />
              Minha logomarca
            </h2>
          </div>
          <div className="card-b">
            <div
              className={`${s.zona} ${arrastando ? s.on : ''} ${verLogo ? s.tem : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void subirLogo(f);
              }}
              onClick={() => input.current?.click()}
              role="button"
              tabIndex={0}
            >
              {ocupado === 'logo' ? (
                <span className="spin" />
              ) : verLogo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={verLogo} alt="" />
                  <span className={s.trocar}>
                    <Icon n="sync" s={14} />
                    Trocar
                  </span>
                </>
              ) : (
                <>
                  <Icon n="subir" s={30} />
                  <strong>Arraste a logo aqui</strong>
                  <small>PNG com fundo transparente · até 2 MB</small>
                </>
              )}
            </div>

            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void subirLogo(f);
              }}
            />

            <p className={s.nota}>
              Ela aparece no <b>contrato</b>, na <b>procuração</b>, no <b>relatório</b>{' '}
              e na <b>peça</b>. Prefira PNG com fundo transparente.
            </p>
          </div>
        </section>

        {/* ─── 💰 O PIX ─── */}
        <section className={`card ${s.pix}`}>
          <div className="card-h">
            <h2>
              <Icon n="pix" s={18} />
              Chave PIX
            </h2>
          </div>
          <div className="card-b">
            <p className={s.pTxt}>
              Ela vai junto na mensagem de cobrança — o cliente abre o WhatsApp e paga
              na hora, sem você mandar dado bancário à parte.
            </p>

            <label className="fld">
              <span>Chave PIX</span>
              <input
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                placeholder="CPF, CNPJ, e-mail, telefone ou aleatória"
                disabled={ocupado === 'pix'}
              />
            </label>

            <div className={s.dois}>
              <label className="fld">
                <span>Banco · opcional</span>
                <input
                  value={nomeBanco}
                  onChange={(e) => setNomeBanco(e.target.value)}
                  placeholder="Ex.: Itaú"
                  disabled={ocupado === 'pix'}
                />
              </label>
              <label className="fld">
                <span>Titular · opcional</span>
                <input
                  value={nomeTit}
                  onChange={(e) => setNomeTit(e.target.value)}
                  placeholder="Nome do titular"
                  disabled={ocupado === 'pix'}
                />
              </label>
            </div>

            <button
              className="btn b-money full"
              onClick={() => void salvarPix()}
              disabled={ocupado === 'pix' || !chave.trim()}
            >
              {ocupado === 'pix' ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
              Salvar chave PIX
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
