'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Movimentacao } from '@/lib/types';

export default function ProcessoDetalhePage() {
  const params = useParams<{ numero: string }>();
  const numero = decodeURIComponent(params.numero);

  // Reaproveita a lista já em cache; acha o processo pelo número.
  const { data, isLoading } = useQuery({
    queryKey: ['meus-processos'],
    queryFn: () => api.meusProcessos(false),
  });

  const processo = useMemo(
    () => data?.resultados.find((p) => p.numero_processo === numero),
    [data, numero],
  );

  if (isLoading) {
    return <div className="p-8 text-texto-sec text-sm">Carregando…</div>;
  }

  if (!processo) {
    return (
      <div className="p-8 max-w-3xl">
        <Link href="/processos" className="text-sm text-texto-sec hover:text-dourado">
          ← Voltar
        </Link>
        <p className="mt-4 text-sm text-texto-sec">
          Processo não encontrado na lista atual. Volte e sincronize.
        </p>
      </div>
    );
  }

  const movs: Movimentacao[] = Array.isArray(processo.movimentacoes)
    ? processo.movimentacoes
    : [];

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/processos" className="text-sm text-texto-sec hover:text-dourado">
        ← Voltar
      </Link>

      <header className="mt-4 mb-6">
        <div className="font-mono text-dourado">{processo.numero_processo}</div>
        <h1 className="text-xl font-semibold mt-1">
          {processo.classe ?? 'Classe não informada'}
        </h1>
        <div className="text-sm text-texto-sec mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {processo.tribunal && <span>Tribunal: {processo.tribunal}</span>}
          {processo.comarca && <span>Comarca: {processo.comarca}</span>}
          {processo.instancia && <span>Instância: {processo.instancia}</span>}
          {processo.status && <span>Status: {processo.status}</span>}
        </div>
      </header>

      {(processo.polo_ativo || processo.polo_passivo) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {processo.polo_ativo && (
            <div className="rounded-xl border border-linha bg-preto-card p-4">
              <div className="text-xs text-texto-sec mb-1">Polo ativo</div>
              <div className="text-sm">{processo.polo_ativo}</div>
            </div>
          )}
          {processo.polo_passivo && (
            <div className="rounded-xl border border-linha bg-preto-card p-4">
              <div className="text-xs text-texto-sec mb-1">Polo passivo</div>
              <div className="text-sm">{processo.polo_passivo}</div>
            </div>
          )}
        </div>
      )}

      <h2 className="font-semibold mb-3">Andamentos</h2>
      {movs.length === 0 ? (
        <p className="text-sm text-texto-sec">
          Sem movimentações carregadas. Sincronize na lista para atualizar.
        </p>
      ) : (
        <ol className="relative border-l border-linha ml-2 space-y-4">
          {movs.map((m, i) => {
            const data = (m.data as string) ?? '';
            const descricao =
              (m.descricao as string) ?? (m as any).texto ?? (m as any).movimento ?? '';
            return (
              <li key={i} className="ml-4">
                <span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-dourado" />
                {data && <div className="text-xs text-dourado">{data}</div>}
                <div className="text-sm mt-0.5">{descricao || '—'}</div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
