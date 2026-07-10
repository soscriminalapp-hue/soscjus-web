'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { AntecedentesResponse } from '@/lib/types';
import { ConsultaEstado } from '@/components/ConsultaEstado';

export default function CpfPage() {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<AntecedentesResponse | null>(null);

  async function consultar() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await api.antecedentes(cpf, nome);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const cpfValido = cpf.replace(/\D/g, '').length === 11;

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/dashboard" className="text-sm text-texto-sec hover:text-dourado">
        ← Início
      </Link>
      <h1 className="text-2xl font-semibold mt-4">Consultar CPF · Antecedentes</h1>
      <p className="text-texto-sec mt-1 mb-6">
        Ficha cadastral e certidão de antecedentes criminais.
      </p>

      <div className="rounded-2xl border border-linha bg-preto-card p-6 max-w-xl">
        <div className="mb-4">
          <label className="block text-xs text-texto-sec mb-1.5">CPF</label>
          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2.5 text-sm outline-none focus:border-dourado"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-texto-sec mb-1.5">Nome completo</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da parte"
            className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2.5 text-sm outline-none focus:border-dourado"
          />
        </div>
        <button
          onClick={consultar}
          disabled={loading || !cpfValido || nome.trim().length < 3}
          className="rounded-lg bg-dourado text-black font-semibold px-5 py-2.5 text-sm hover:bg-dourado-dark transition-colors disabled:opacity-60"
        >
          Consultar antecedentes
        </button>

        <ConsultaEstado
          loading={loading}
          error={error}
          loadingText="Consultando ficha e antecedentes…"
        />

        {data?.ok && (
          <div className="mt-5 rounded-xl border border-linha bg-preto-elev p-4">
            <p className="text-xs text-dourado uppercase tracking-wide mb-3">
              Resultado — antecedentes
            </p>
            {/* Passthrough do provedor: renderiza legível sem assumir formato fixo. */}
            <pre className="text-xs text-texto-sec whitespace-pre-wrap break-words">
              {JSON.stringify(data.antecedentes, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <p className="text-xs text-texto-sec mt-4 max-w-xl">
        Consulta sujeita a cobrança avulsa (IAP), confirmada no app do celular quando a cota
        gratuita se esgota.
      </p>
    </div>
  );
}
