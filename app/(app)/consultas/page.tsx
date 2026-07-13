'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  AS CONSULTAS — idênticas ao aplicativo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ OS NOMES SÃO OS MESMOS DO APP. NÃO INVENTE.
 *
 *    ❌ "Buscar Processos"      → parece que busca NOS processos DELE
 *    ✅ "Consulta Processual SOSC" → é o PENTE-FINO: até 200 processos de
 *                                    uma pessoa, no Brasil inteiro
 *
 *  ⚠️ AS DESCRIÇÕES TAMBÉM. Copiadas do app, palavra por palavra.
 *
 *  🇧🇷 A BANDEIRINHA aparece nas consultas NACIONAIS — como no app.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ O BOTÃO NÃO COMPRA. O BOTÃO GASTA.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Ele já tem token. Clicar aqui DEBITA do saldo — não abre loja.
 *  Sem saldo → 402 → aí sim manda comprar token.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS, LIMIAR_CONFIRMACAO, type Feature ,
  fmt,
} from '@/lib/creditos';
import Cabecalho from '@/components/Cabecalho';
import Icon, { type Nome } from '@/components/Icon';
import Diamante from '@/components/Diamante';
import { Gratis } from '@/components/Preco';
import Gastar from '@/components/Gastar';
import Compra from '@/components/Compra';
import s from './consultas.module.css';

type Id = 'processual' | 'mandado' | 'cpf' | 'veiculo' | 'print';

interface Campo {
  chave: string;
  rotulo: string;
  dica: string;
  mono?: boolean;
  opcional?: boolean;
}

interface Ferramenta {
  id: Id;
  /** ⚠️ O NOME DO APP. Não invente outro. */
  nome: string;
  icone: Nome;
  cor: 'jur' | 'risco' | 'tech' | 'mente';
  /** 🇧🇷 Consulta nacional. */
  nacional?: boolean;
  /** A frase de capa — do app. */
  chamada: string;
  /** A explicação — do app. */
  explica: string;
  campos: Campo[];
  /** null = 🟢 GRÁTIS */
  feature: Feature | null;
  /** era pago e virou grátis → mostra o riscado */
  eraRS?: string;
  foto?: 'placa' | 'print';
  /** O que ele recebe — do app. */
  recebe?: Array<[string, string]>;
  botao: string;
}

