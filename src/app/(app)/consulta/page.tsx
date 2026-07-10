'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ConsultaResponse } from '@/lib/types';
import { ConsultaEstado } from '@/components/ConsultaEstado';

export default function ConsultaPage() {
  const [tipo, setTipo] = useState<'cnj' | 'cpf'>('cnj');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<ConsultaResponse | null>(null);

  async function consultar() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await api.consultaProcessual(tipo, valor);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/dashboard" className="text-sm text-texto-sec hover:text-dourado">
        ← Início
      </Link>
      <h1 className="text-2xl font-semibold mt-4">Consulta Processual SOSC</h1>
      <p className="text-texto-sec mt-1 mb-6">
        Pesquise por número CNJ ou por CPF da parte. Traz capa e movimentações.
      </p>

      <div className="rounded-2xl border border-linha bg-preto-card p-6 max-w-xl">
        <div className="mb-4">
          <label className="block text-xs text-texto-sec mb-1.5">Tipo de busca</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'cnj' | 'cpf')}
            className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2.5 text-sm outline-none focus:border-dourado"
          >
            <option value="cnj">Número do processo (CNJ)</option>
            <option value="cpf">CPF da parte</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-texto-sec mb-1.5">
            {tipo === 'cnj' ? 'Número CNJ' : 'CPF da parte'}
          </label>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={tipo === 'cnj' ? '0000000-00.0000.0.00.0000' : '000.000.000-00'}
            className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2.5 text-sm outline-none focus:border-dourado"
          />
        </div>
        <button
          onClick={consultar}
          disabled={loading || valor.trim().length < 3}
          className="rounded-lg bg-dourado text-black font-semibold px-5 py-2.5 text-sm hover:bg-dourado-dark transition-colors disabled:opacity-60"
        >
          Consultar
        </button>

        <ConsultaEstado loading={loading} error={error} loadingText="Consultando SOSC / Escavador…" />

        {data && (
          <div className="mt-5">
            <p className="text-xs text-texto-sec mb-2">
              {data.total} resultado(s){data.cota != null ? ` · cota mensal: ${data.cota}` : ''}
            </p>
            <div className="space-y-2">
              {data.resultados.map((r, i) => (
                <div key={i} className="rounded-xl border border-linha bg-preto-elev p-4">
                  <div className="font-mono text-sm text-dourado">{r.numero_processo}</div>
                  {r.titulo && <div className="text-sm mt-1">{r.titulo}</div>}
                  <div className="text-xs text-texto-sec mt-1">
                    {[r.tribunal, r.instancia].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
              {data.resultados.length === 0 && (
                <p className="text-sm text-texto-sec">Nenhum processo encontrado.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
