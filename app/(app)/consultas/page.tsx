'use client';

/**
 * Consultas — as cinco.
 *
 * O 402 é o ponto central: quando a cota acaba, o backend responde 402 e a
 * tela abre o QR. A web NUNCA cobra. E quando o celular confirma, a consulta
 * roda SOZINHA — o advogado não precisa voltar e clicar de novo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS, LIMIAR_CONFIRMACAO, type Feature } from '@/lib/creditos';
import Cabecalho from '@/components/Cabecalho';
import Icon, { type Nome } from '@/components/Icon';
import Compra from '@/components/Compra';
import Preco, { Gratis } from '@/components/Preco';
import Gastar from '@/components/Gastar';
import s from './consultas.module.css';

type Id = 'processo' | 'mandado' | 'cpf' | 'veiculo' | 'print';

interface Ferramenta {
  id: Id;
  nome: string;
  icone: Nome;
  cor: 'jur' | 'risco' | 'tech';
  /** A frase. Sem jargão. */
  explica: string;
  campo: string;
  dica: string;
  mono?: boolean;
  /** Segundo campo (nome completo, no mandado). */
  campo2?: string;
  dica2?: string;
  /** Aceita foto (placa, print). */
  foto?: 'placa' | 'print';
  /** Feature paga. null = 🟢 GRÁTIS. */
  feature: Feature | null;
}

const FERRAMENTAS: Ferramenta[] = [
  {
    id: 'processo',
    nome: 'Buscar Processos',
    icone: 'balanca',
    cor: 'jur',
    explica:
      'Digite o CPF de uma pessoa e veja todos os processos dela no Brasil inteiro. Serve também para CNPJ ou para o número do processo.',
    campo: 'CPF, CNPJ ou número do processo',
    dica: '000.000.000-00',
    mono: true,
    feature: 'CONSULTA_PROCESSUAL',
  },
  {
    id: 'mandado',
    nome: 'Mandado de Prisão',
    icone: 'alerta',
    cor: 'risco',
    explica:
      'Veja se existe mandado de prisão em aberto contra alguém. Consulta o banco nacional e as bases dos estados. O resultado vale para a data e a hora da consulta, e sai com comprovante.',
    campo: 'CPF',
    dica: '000.000.000-00',
    mono: true,
    campo2: 'Nome completo',
    dica2: 'Como está no documento',
    feature: 'CONSULTA_MANDADO',
  },
  {
    id: 'cpf',
    nome: 'Consultar CPF',
    icone: 'busca',
    cor: 'jur',
    explica:
      'Ficha completa e antecedentes criminais. Você pode buscar pelo CPF, pelo celular, pelo e-mail ou só pelo nome — o sistema tenta os caminhos até achar.',
    campo: 'CPF, celular, e-mail ou nome',
    dica: '000.000.000-00',
    feature: 'CONSULTA_CADASTRAL',
  },
  {
    id: 'veiculo',
    nome: 'Consultar Veículo',
    icone: 'carro',
    cor: 'risco',
    explica:
      'Digite a placa ou anexe uma foto dela. Mostra o modelo, o ano, o valor na tabela FIPE, o dono e se tem restrição — roubo, furto ou financiamento.',
    campo: 'Placa',
    dica: 'ABC1D23',
    mono: true,
    foto: 'placa',
    feature: 'PENTE_FINO_VEICULO',
  },
  {
    id: 'print',
    nome: 'Analisar Print',
    icone: 'print',
    cor: 'tech',
    explica:
      'O cliente mandou um print de conversa? Antes de juntar no processo, confira aqui. O sistema procura sinais de montagem — recorte, letra trocada, horário que não bate — e transcreve o que está escrito.',
    campo: 'Sobre o que é (opcional)',
    dica: 'Ex.: conversa entre a vítima e o réu',
    foto: 'print',
    feature: null, // 🟢 GRÁTIS
  },
];

/* ── Cotas ── */
interface Cotas {
  processo?: { restante: number | null; cota: number | null };
  cpf?: { restante: number | null; cota: number | null };
  ilimitado?: boolean;
}

function rotulo(c?: { restante: number | null; cota: number | null }, ilim?: boolean) {
  if (ilim || !c || c.cota == null) return { t: 'Sem limite', tom: 'free' as const };
  const r = c.restante ?? 0;
  if (r <= 0) return { t: `Acabou — 0 de ${c.cota}`, tom: 'stop' as const };
  if (r <= Math.max(1, Math.ceil(c.cota * 0.3)))
    return { t: `Sobrou ${r} de ${c.cota}`, tom: 'warn' as const };
  return { t: `Sobraram ${r} de ${c.cota}`, tom: 'ok' as const };
}

