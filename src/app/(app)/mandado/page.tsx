'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { MandadoResponse } from '@/lib/types';
import { ConsultaEstado } from '@/components/ConsultaEstado';

export default function MandadoPage() {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<MandadoResponse | null>(null);

  async function consultar() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await api.mandadoConsulta(cpf, nome, nomeMae);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const cpfValido = cpf.replace(/\D/g, '').length === 11;
  const nenhum = data && Array.isArray(data.mandados) && data.mandados.length === 0;

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/dashboard" className="text-sm text-texto-sec hover:text-dourado">
        ← Início
      </Link>
      <h1 className="text-2xl font-semibold mt-4">Mandado de Prisão</h1>
      <p className="text-texto-sec mt-1 mb-6">
        Consulta nacional no Banco Nacional de Mandados de Prisão (BNMP/CNJ).
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
        <div className="mb-4">
          <label className="block text-xs text-texto-sec mb-1.5">Nome da mãe (opcional)</label>
          <input
            value={nomeMae}
            onChange={(e) => setNomeMae(e.target.value)}
            placeholder="Ajuda a desambiguar homônimos"
            className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2.5 text-sm outline-none focus:border-dourado"
          />
        </div>
        <button
          onClick={consultar}
          disabled={loading || !cpfValido || nome.trim().length < 3}
          className="rounded-lg bg-dourado text-black font-semibold px-5 py-2.5 text-sm hover:bg-dourado-dark transition-colors disabled:opacity-60"
        >
          Consultar BNMP
        </button>

        <ConsultaEstado loading={loading} error={error} loadingText="Consultando BNMP/CNJ nacional…" />

        {data && (
          <div className="mt-5">
            {nenhum ? (
              <div className="rounded-xl border border-linha bg-preto-elev p-4">
                <p className="text-sm text-verde">Nenhum mandado em aberto encontrado.</p>
                <p className="text-xs text-texto-sec mt-1">
                  Para {data.nome} · CPF {cpf} · abrangência nacional.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-alerta/30 bg-alerta/10 p-4">
                <p className="text-sm text-alerta font-medium mb-2">
                  {Array.isArray(data.mandados) ? data.mandados.length : 0} mandado(s) encontrado(s)
                </p>
                <pre className="text-xs text-texto-sec whitespace-pre-wrap break-words">
                  {JSON.stringify(data.mandados, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <p className="text-alerta text-xs mt-4">
          Consulta meramente informativa. Não substitui certidão oficial. Emergência: 190 / 192 / 193.
        </p>
      </div>
    </div>
  );
}
