'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  O MOTOR DAS CONSULTAS — um só, para as cinco
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Todas seguem o mesmo ritual:
 *    1. explica O QUE ELA FAZ  (não "relatório já vem junto")
 *    2. mostra o preço ANTES do clique
 *    3. o campo
 *    4. o botão → confirma se for caro → chama a rota → mostra o resultado
 *
 *  ⚠️ O PREÇO APARECE ANTES DO CLIQUE. Sempre.
 *
 *     A variação é de 26× (3.000 no relatório até 80.000 no FinaisJus). Se ele
 *     clica sem saber e queima 20.000, ele não pensa "que legal" — pensa
 *     "esse app me roubou". (E o CDC art. 6º, III concorda com ele.)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS, type Feature } from '@/lib/creditos';
import Icon, { type Nome } from './Icon';
import Token, { Gratis } from './Token';
import Gastar from './Gastar';
import s from './consulta.module.css';

export interface Campo {
  id: string;
  rotulo: string;
  placeholder?: string;
  tipo?: 'texto' | 'cpf' | 'placa' | 'cnj';
  opcional?: boolean;
  dica?: string;
}

export default function Consulta({
  feature,
  icone,
  cor,
  titulo,
  oQueE,
  nacional,
  campos,
  rota,
  recebe,
  saldo,
  gratis,
  aviso,
}: {
  /** null = grátis (Analisar Print). */
  feature: Feature | null;
  icone: Nome;
  cor: 'gold' | 'risk' | 'mind' | 'tech' | 'lime';
  titulo: string;
  /** ⚠️ O QUE ELA FAZ. Não "relatório já vem junto". */
  oQueE: string;
  /** 🇧🇷 varre o Brasil inteiro */
  nacional?: boolean;
  campos: Campo[];
  rota: string;
  /** O que ele recebe — a tela grande PERMITE explicar. Use isso. */
  recebe?: Array<{ titulo: string; texto: string }>;
  saldo: number;
  gratis?: boolean;
  aviso?: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const [gastar, setGastar] = useState<Feature | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [res, setRes] = useState<Record<string, unknown> | null>(null);

  const f = feature ? PRECOS[feature] : null;

  function limpo(id: string, tipo?: string) {
    const x = (v[id] ?? '').trim();
    return tipo === 'cpf' || tipo === 'cnj' ? x.replace(/\D/g, '') : x;
  }

  const preenchido = campos.some((c) => !c.opcional && limpo(c.id, c.tipo).length > 0);

  async function executar() {
    setGastar(null);
    setOcupado(true);
    setErro('');
    setRes(null);
    try {
      const body: Record<string, string> = {};
      for (const c of campos) {
        const x = limpo(c.id, c.tipo);
        if (x) body[c.id] = x;
      }
      const r = await sosc.post<Record<string, unknown>>(rota, body);
      setRes(r);
      router.refresh(); // o saldo caiu
    } catch (e) {
      // ═══ 402 = SEM TOKEN. A ferramenta não é vendida — o TOKEN é. ═══
      if (e instanceof ApiError && (e as { status?: number }).status === 402) {
        router.push('/tokens');
        return;
      }
      setErro(e instanceof ApiError ? e.message : 'A consulta falhou. Tente de novo.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <header className={s.topo}>
        <span className={`${s.ic} ${s[cor]}`}>
          <Icon n={icone} s={26} />
        </span>

        <div>
          {/* 🇧🇷 A BANDEIRINHA VALORIZA — "isso varre o Brasil inteiro" */}
          {nacional ? (
            <span className={s.br}>
              <span>🇧🇷</span> CONSULTA NACIONAL
            </span>
          ) : null}
          <h1>{titulo}</h1>
          {/* ⚠️ O QUE ELA FAZ */}
          <p>{oQueE}</p>
        </div>

        <div className={s.preco}>
          {gratis || !f ? <Gratis texto="Grátis, sempre" /> : <Token n={f.tokens} saldo={saldo} />}
        </div>
      </header>

      <div className={s.duas}>
        {/* ─── O FORMULÁRIO ─── */}
        <section className="card">
          <div className="card-b">
            {campos.map((c) => (
              <label key={c.id} className="fld">
                <span>
                  {c.rotulo}
                  {c.opcional ? <em className={s.opc}> · opcional</em> : null}
                </span>
                <input
                  value={v[c.id] ?? ''}
                  onChange={(e) => setV({ ...v, [c.id]: e.target.value })}
                  placeholder={c.placeholder}
                  disabled={ocupado}
                />
                {c.dica ? <small className={s.dica}>{c.dica}</small> : null}
              </label>
            ))}

            {erro ? (
              <div className={s.erro}>
                <Icon n="alerta" s={17} />
                <span>{erro}</span>
              </div>
            ) : null}

            <button
              className={`btn ${gratis ? 'b-lime' : cor === 'risk' ? 'b-risk' : 'b-gold'} full`}
              onClick={() => (gratis || !feature ? void executar() : setGastar(feature))}
              disabled={ocupado || !preenchido}
            >
              {ocupado ? (
                <>
                  <span className="spin" />
                  Consultando…
                </>
              ) : (
                <>
                  <Icon n="busca" s={18} strokeWidth={2.1} />
                  {gratis ? 'Analisar' : 'Consultar'}
                  {f ? (
                    <span className={s.bp}>
                      <Token n={f.tokens} claro mini />
                    </span>
                  ) : null}
                </>
              )}
            </button>

            {aviso ? <p className={s.aviso}>{aviso}</p> : null}
          </div>
        </section>

        {/* ─── O QUE ELE RECEBE — a tela grande PERMITE explicar ─── */}
        {recebe && recebe.length > 0 ? (
          <aside className={`card ${s.recebe}`}>
            <div className="card-h">
              <h2>
                <Icon n="ok" s={17} strokeWidth={2.4} />
                O que você recebe
              </h2>
            </div>
            <div className="card-b">
              <ul>
                {recebe.map((r, i) => (
                  <li key={i}>
                    <strong>{r.titulo}</strong>
                    <span>{r.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>

      {/* ─── O RESULTADO ─── */}
      {res ? (
        <section className={`card ${s.res}`}>
          <div className="card-h">
            <h2>
              <Icon n="doc" s={18} />
              O resultado
            </h2>
          </div>
          <div className="card-b">
            <pre className={s.json}>{JSON.stringify(res, null, 2)}</pre>
          </div>
        </section>
      ) : null}

      <Gastar
        chave={gastar}
        saldo={saldo}
        onConfirmar={() => void executar()}
        onCancelar={() => setGastar(null)}
        onRecarregar={() => {
          setGastar(null);
          router.push('/tokens');
        }}
      />
    </>
  );
}
