'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCPF } from '@/lib/format';

export default function ClientesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.listarClientes(),
  });

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-texto-sec mt-1">Vinculados à sua conta. Use-os pra preencher documentos.</p>
      </header>

      {isLoading && <p className="text-texto-sec text-sm">Carregando…</p>}
      {error && <p className="text-alerta text-sm">Não foi possível carregar os clientes.</p>}

      {data && data.length === 0 && (
        <div className="rounded-xl border border-linha bg-preto-card p-6 text-sm text-texto-sec">
          Nenhum cliente vinculado ainda. Os vínculos são criados pelo convite no app.
        </div>
      )}

      <div className="space-y-2">
        {data?.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-linha bg-preto-card p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{c.fullName ?? 'Sem nome'}</div>
              <div className="text-xs text-texto-sec">
                {c.cpf ? formatCPF(c.cpf) : 'CPF não informado'}
                {c.planTier ? ` · ${c.planTier}` : ''}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/documentos/HONORARIOS"
                className="text-xs rounded-lg px-3 py-1.5 border border-linha text-texto-sec hover:text-dourado hover:border-dourado/40 transition-colors"
              >
                Contrato
              </Link>
              <Link
                href="/documentos/PROCURACAO"
                className="text-xs rounded-lg px-3 py-1.5 border border-linha text-texto-sec hover:text-dourado hover:border-dourado/40 transition-colors"
              >
                Procuração
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
