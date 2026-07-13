'use client';

import { useEffect, useRef, useState } from 'react';
import { sosc, ApiError } from '@/lib/api';
import { imprimirHTML, copiarRico, baixarDoc, hoje } from '@/lib/nativo';
import Icon from '@/components/Icon';
import { Gratis } from '@/components/Token';
import s from './editor.module.css';

interface Template { kind?: string; title?: string; body?: string }
interface Cliente { id: string; fullName?: string; cpf?: string }
interface Adv { nome: string; oab: string; escritorio: string; endereco: string; logo: string }

type Kind = 'PROCURACAO' | 'HONORARIOS';

/** ⚠️ As variáveis REAIS que o backend substitui. */
const VARS: Array<{ v: string; oQue: string }> = [
  { v: '{{cliente_nome}}', oQue: 'Nome do cliente' },
  { v: '{{cliente_cpf}}', oQue: 'CPF do cliente' },
  { v: '{{cliente_endereco}}', oQue: 'Endereço do cliente' },
  { v: '{{advogado_nome}}', oQue: 'Seu nome' },
  { v: '{{advogado_oab}}', oQue: 'Sua OAB' },
  { v: '{{escritorio_endereco}}', oQue: 'Endereço do escritório' },
  { v: '{{valor_honorarios}}', oQue: 'Valor total' },
  { v: '{{valor_parcela}}', oQue: 'Valor da parcela' },
  { v: '{{parcelas}}', oQue: 'Nº de parcelas' },
  { v: '{{cidade}}', oQue: 'Cidade' },
  { v: '{{data}}', oQue: 'Data de hoje' },
];

const MODELO: Record<Kind, { titulo: string; corpo: string }> = {
  PROCURACAO: {
    titulo: 'Procuração Ad Judicia',
    corpo: `<h1>Procuração Ad Judicia et Extra</h1>

<p><b>OUTORGANTE:</b> {{cliente_nome}}, inscrito(a) no CPF sob o nº {{cliente_cpf}}, residente e domiciliado(a) em {{cliente_endereco}}.</p>

<p><b>OUTORGADO:</b> {{advogado_nome}}, advogado(a) inscrito(a) na OAB sob o nº {{advogado_oab}}, com escritório em {{escritorio_endereco}}, onde recebe intimações.</p>

<p><b>PODERES:</b> Pelo presente instrumento, o outorgante nomeia e constitui seu bastante procurador o outorgado acima qualificado, a quem confere os poderes da cláusula <i>ad judicia et extra</i>, para o foro em geral, em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo nas contrárias, seguindo umas e outras até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, agindo em conjunto ou separadamente, podendo ainda substabelecer esta a outrem, com ou sem reservas de iguais poderes, para agir em conjunto ou separadamente com o substabelecido.</p>

<p class="local-data">{{cidade}}, {{data}}.</p>

<div class="assina">
  <hr>
  <p>{{cliente_nome}}</p>
  <p>CPF {{cliente_cpf}}</p>
</div>`,
  },
  HONORARIOS: {
    titulo: 'Contrato de Honorários Advocatícios',
    corpo: `<h1>Contrato de Prestação de Serviços Advocatícios</h1>

<p><b>CONTRATANTE:</b> {{cliente_nome}}, inscrito(a) no CPF sob o nº {{cliente_cpf}}, residente e domiciliado(a) em {{cliente_endereco}}.</p>

<p><b>CONTRATADO:</b> {{advogado_nome}}, advogado(a) inscrito(a) na OAB sob o nº {{advogado_oab}}, com escritório em {{escritorio_endereco}}.</p>

<h2>Cláusula 1ª — Do objeto</h2>
<p>O CONTRATADO prestará ao CONTRATANTE serviços de assistência e representação jurídica, compreendendo o acompanhamento processual, a elaboração de peças e a defesa de seus interesses perante os órgãos do Poder Judiciário e demais instâncias administrativas.</p>

<h2>Cláusula 2ª — Dos honorários</h2>
<p>Pelos serviços contratados, o CONTRATANTE pagará ao CONTRATADO a quantia de R$ {{valor_honorarios}}, a ser paga em {{parcelas}} parcela(s) de R$ {{valor_parcela}}.</p>

<h2>Cláusula 3ª — Dos honorários de sucumbência</h2>
<p>Os honorários de sucumbência, quando fixados judicialmente, pertencem ao CONTRATADO, nos termos do artigo 23 da Lei nº 8.906/94, não se compensando com os honorários contratuais ora ajustados.</p>

<h2>Cláusula 4ª — Das despesas</h2>
<p>As custas judiciais, emolumentos, diligências e demais despesas processuais correrão por conta do CONTRATANTE, e não estão incluídas nos honorários acima pactuados.</p>

<h2>Cláusula 5ª — Da rescisão</h2>
<p>A revogação do mandato ou a renúncia não desobriga o CONTRATANTE do pagamento dos honorários proporcionais aos serviços já prestados até a data do desligamento.</p>

<p class="local-data">{{cidade}}, {{data}}.</p>

<div class="assina">
  <hr>
  <p>{{cliente_nome}} — Contratante</p>
</div>

<div class="assina">
  <hr>
  <p>{{advogado_nome}} — OAB {{advogado_oab}}</p>
</div>`,
  },
};