export default function Consultas() {
  const params = useSearchParams();
  const inicial = (params.get('f') as Id) ?? 'processo';

  const [sel, setSel] = useState<Id>(
    FERRAMENTAS.some((f) => f.id === inicial) ? inicial : 'processo',
  );
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [lendoFoto, setLendoFoto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [comprar, setComprar] = useState<string | null>(null);
  const [cotas, setCotas] = useState<Cotas>({});

  const f = FERRAMENTAS.find((x) => x.id === sel)!;
  const refazer = useRef<(() => void) | null>(null);

  /* ── carrega cotas ── */
  const lerCotas = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        sosc.get<{ restante: number | null; cota: number | null; ilimitado?: boolean }>(
          '/processos/consulta/cota',
        ),
        sosc.get<{
          cadastral?: { restante: number | null; cota: number | null };
          ilimitado?: boolean;
        }>('/processos/cpf/cotas'),
      ]);
      setCotas({
        processo: { restante: p.restante, cota: p.cota },
        cpf: c.cadastral,
        ilimitado: p.ilimitado || c.ilimitado,
      });
    } catch {
      /* não bloqueia a tela */
    }
  }, []);

  useEffect(() => {
    void lerCotas();
  }, [lerCotas]);

  function trocar(id: Id) {
    setSel(id);
    setV1('');
    setV2('');
    setFoto(null);
    setRes(null);
    setErro('');
  }

  /* ── leitura de placa / print ── */
  async function lerImagem(file: File) {
    setFoto(file);
    setLendoFoto(true);
    setErro('');
    setRes(null);
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

      if (f.foto === 'placa') {
        const r = await sosc.post<{ placa?: string; confianca?: number; motivo?: string }>(
          '/processos/veiculo/ler-placa',
          { imagemBase64: b64, mediaType },
        );
        if (!r.placa) {
          setErro(
            r.motivo ??
              'Não deu para ler a placa com segurança. Chegue mais perto, evite o reflexo e tire outra foto. É melhor não preencher do que preencher errado.',
          );
        } else {
          setV1(r.placa);
        }
      }
      // O print é enviado junto na própria consulta.
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível ler a imagem.');
    } finally {
      setLendoFoto(false);
    }
  }

  /* ── executa ── */
  const executar = useCallback(async () => {
    if (f.id !== 'print' && !v1.trim()) {
      setErro('Preencha o campo antes de consultar.');
      return;
    }
    if (f.id === 'mandado' && !v2.trim()) {
      setErro('Preencha o nome completo. Sem ele a busca não cruza nas bases.');
      return;
    }

    setOcupado(true);
    setErro('');
    setRes(null);

    try {
      let r: unknown;
      const so = v1.replace(/\D/g, '');

      if (f.id === 'processo') {
        r = await sosc.post('/processos/consulta', {
          tipo: so.length === 20 ? 'cnj' : 'cpf',
          valor: v1.trim(),
        });
      } else if (f.id === 'mandado') {
        r = await sosc.post('/processos/mandado/consulta', {
          cpf: so,
          nome: v2.trim(),
        });
      } else if (f.id === 'cpf') {
        const tipo = /@/.test(v1)
          ? 'email'
          : so.length === 11
            ? 'cpf'
            : so.length >= 10
              ? 'celular'
              : 'nome';
        r = await sosc.post('/processos/cpf/buscar', {
          termo: v1.trim(),
          tipo,
          [tipo]: v1.trim(),
        });
      } else if (f.id === 'veiculo') {
        r = await sosc.post('/processos/veiculo/consultar', {
          placa: v1.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
        });
      } else {
        // print
        if (!foto) {
          setErro('Anexe o print antes de analisar.');
          setOcupado(false);
          return;
        }
        const b64 = await new Promise<string>((ok) => {
          const rd = new FileReader();
          rd.onload = () => ok(String(rd.result).split(',')[1] ?? '');
          rd.readAsDataURL(foto);
        });
        r = await sosc.post('/processos/prova/analisar', {
          imagemBase64: b64,
          mediaType: foto.type || 'image/jpeg',
          contexto: v1.trim() || undefined,
        });
      }

      setRes(r as Record<string, unknown>);
      void lerCotas();
    } catch (e) {
      // ═══ O 402: a cota acabou. A web NÃO cobra. ═══
      if (e instanceof ApiError && e.semCota) {
        refazer.current = () => void executar();
        setComprar(f.feature);
      } else {
        setErro(
          e instanceof ApiError ? e.message : 'A consulta falhou. Tente de novo.',
        );
      }
    } finally {
      setOcupado(false);
    }
  }, [f, v1, v2, foto, lerCotas]);

  const cot = f.id === 'processo' ? cotas.processo : f.id === 'cpf' ? cotas.cpf : undefined;
  const rot = rotulo(cot, cotas.ilimitado);

  return (
    <>
      <Cabecalho
        eyebrow="Bases nacionais"
        titulo="Fazer uma"
        destaque="Consulta"
        texto="As senhas dos fornecedores ficam no servidor. Você manda o dado, recebe o resultado."
      />

      <div className={s.grade}>
        {/* ─── seletor ─── */}
        <nav className={s.lista}>
          {FERRAMENTAS.map((x) => {
            const c = x.id === 'processo' ? cotas.processo : x.id === 'cpf' ? cotas.cpf : undefined;
            const r = rotulo(c, cotas.ilimitado);
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
                  <strong>{x.nome}</strong>
                  {c ? <small className={s[r.tom]}>{r.t}</small> : null}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ─── formulário ─── */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-b" style={{ padding: 30 }}>
            <h2 className={s.tit}>{f.nome}</h2>
            <p className={s.explica}>{f.explica}</p>

            {cot ? (
              <span className={`est ${rot.tom}`} style={{ marginBottom: 22 }}>
                {rot.tom === 'ok' ? <Icon n="ok" s={14} strokeWidth={2.4} /> : null}
                {rot.tom === 'warn' ? <Icon n="alerta" s={14} strokeWidth={2.4} /> : null}
                {rot.tom === 'stop' ? <Icon n="x" s={14} strokeWidth={2.4} /> : null}
                {rot.t}
              </span>
            ) : null}

            {/* foto (placa ou print) */}
            {f.foto ? (
              <label className={`${s.foto} ${foto ? s.fotoCheia : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  capture={f.foto === 'placa' ? 'environment' : undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void lerImagem(file);
                  }}
                  disabled={ocupado || lendoFoto}
                />
                {lendoFoto ? (
                  <>
                    <span className="spin" />
                    <b>Lendo a imagem…</b>
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
                      {f.foto === 'placa' ? 'Tirar foto da placa' : 'Anexar o print'}
                    </b>
                    <small>
                      {f.foto === 'placa'
                        ? 'Pelo celular abre a câmera. O sistema lê e você confere antes de buscar.'
                        : 'O original, sem editar. Editar apaga as marcas que denunciam a montagem.'}
                    </small>
                  </>
                )}
              </label>
            ) : null}

            <label className="fld">
              <span>{f.campo}</span>
              <input
                className={f.mono ? 'mono' : ''}
                value={v1}
                onChange={(e) =>
                  setV1(f.id === 'veiculo' ? e.target.value.toUpperCase().slice(0, 8) : e.target.value)
                }
                placeholder={f.dica}
                disabled={ocupado}
              />
            </label>

            {f.campo2 ? (
              <label className="fld">
                <span>{f.campo2}</span>
                <input
                  value={v2}
                  onChange={(e) => setV2(e.target.value)}
                  placeholder={f.dica2}
                  disabled={ocupado}
                />
              </label>
            ) : null}

            {erro ? (
              <div className={s.erro} role="alert">
                <Icon n="alerta" s={18} />
                <span>{erro}</span>
              </div>
            ) : null}

            <button
              className={`btn ${f.cor === 'risco' ? 'b-risk' : f.cor === 'tech' ? 'b-tech' : 'b-gold'} full`}
              onClick={() => void executar()}
              disabled={ocupado || lendoFoto}
              style={{ padding: 15 }}
            >
              {ocupado ? (
                <>
                  <span className="spin" />
                  Consultando…
                </>
              ) : (
                <>
                  <Icon n={f.id === 'print' ? 'print' : 'busca'} s={19} strokeWidth={2.1} />
                  {f.id === 'print' ? 'Analisar' : 'Consultar'}
                </>
              )}
            </button>

            {/* resultado cru — cada consulta tem um formato */}
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
              Consulta protegida. As senhas dos fornecedores nunca passam pelo seu
              navegador.
            </p>
          </div>
        </div>
      </div>

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void lerCotas();
          // DESTRAVA SOZINHA: refaz a consulta que estava pendente.
          refazer.current?.();
        }}
      />
    </>
  );
}
