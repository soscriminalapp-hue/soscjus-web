'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📱 JURISCREATOR — MELHOR NO CELULAR. E a estação DIZ isso.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ NÃO É FERRAMENTA DE ESCRITÓRIO. É FERRAMENTA DE INSTAGRAM.
 *
 *  O advogado:
 *    1. Pesquisa a jurisprudência  →  20 segundos
 *    2. Sai o criativo + a legenda
 *    3. POSTA
 *
 *  No computador ele teria que:
 *    baixar → mandar pro celular → abrir o Instagram → postar
 *
 *  No celular: gera → COMPARTILHA DIRETO. Três toques.
 *
 *  ⚠️ Mas a estação NÃO BLOQUEIA. Ela avisa e deixa ele usar.
 *     Bloquear seria arrogância. Avisar é respeito.
 */

import { useState } from 'react';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS ,
  fmt,
} from '@/lib/creditos';
import Cabecalho from '@/components/Cabecalho';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';
import OndeUsar from '@/components/OndeUsar';
import Compra from '@/components/Compra';
import s from './juriscreator.module.css';

const FORMATOS = [
  { id: 'feed', rotulo: 'Feed 4:5', dica: 'O post do perfil' },
  { id: 'story', rotulo: 'Story 9:16', dica: 'Some em 24h' },
] as const;

const MODELOS = [
  { id: 'jornal', rotulo: 'Jornal SOSC JUS', dica: 'Manchete de jornal' },
  { id: 'informativo', rotulo: 'Informativo', dica: 'Sóbrio, explicativo' },
  { id: 'materia', rotulo: 'Matéria', dica: 'Como reportagem' },
  { id: 'destaque', rotulo: 'Destaque', dica: 'Uma frase forte' },
  { id: 'aleatorio', rotulo: 'Aleatório', dica: 'Ele escolhe' },
] as const;