export default function Editor({
  procuracao,
  honorarios,
  clientes,
  advogado,
}: {
  procuracao: Template | null;
  honorarios: Template | null;
  clientes: Cliente[];
  advogado: Adv;
}) {
  const [kind, setKind] = useState<Kind>('HONORARIOS');
  const [titulo, setTitulo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [previa, setPrevia] = useState<Cliente | null>(null);

  const area = useRef<HTMLDivElement>(null);

  /** Carrega o template salvo — ou o modelo pronto. */
  useEffect(() => {
    const t = kind === 'PROCURACAO' ? procuracao : honorarios;
    const m = MODELO[kind];
    setTitulo(t?.title ?? m.titulo);
    if (area.current) area.current.innerHTML = t?.body ?? m.corpo;
    setOk('');
    setErro('');
  }, [kind, procuracao, honorarios]);

  /* ═══ 🖊️ O EDITOR RICO — nativo do navegador ═══ */
  function cmd(c: string, v?: string) {
    document.execCommand(c, false, v);
    area.current?.focus();
  }

  /** Insere a variável onde o cursor está. */
  function inserirVar(v: string) {
    area.current?.focus();
    document.execCommand('insertText', false, v);
  }

  async function salvar() {
    const body = area.current?.innerHTML ?? '';
    if (body.length < 10) {
      setErro('O documento está vazio.');
      return;
    }
    setOcupado(true);
    setErro('');
    setOk('');
    try {
      await sosc.put('/documents', { kind, title: titulo.trim(), body });
      setOk('Modelo salvo. Ele será usado nos próximos documentos.');
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar.');
    } finally {
      setOcupado(false);
    }
  }

  function restaurar() {
    const m = MODELO[kind];
    setTitulo(m.titulo);
    if (area.current) area.current.innerHTML = m.corpo;
    setOk('Modelo original restaurado. Salve para confirmar.');
  }

  /** Preenche as variáveis com um cliente, para ver como fica. */
  function preencher(html: string, c: Cliente | null) {
    const d = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return html
      .replace(/\{\{cliente_nome\}\}/g, c?.fullName ?? '_________________________')
      .replace(/\{\{cliente_cpf\}\}/g, c?.cpf ?? '___.___.___-__')
      .replace(/\{\{cliente_endereco\}\}/g, '_____________________________')
      .replace(/\{\{advogado_nome\}\}/g, advogado.nome)
      .replace(/\{\{advogado_oab\}\}/g, advogado.oab)
      .replace(/\{\{escritorio_endereco\}\}/g, advogado.endereco || '_______________')
      .replace(/\{\{valor_honorarios\}\}/g, '__________')
      .replace(/\{\{valor_parcela\}\}/g, '__________')
      .replace(/\{\{parcelas\}\}/g, '___')
      .replace(/\{\{cidade\}\}/g, 'Belo Horizonte')
      .replace(/\{\{data\}\}/g, d);
  }

  /* ═══ 🖨️ IMPRIMIR — com a logo dele ═══ */
  function imprimir() {
    const corpo = preencher(area.current?.innerHTML ?? '', previa);
    const logo = advogado.logo
      ? `<img src="${advogado.logo}" class="logo" alt="">`
      : '';
    imprimirHTML(titulo, logo + corpo);
  }

  /* ═══ 📋 COPIAR — cola no Word JÁ FORMATADO ═══ */
  async function copiar() {
    const html = preencher(area.current?.innerHTML ?? '', previa);
    const texto = area.current?.innerText ?? '';
    const feito = await copiarRico(html, preencher(texto, previa));
    setOk(feito ? 'Copiado. Cole no Word — vem formatado.' : 'Não foi possível copiar.');
  }

  /* ═══ 📝 BAIXAR .DOC ═══ */
  function baixar() {
    const html = preencher(area.current?.innerHTML ?? '', previa);
    const logo = advogado.logo ? `<img src="${advogado.logo}" style="max-height:70px;display:block;margin:0 auto 20pt">` : '';
    baixarDoc(`${kind === 'PROCURACAO' ? 'procuracao' : 'contrato'}-${hoje()}`, titulo, logo + html);
  }

  return (
    <>
      <header className={s.topo}>
        <div className={s.abas}>
          <button
            className={`${s.aba} ${kind === 'HONORARIOS' ? s.on : ''}`}
            onClick={() => setKind('HONORARIOS')}
          >
            <Icon n="dinheiro" s={17} />
            Contrato de Honorários
          </button>
          <button
            className={`${s.aba} ${kind === 'PROCURACAO' ? s.on : ''}`}
            onClick={() => setKind('PROCURACAO')}
          >
            <Icon n="doc" s={17} />
            Procuração
          </button>
        </div>

        <Gratis texto="Grátis" />
      </header>

      {/* ⚠️ O ARGUMENTO — por que ele edita à vontade */}
      <div className="nota gold">
        <Icon n="editar" s={19} />
        <p>
          <b>O modelo é seu.</b> Edite à vontade — troque as cláusulas, mude a redação,
          escreva do seu jeito. O advogado tem método próprio, e o sistema não vai
          impor o dele. Salve, e ele vira o seu padrão.
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
        {/* ─── O EDITOR ─── */}
        <section className="card">
          <div className="card-h">
            <input
              className={s.titulo}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do documento"
            />
          </div>

          {/* 🖊️ A BARRA — nativo do navegador, zero biblioteca */}
          <div className={s.barra}>
            <button onClick={() => cmd('bold')} title="Negrito (Ctrl+B)">
              <b>B</b>
            </button>
            <button onClick={() => cmd('italic')} title="Itálico (Ctrl+I)">
              <i>I</i>
            </button>
            <button onClick={() => cmd('underline')} title="Sublinhado (Ctrl+U)">
              <u>U</u>
            </button>
            <span className={s.sep} />
            <button onClick={() => cmd('formatBlock', 'h2')} title="Título de cláusula">
              H2
            </button>
            <button onClick={() => cmd('formatBlock', 'p')} title="Parágrafo">
              ¶
            </button>
            <span className={s.sep} />
            <button onClick={() => cmd('insertUnorderedList')} title="Lista">
              <Icon n="menu" s={15} strokeWidth={2.2} />
            </button>
            <button onClick={() => cmd('insertOrderedList')} title="Lista numerada">
              1.
            </button>
            <span className={s.sep} />
            <button onClick={() => cmd('justifyLeft')} title="Esquerda">
              ⇤
            </button>
            <button onClick={() => cmd('justifyFull')} title="Justificado">
              ≡
            </button>
            <span className={s.sep} />
            <button onClick={() => cmd('undo')} title="Desfazer (Ctrl+Z)">
              ↶
            </button>
            <button onClick={() => cmd('redo')} title="Refazer">
              ↷
            </button>
          </div>

          {/* ⚠️ contentEditable — o navegador JÁ SABE editar texto rico */}
          <div
            ref={area}
            className={s.area}
            contentEditable
            suppressContentEditableWarning
            spellCheck
          />
        </section>

        {/* ─── AS FERRAMENTAS ─── */}
        <aside className={s.lado}>
          {/* AS VARIÁVEIS */}
          <section className="card">
            <div className="card-h">
              <h2>
                <Icon n="link" s={17} />
                Variáveis
              </h2>
            </div>
            <div className="card-b">
              <p className={s.vTxt}>
                Clique para inserir. Elas viram os dados reais quando você gerar o
                documento para um cliente.
              </p>
              <div className={s.vars}>
                {VARS.map((v) => (
                  <button key={v.v} onClick={() => inserirVar(v.v)} title={v.oQue}>
                    {v.v.replace(/[{}]/g, '')}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* A PRÉVIA COM UM CLIENTE */}
          {clientes.length > 0 ? (
            <section className="card">
              <div className="card-h">
                <h2>
                  <Icon n="olho" s={17} />
                  Ver com um cliente
                </h2>
              </div>
              <div className="card-b">
                <label className="fld" style={{ marginBottom: 0 }}>
                  <select
                    value={previa?.id ?? ''}
                    onChange={(e) =>
                      setPrevia(clientes.find((c) => c.id === e.target.value) ?? null)
                    }
                  >
                    <option value="">Sem cliente (variáveis em branco)</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          ) : null}

          {/* 💻 O QUE SÓ O COMPUTADOR FAZ */}
          <section className={`card ${s.nativo}`}>
            <div className="card-h">
              <h2>
                <Icon n="monitor" s={17} />
                Levar para fora
              </h2>
            </div>
            <div className="card-b">
              <button className="btn b-ghost full" onClick={imprimir}>
                <Icon n="doc" s={16} />
                Imprimir · salvar em PDF
              </button>
              <button className="btn b-ghost full" onClick={() => void copiar()}>
                <Icon n="copiar" s={16} />
                Copiar formatado (cola no Word)
              </button>
              <button className="btn b-ghost full" onClick={baixar}>
                <Icon n="baixar" s={16} />
                Baixar .doc
              </button>
              <p className={s.nTxt}>
                O documento sai com <b>a sua logo</b> e as variáveis já preenchidas.
              </p>
            </div>
          </section>

          {/* SALVAR */}
          <div className={s.salvar}>
            <button className="btn b-ghost" onClick={restaurar} disabled={ocupado}>
              <Icon n="sync" s={16} />
              Modelo original
            </button>
            <button className="btn b-gold" onClick={() => void salvar()} disabled={ocupado}>
              {ocupado ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
              Salvar meu modelo
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