const FERRAMENTAS: Ferramenta[] = [
  {
    id: 'processual',
    nome: 'Consulta Processual SOSC',
    icone: 'balanca',
    cor: 'jur',
    nacional: true,
    chamada: 'Pente-Fino SOSC',
    explica:
      'Uma varredura rigorosa de toda a vida processual do cliente — até 200 processos numa única busca por CPF/CNPJ. Não é uma busca casual: use quando quiser mapear tudo o que existe em nome da pessoa.',
    campos: [
      {
        chave: 'valor',
        rotulo: 'CPF, CNPJ ou número do processo',
        dica: '000.000.000-00',
        mono: true,
      },
    ],
    feature: 'CONSULTA_PROCESSUAL',
    recebe: [
      ['⚖️', 'Até 200 processos, em qualquer tribunal do Brasil'],
      ['📋', 'A capa de cada um: classe, assunto, vara, valor'],
      ['📅', 'As movimentações — e os prazos e audiências que saem delas'],
      ['🔗', 'Vincule aos seus processos com um clique'],
    ],
    botao: 'Fazer pente-fino',
  },
  {
    id: 'mandado',
    nome: 'Consultar Mandado',
    icone: 'alerta',
    cor: 'risco',
    nacional: true,
    chamada: 'Mandado de Prisão',
    explica:
      'Consulta o Banco Nacional de Mandados de Prisão (BNMP/CNJ) por CPF. Sai com relatório em PDF.',
    campos: [
      { chave: 'cpf', rotulo: 'CPF', dica: 'Só números', mono: true },
      { chave: 'nome', rotulo: 'Nome completo', dica: 'Nome da pessoa' },
      {
        chave: 'nomeMae',
        rotulo: 'Nome da mãe',
        dica: 'Refina o resultado',
        opcional: true,
      },
    ],
    feature: 'CONSULTA_MANDADO',
    recebe: [
      ['🚨', 'Se existe mandado em aberto — e qual'],
      ['📄', 'O comprovante oficial em PDF'],
      ['⚖️', 'O processo de origem do mandado'],
      ['🔄', 'Se é recaptura'],
    ],
    botao: 'Consultar mandado + relatório',
  },
  {
    id: 'cpf',
    nome: 'Consultar CPF',
    icone: 'busca',
    cor: 'jur',
    chamada: 'Consulta completa',
    explica:
      'Ficha cadastral + antecedentes criminais + mandado de prisão, em um relatório único. Busque pelo que você tiver: nome, CPF, celular ou e-mail.',
    campos: [
      { chave: 'nome', rotulo: 'Nome completo', dica: 'Nome da pessoa', opcional: true },
      { chave: 'cpf', rotulo: 'CPF', dica: 'Só números', mono: true, opcional: true },
      { chave: 'celular', rotulo: 'Celular', dica: '(00) 00000-0000', mono: true, opcional: true },
      { chave: 'email', rotulo: 'E-mail', dica: 'pessoa@email.com', opcional: true },
    ],
    feature: 'CONSULTA_CADASTRAL',
    recebe: [
      ['👤', 'Ficha cadastral: nome, nascimento, mãe, endereços, telefones'],
      ['⚖️', 'Antecedentes criminais'],
      ['🚨', 'Mandado de prisão (BNMP/CNJ)'],
      ['📄', 'Tudo num relatório único'],
    ],
    botao: 'Consulta completa',
  },
  {
    id: 'veiculo',
    nome: 'Consultar Veículo',
    icone: 'carro',
    cor: 'mente',
    chamada: 'Pente-fino do veículo',
    explica:
      'Pela placa — digitada ou fotografada — o SOSC JUS faz o pente-fino do veículo em fonte oficial.',
    campos: [{ chave: 'placa', rotulo: 'Placa do veículo', dica: 'ABC1D23', mono: true }],
    feature: 'PENTE_FINO_VEICULO',
    foto: 'placa',
    recebe: [
      ['🔴', 'Restrições: RENAJUD (penhora judicial) · roubo e furto · Receita Federal · leilão · infrações (RENAINF) · comunicado de venda · recall · pendência de emissão · chassi remarcado'],
      ['💰', 'Valor de mercado: tabela FIPE, com o mês de referência'],
      ['👤', 'Proprietário'],
      ['🚗', 'O veículo: marca, modelo, ano, cor, combustível'],
      ['🔧', 'Identificação e técnico: chassi, motor, potência, eixos'],
      ['📄', 'Documentação: ano do exercício · emissão do CRLV e do CRV'],
    ],
    botao: 'Pente-fino + relatório',
  },
  {
    id: 'print',
    nome: 'Analisar / Verificar Print',
    icone: 'print',
    cor: 'tech',
    chamada: 'Análise técnica · selo · cadeia',
    explica:
      'Anexe um print ou uma gravação de tela — sua ou de terceiro. O motor detecta corte de vídeo, rastro de editor e metadados que não batem.',
    campos: [
      {
        chave: 'contexto',
        rotulo: 'Sobre o que é',
        dica: 'Ex.: conversa entre a vítima e o réu',
        opcional: true,
      },
    ],
    /* 🟢 GRÁTIS — era R$ 9,90 */
    feature: null,
    eraRS: '9,90',
    foto: 'print',
    recebe: [
      ['🔍', 'Indícios de manipulação: metadados · rastro de editor (Photoshop, CapCut…) · data de criação × modificação · corte no vídeo · análise visual (fonte, alinhamento, elementos impossíveis)'],
      ['🔗', 'Cadeia de custódia: se este arquivo já passou pelo SOSC JUS, mostramos quem registrou, quando e onde — e se foi alterado entre um registro e outro'],
      ['🖋️', 'Selo de integridade: hash SHA-256 · carimbo de tempo · GPS do registro'],
      ['📄', 'Laudo em PDF, pronto pra juntar no processo'],
    ],
    botao: 'Analisar + laudo',
  },
];