export default function JurisCreator() {
  const [tema, setTema] = useState('');
  const [formato, setFormato] = useState<string>('feed');
  const [modelo, setModelo] = useState<string>('jornal');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [res, setRes] = useState<{
    imagemUrl?: string;
    legenda?: string;
    fonte?: string;
  } | null>(null);
  const [comprar, setComprar] = useState<string | null>(null);

  const custo = PRECOS.JURISCREATOR.tokens;

  async function gerar() {
    if (tema.trim().length < 5) {
      setErro('Escreva o tema da decisão — pelo menos 5 letras.');
      return;
    }
    setOcupado(true);
    setErro('');
    setRes(null);
    try {
      const r = await sosc.post<typeof res>('/juriscreator/gerar', {
        tema: tema.trim(),
        formato,
        modelo,
      });
      setRes(r);
    } catch (e) {
      if (e instanceof ApiError && e.semCota) {
        setComprar('CREDITOS');
      } else {
        setErro(
          e instanceof ApiError ? e.message : 'Não foi possível gerar. Tente de novo.',
        );
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <Cabecalho
        eyebrow="Jurisprudência + Criativo"
        titulo="JurisCreator"
        destaque="IA"
        tom="mind"
        texto="Escreva o tema da decisão. Ele acha a jurisprudência e monta o post — com a legenda pronta."
      />

      {/* ⚠️ A HONESTIDADE — e ele não bloqueia. Avisa. */}
      <div className={s.aviso}>
        <OndeUsar
          onde="celular"
          motivo="Você gera e POSTA no Instagram na hora — três toques. Aqui você teria que baixar, mandar pro celular e abrir o app."
        />
        <a
          href="https://apps.apple.com/br/app/sosc-jus/id6770715490"
          target="_blank"
          rel="noopener noreferrer"
          className={s.abrirApp}
        >
          <Icon n="apple" s={17} />
          Abrir no celular
          <Icon n="externo" s={13} strokeWidth={2.2} />
        </a>
      </div>

      <div className={s.grade}>
        {/* ─── O FORMULÁRIO ─── */}
        <div className={s.painel}>
          <label className="fld">
            <span>O tema da decisão</span>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex.: ingresso em domicílio sem mandado"
              rows={3}
              disabled={ocupado}
            />
            <em className={s.dica}>
              Escreva o tema que você quer transformar em criativo.
            </em>
          </label>

          <div className={s.bloco}>
            <span className={s.rotulo}>Formato</span>
            <div className={s.opcoes}>
              {FORMATOS.map((f) => (
                <button
                  key={f.id}
                  className={`${s.opc} ${formato === f.id ? s.opcOn : ''}`}
                  onClick={() => setFormato(f.id)}
                  disabled={ocupado}
                >
                  <strong>{f.rotulo}</strong>
                  <small>{f.dica}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={s.bloco}>
            <span className={s.rotulo}>Modelo visual</span>
            <div className={s.modelos}>
              {MODELOS.map((m) => (
                <button
                  key={m.id}
                  className={`${s.mod} ${modelo === m.id ? s.modOn : ''}`}
                  onClick={() => setModelo(m.id)}
                  disabled={ocupado}
                >
                  <span className={s.bolinha} />
                  <div>
                    <strong>{m.rotulo}</strong>
                    <small>{m.dica}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {erro ? (
            <div className={s.erro}>
              <Icon n="alerta" s={17} />
              <span>{erro}</span>
            </div>
          ) : null}

          {/* ⚠️ O BOTÃO GASTA. NÃO COMPRA. */}
          <button
            className="btn b-mind full"
            onClick={() => void gerar()}
            disabled={ocupado}
          >
            {ocupado ? (
              <>
                <span className="spin" />
                Procurando a jurisprudência…
              </>
            ) : (
              <>
                <Icon n="ia" s={19} strokeWidth={2.1} />
                Gerar criativo
                <span className={s.btnPreco}>
                  <Diamante s={15} />
                  {custo}
                </span>
              </>
            )}
          </button>
        </div>

        {/* ─── O RESULTADO ─── */}
        <div className={s.saida}>
          {res ? (
            <>
              {res.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={res.imagemUrl} alt="O criativo" className={s.imagem} />
              ) : null}

              {res.legenda ? (
                <div className={s.legenda}>
                  <header>
                    <strong>A legenda</strong>
                    <button
                      className="btn b-ghost sm"
                      onClick={() => void navigator.clipboard.writeText(res.legenda!)}
                    >
                      <Icon n="copiar" s={15} strokeWidth={2.2} />
                      Copiar
                    </button>
                  </header>
                  <p>{res.legenda}</p>
                </div>
              ) : null}

              {res.fonte ? (
                <p className={s.fonte}>
                  <Icon n="balanca" s={14} />
                  {res.fonte}
                </p>
              ) : null}

              <div className={s.acoes}>
                {res.imagemUrl ? (
                  <a href={res.imagemUrl} download className="btn b-ghost">
                    <Icon n="download" s={17} strokeWidth={2.1} />
                    Baixar a imagem
                  </a>
                ) : null}
              </div>

              {/* ⚠️ A verdade, de novo — e agora ela DÓI. */}
              <div className="nota tech">
                <Icon n="celular" s={19} />
                <p>
                  <b>No celular você já teria postado.</b> Aqui você vai baixar,
                  mandar pro seu telefone, abrir o Instagram e subir. No app é{' '}
                  <b>um toque em Compartilhar</b>.
                </p>
              </div>
            </>
          ) : (
            <div className={s.vazio}>
              <Icon n="ia" s={40} />
              <strong>O criativo aparece aqui</strong>
              <p>
                Escreva o tema, escolha o formato e o modelo. Em uns 20 segundos ele
                acha a decisão e monta o post.
              </p>
            </div>
          )}
        </div>
      </div>

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void gerar();
        }}
      />
    </>
  );
}
