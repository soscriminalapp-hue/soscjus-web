'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiException } from '@/lib/api';
import type { Processo } from '@/lib/types';

export default function ProcessosPage() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['meus-processos'],
    queryFn: () => api.meusProcessos(false),
  });

  async function forcarRefresh() {
    setRefreshing(true);
    try {
      const fresh = await api.meusProcessos(true);
      qc.setQueryData(['meus-processos'], fresh);
    } catch {
      // 402 (cota) ou 422 (OAB) são tratados abaixo pelo estado de erro geral.
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Meus Processos</h1>
          <p className="text-texto-sec mt-1">
            Vinculados à sua OAB. Toque em um processo pra ver os andamentos.
          </p>
        </div>
        <button
          onClick={forcarRefresh}
          disabled={refreshing}
          className="shrink-0 text-sm rounded-lg px-4 py-2 border border-linha text-texto-sec hover:text-dourado hover:border-dourado/40 transition-colors disabled:opacity-60"
        >
          {refreshing ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      </header>

      {isLoading && <p className="text-texto-sec text-sm">Carregando…</p>}

      {error && (
        <div className="rounded-xl border border-alerta/30 bg-alerta/10 p-4 text-sm text-alerta">
          {error instanceof ApiException && error.code === 'OabAusente'
            ? 'Cadastre sua OAB no perfil (pelo app) para listar seus processos.'
            : 'Não foi possível carregar os processos.'}
        </div>
      )}

      {data && data.resultados.length === 0 && (
        <div className="rounded-xl border border-linha bg-preto-card p-6 text-sm text-texto-sec">
          Nenhum processo encontrado. Use “Sincronizar” para buscar pela sua OAB.
        </div>
      )}

      <div className="space-y-2">
        {data?.resultados.map((p: Processo) => (
          <Link
            key={p.numero_processo}
            href={`/processos/${encodeURIComponent(p.numero_processo)}`}
            className="block rounded-xl border border-linha bg-preto-card p-4 hover:border-dourado/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm text-dourado truncate">{p.numero_processo}</div>
                <div className="text-sm mt-0.5 truncate">{p.classe ?? 'Classe não informada'}</div>
                <div className="text-xs text-texto-sec mt-1 truncate">
                  {[p.tribunal, p.comarca, p.instancia].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {p.temNovidade && (
                  <span className="text-[10px] font-medium text-dourado border border-dourado/40 rounded-full px-2 py-0.5">
                    novidade
                  </span>
                )}
                {p.monitorado && (
                  <span className="text-[10px] text-texto-sec">monitorado</span>
                )}
              </div>
            </div>
            {p.ultima_mov && (
              <div className="text-xs text-texto-sec mt-2 line-clamp-2 border-t border-linha pt-2">
                Última: {p.ultima_mov}
              </div>
            )}
          </Link>
        ))}
      </div>

      {data && (
        <p className="text-xs text-texto-sec mt-6">
          Fonte: {data.fonte === 'cache' ? 'dados salvos' : 'sincronização'} · {data.total}{' '}
          processo(s)
        </p>
      )}
    </div>
  );
}