export default function Consultas() {
  const params = useSearchParams();
  const inicial = (params.get('f') as Id) ?? 'processual';

  const [sel, setSel] = useState<Id>(
    FERRAMENTAS.some((f) => f.id === inicial) ? inicial : 'processual',
  );
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [foto, setFoto] = useState<File | null>(null);
  const [lendoFoto, setLendoFoto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [confirmar, setConfirmar] = useState<Feature | null>(null);
  const [comprar, setComprar] = useState<string | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [ilimitado, setIlimitado] = useState(false);

  const f = FERRAMENTAS.find((x) => x.id === sel)!;
  const refazer = useRef<(() => void) | null>(null);

  const lerSaldo = useCallback(async () => {
    try {
      const r = await sosc.get<{
        saldo?: { total?: number | null; ilimitado?: boolean };
      }>('/creditos/saldo');
      setIlimitado(Boolean(r.saldo?.ilimitado));
      setSaldo(r.saldo?.total ?? 0);
    } catch {
      /* não bloqueia */
    }
  }, []);

  useEffect(() => {
    void lerSaldo();
  }, [lerSaldo]);

  function trocar(id: Id) {
    setSel(id);
    setCampos({});
    setFoto(null);
    setRes(null);
    setErro('');
  }

  /* ─── leitura de placa ─── */
  async function lerImagem(file: File) {
    setFoto(file);
    setErro('');
    setRes(null);
    if (f.foto !== 'placa') return;

    setLendoFoto(true);
    try {
      const b64 = await new Promise<string>((ok, no) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result).split(',')[1] ?? '');
        r.onerror = () => no(new Error('Não foi possível ler a imagem.'));
        r.readAsDataURL(file);
      });
      const mediaType = ['image/png', 'image/webp'].includes(file.type)
        ? file.type
        : 'image/jpeg';

      const r = await sosc.post<{ placa?: string; motivo?: string }>(
        '/processos/veiculo/ler-placa',
        { imagemBase64: b64, mediaType },
      );
      if (!r.placa) {
        setErro(
          r.motivo ??
            'Não deu para ler a placa com segurança. Chegue mais perto, evite o reflexo e tire outra foto.',
        );
      } else {
        setCampos((c) => ({ ...c, placa: r.placa! }));
      }
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível ler a imagem.');
    } finally {
      setLendoFoto(false);
    }
  }

  /* ─── EXECUTA — o botão GASTA, não compra ─── */
  const executar = useCallback(
    async (pular?: boolean) => {
      const custo = f.feature ? PRECOS[f.feature].tokens : 0;

      // ═══ FLUIDEZ NO BARATO. TRANSPARÊNCIA NO CARO. ═══
      if (f.feature && !pular && custo > LIMIAR_CONFIRMACAO && !ilimitado) {
        setConfirmar(f.feature);
        return;
      }
      setConfirmar(null);
      setOcupado(true);
      setErro('');
      setRes(null);

      try {
        let r: unknown;

        if (f.id === 'processual') {
          const v = (campos.valor ?? '').trim();
          const so = v.replace(/\D/g, '');
          if (!v) throw new ApiError(400, 'Digite o CPF, CNPJ ou o número do processo.');
          r = await sosc.post('/processos/consulta', {
            tipo: so.length === 20 ? 'cnj' : 'cpf',
            valor: v,
          });
        } else if (f.id === 'mandado') {
          if (!campos.cpf || !campos.nome) {
            throw new ApiError(400, 'Preencha o CPF e o nome completo.');
          }
          r = await sosc.post('/processos/mandado/consulta', {
            cpf: campos.cpf.replace(/\D/g, ''),
            nome: campos.nome.trim(),
            nomeMae: campos.nomeMae?.trim() || undefined,
          });
        } else if (f.id === 'cpf') {
          const tem = ['nome', 'cpf', 'celular', 'email'].some((k) =>
            (campos[k] ?? '').trim(),
          );
          if (!tem) throw new ApiError(400, 'Preencha ao menos um campo.');
          r = await sosc.post('/processos/cpf/buscar', {
            nome: campos.nome?.trim() || undefined,
            cpf: campos.cpf?.replace(/\D/g, '') || undefined,
            celular: campos.celular?.replace(/\D/g, '') || undefined,
            email: campos.email?.trim() || undefined,
          });
        } else if (f.id === 'veiculo') {
          const placa = (campos.placa ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          if (!placa) throw new ApiError(400, 'Digite a placa ou anexe a foto dela.');
          r = await sosc.post('/processos/veiculo/consultar', { placa });
        } else {
          if (!foto) throw new ApiError(400, 'Anexe o print ou o vídeo.');
          const b64 = await new Promise<string>((ok) => {
            const rd = new FileReader();
            rd.onload = () => ok(String(rd.result).split(',')[1] ?? '');
            rd.readAsDataURL(foto);
          });
          // ⚠️ /prova/analisar — NÃO é /print/analisar
          r = await sosc.post('/processos/prova/analisar', {
            imagemBase64: b64,
            mediaType: foto.type || 'image/jpeg',
            contexto: campos.contexto?.trim() || undefined,
          });
        }

        setRes(r as Record<string, unknown>);
        if (f.feature) await lerSaldo(); // o saldo caiu
      } catch (e) {
        // ═══ 402 = SEM TOKEN. A ferramenta não é vendida — o TOKEN é. ═══
        if (e instanceof ApiError && e.semCota) {
          refazer.current = () => void executar(true);
          setComprar('CREDITOS');
        } else {
          setErro(e instanceof ApiError ? e.message : 'A consulta falhou. Tente de novo.');
        }
      } finally {
        setOcupado(false);
      }
    },
    [f, campos, foto, ilimitado, lerSaldo],
  );

  const custo = f.feature ? PRECOS[f.feature].tokens : 0;
  const da = ilimitado || !f.feature || saldo >= custo;

  return (
    <>
      <Cabecalho
        eyebrow="Bases nacionais · fonte oficial"
        titulo="Consultar"
        destaque="alguém"
        texto="As senhas dos fornecedores ficam no servidor. Você manda o dado, recebe o resultado."
      />

      <div className={s.grade}>
        {/* ─── O SELETOR ─── */}
        <nav className={s.lista}>
          {FERRAMENTAS.map((x) => {
            const c = x.feature ? PRECOS[x.feature].tokens : 0;
            return (
              <button
                key={x.id}
                className={`${s.item} ${s[x.cor]} ${sel === x.id ? s.itemOn : ''}`}
                onClick={() => trocar(x.id)}
              >
                <span className={s.ic}>
                  <Icon n={x.icone} s={22} />
                </span>
                <span className={s.rot}>
                  <strong>
                    {x.nacional ? <em className={s.br}>🇧🇷</em> : null}
                    {x.nome}
                  </strong>
                  {x.feature ? (
                    <small className={s.preco}>
                      <Diamante s={12} />
                      {c}
                    </small>
                  ) : (
                    <small className={s.gratisRow}>
                      {x.eraRS ? <span className={s.riscado}>R$ {x.eraRS}</span> : null}
                      <Gratis />
                    </small>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ─── O FORMULÁRIO ─── */}
        <div className={s.painel}>
          <header className={s.pTopo}>
            {f.nacional ? (
              <span className={s.selo}>
                <Icon n="alerta" s={13} strokeWidth={2.4} />
                🇧🇷 CONSULTA NACIONAL
              </span>
            ) : null}
            <h2>{f.chamada}</h2>
            <p>{f.explica}</p>
          </header>

          <div className={s.pCorpo}>
            {/* foto (placa ou print) */}
            {f.foto ? (
              <label className={`${s.foto} ${foto ? s.fotoCheia : ''}`}>
                <input
                  type="file"
                  accept={f.foto === 'print' ? 'image/*,video/*' : 'image/*'}
                  capture={f.foto === 'placa' ? 'environment' : undefined}
                  onChange={(e) => {
                    const x = e.target.files?.[0];
                    if (x) void lerImagem(x);
                  }}
                  disabled={ocupado || lendoFoto}
                />
                {lendoFoto ? (
                  <>
                    <span className="spin" />
                    <b>Lendo a placa…</b>
                  </>
                ) : foto ? (
                  <>
                    <Icon n="ok" s={22} />
                    <b>{foto.name}</b>
                    <small>Toque para trocar</small>
                  </>
                ) : (
                  <>
                    <Icon n="subir" s={22} />
                    <b>
                      {f.foto === 'placa'
                        ? 'Fotografar a placa'
                        : 'Anexar print ou vídeo'}
                    </b>
                    <small>
                      {f.foto === 'placa'
                        ? 'Fotografe de frente, a até 2 metros, sem sombra sobre ela.'
                        : 'captura de tela · gravação de tela'}
                    </small>
                  </>
                )}
              </label>
            ) : null}

            {/* os campos */}
            <div className={f.campos.length > 2 ? s.f2 : ''}>
              {f.campos.map((c) => (
                <label key={c.chave} className="fld">
                  <span>
                    {c.rotulo}
                    {c.opcional ? <em className={s.opc}> (opcional)</em> : null}
                  </span>
                  <input
                    className={c.mono ? 'mono' : ''}
                    value={campos[c.chave] ?? ''}
                    onChange={(e) =>
                      setCampos((v) => ({
                        ...v,
                        [c.chave]:
                          c.chave === 'placa'
                            ? e.target.value.toUpperCase().slice(0, 8)
                            : e.target.value,
                      }))
                    }
                    placeholder={c.dica}
                    disabled={ocupado}
                  />
                </label>
              ))}
            </div>

            {erro ? (
              <div className={s.erro} role="alert">
                <Icon n="alerta" s={18} />
                <span>{erro}</span>
              </div>
            ) : null}

            {/* ⚠️ O BOTÃO GASTA. NÃO COMPRA. */}
            <button
              className={`btn ${f.cor === 'risco' ? 'b-risk' : f.cor === 'tech' ? 'b-tech' : f.cor === 'mente' ? 'b-mind' : 'b-gold'} full ${s.acao}`}
              onClick={() => void executar()}
              disabled={ocupado || lendoFoto}
            >
              {ocupado ? (
                <>
                  <span className="spin" />
                  Consultando…
                </>
              ) : (
                <>
                  <Icon n={f.icone} s={19} strokeWidth={2.1} />
                  {f.botao}
                  {f.feature ? (
                    <span className={s.btnPreco}>
                      <Diamante s={15} />
                      {custo}
                    </span>
                  ) : (
                    <span className={s.btnGratis}>
                      {f.eraRS ? <span className={s.riscadoBtn}>R$ {f.eraRS}</span> : null}
                      Grátis
                    </span>
                  )}
                </>
              )}
            </button>

            {!da ? (
              <p className={s.semSaldo}>
                <Icon n="alerta" s={14} />
                Faltam {custo - saldo} tokens.{' '}
                <button onClick={() => setComprar('CREDITOS')}>Comprar</button>
              </p>
            ) : null}

            {/* ─── O QUE VOCÊ RECEBE — do app ─── */}
            {f.recebe ? (
              <div className={s.recebe}>
                <h3>
                  O que você recebe
                  {f.feature ? (
                    <span className={s.rPreco}>
                      <Diamante s={14} />
                      {custo}
                    </span>
                  ) : null}
                </h3>
                <ul>
                  {f.recebe.map(([e, t], i) => (
                    <li key={i}>
                      <span className={s.emoji}>{e}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* o resultado */}
            {res ? (
              <div className={s.res}>
                <div className={s.resH}>
                  <Icon n="escudo" s={19} />
                  <strong>Resultado</strong>
                </div>
                <pre>{JSON.stringify(res, null, 2)}</pre>
              </div>
            ) : null}

            <p className={s.seguro}>
              <Icon n="lock" s={14} />
              Consulta em fonte oficial. As senhas dos fornecedores nunca passam pelo
              seu navegador.
            </p>
          </div>
        </div>
      </div>

      <Gastar
        chave={confirmar}
        saldo={saldo}
        onConfirmar={() => void executar(true)}
        onCancelar={() => setConfirmar(null)}
        onRecarregar={() => {
          setConfirmar(null);
          setComprar('CREDITOS');
        }}
      />

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void lerSaldo();
          refazer.current?.();
        }}
      />
    </>
  );
}
