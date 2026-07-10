'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, ApiException } from '@/lib/api';
import type { DocKind, ClientLite } from '@/lib/types';
import { CAMPOS_POR_KIND, preencher, dataHojeExtenso } from '@/lib/templateVars';
import { formatCPF, calcularParcela } from '@/lib/format';
import { FolhaA4 } from '@/components/FolhaA4';

const TITULOS: Record<DocKind, string> = {
  HONORARIOS: 'Contrato de Honorários',
  PROCURACAO: 'Procuração',
};

function isKind(v: string): v is DocKind {
  return v === 'HONORARIOS' || v === 'PROCURACAO';
}

export default function DocumentoPage() {
  const params = useParams<{ kind: string }>();
  const kindParam = params.kind;
  const kind: DocKind = isKind(kindParam) ? kindParam : 'HONORARIOS';

  // Template (título + corpo) — do backend, com fallback pro padrão.
  const tplQuery = useQuery({
    queryKey: ['documento', kind],
    queryFn: () => api.getDocumento(kind),
  });

  // Clientes vinculados (pra preencher dados sem redigitar).
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.listarClientes(),
  });

  // Valores das variáveis digitadas/selecionadas.
  const [vars, setVars] = useState<Record<string, string>>({});
  const [clienteId, setClienteId] = useState<string>('');
  const [corpoEditavel, setCorpoEditavel] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const campos = CAMPOS_POR_KIND[kind];

  // Inicializa a data automaticamente quando o template carrega.
  useEffect(() => {
    setVars((v) => ({ ...v, data: v.data || dataHojeExtenso() }));
  }, [kind]);

  // Ao trocar de cliente, injeta nome + CPF nas variáveis.
  useEffect(() => {
    if (!clienteId) return;
    const c = clientesQuery.data?.find((x) => x.id === clienteId);
    if (!c) return;
    setVars((v) => ({
      ...v,
      cliente_nome: c.fullName ?? v.cliente_nome ?? '',
      cliente_cpf: c.cpf ? formatCPF(c.cpf) : v.cliente_cpf ?? '',
    }));
  }, [clienteId, clientesQuery.data]);

  // Honorários: recalcula valor da parcela automaticamente.
  useEffect(() => {
    if (kind !== 'HONORARIOS') return;
    const total = vars.valor_honorarios;
    const parcelas = vars.parcelas;
    if (total && parcelas) {
      const p = calcularParcela(total, parcelas);
      if (p && p !== vars.valor_parcela) {
        setVars((v) => ({ ...v, valor_parcela: p }));
      }
    }
  }, [vars.valor_honorarios, vars.parcelas, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // Corpo base: o do backend ou o que o advogado editou à mão.
  const corpoBase = corpoEditavel ?? tplQuery.data?.body ?? '';
  const titulo = tplQuery.data?.title ?? TITULOS[kind];

  // Corpo renderizado (variáveis substituídas) pra exibir na folha.
  const corpoRenderizado = useMemo(() => preencher(corpoBase, vars), [corpoBase, vars]);
  const tituloRenderizado = useMemo(() => preencher(titulo, vars), [titulo, vars]);

  const setVar = (k: string, val: string) => setVars((v) => ({ ...v, [k]: val }));

  function imprimir() {
    // A folha .folha-a4 é o único elemento visível na impressão (ver globals.css).
    window.print();
  }

  if (tplQuery.isLoading) {
    return <div className="p-8 text-texto-sec text-sm">Carregando documento…</div>;
  }
  if (tplQuery.error) {
    const msg =
      tplQuery.error instanceof ApiException ? tplQuery.error.message : 'Erro ao carregar.';
    return <div className="p-8 text-alerta text-sm">{msg}</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Painel de campos (esquerda) */}
      <div className="w-80 shrink-0 border-r border-linha bg-preto-card overflow-y-auto print:hidden">
        <div className="px-5 py-4 border-b border-linha sticky top-0 bg-preto-card z-10">
          <h2 className="font-semibold">{TITULOS[kind]}</h2>
          <p className="text-xs text-texto-sec mt-0.5">
            Preencha os campos — a folha atualiza ao vivo.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Seleção de cliente */}
          <div>
            <label className="block text-xs text-texto-sec mb-1.5">
              Cliente vinculado (opcional)
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2 text-sm outline-none focus:border-dourado"
            >
              <option value="">— selecionar —</option>
              {clientesQuery.data?.map((c: ClientLite) => (
                <option key={c.id} value={c.id}>
                  {c.fullName ?? 'Sem nome'} {c.cpf ? `· ${formatCPF(c.cpf)}` : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-texto-sec mt-1">
              Ao escolher, nome e CPF preenchem sozinhos e valem também pra procuração.
            </p>
          </div>

          <div className="h-px bg-linha" />

          {/* Campos do documento */}
          {campos.map((campo) => (
            <div key={campo.key}>
              <label className="block text-xs text-texto-sec mb-1.5">{campo.label}</label>
              {campo.tipo === 'area' ? (
                <textarea
                  value={vars[campo.key] ?? ''}
                  onChange={(e) => setVar(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  rows={3}
                  className="w-full rounded-lg bg-preto-elev border border-linha px-3 py-2 text-sm outline-none focus:border-dourado resize-none"
                />
              ) : (
                <input
                  type="text"
                  inputMode={campo.tipo === 'valor' || campo.tipo === 'numero' ? 'decimal' : 'text'}
                  value={vars[campo.key] ?? ''}
                  onChange={(e) => setVar(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  className={`w-full rounded-lg bg-preto-elev border border-linha px-3 py-2 text-sm outline-none focus:border-dourado ${
                    campo.doCliente && clienteId ? 'text-dourado' : ''
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Folha + ações (direita) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra de ações */}
        <div className="px-6 py-3 border-b border-linha flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModoEdicao((m) => !m);
                if (!modoEdicao) setCorpoEditavel(corpoBase);
              }}
              className={`text-sm rounded-lg px-3 py-1.5 border transition-colors ${
                modoEdicao
                  ? 'border-dourado text-dourado bg-dourado/10'
                  : 'border-linha text-texto-sec hover:text-white'
              }`}
            >
              {modoEdicao ? 'Concluir edição do texto' : 'Editar texto do documento'}
            </button>
            {corpoEditavel !== null && (
              <button
                onClick={() => {
                  setCorpoEditavel(null);
                  setModoEdicao(false);
                }}
                className="text-xs text-texto-sec hover:text-white"
              >
                Restaurar original
              </button>
            )}
          </div>

          <button
            onClick={imprimir}
            className="text-sm rounded-lg px-4 py-1.5 bg-dourado text-black font-semibold hover:bg-dourado-dark transition-colors"
          >
            Imprimir / Salvar PDF
          </button>
        </div>

        {/* Área de rolagem cinza com a folha branca centralizada */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] py-8 px-4">
          {modoEdicao ? (
            <div className="max-w-[210mm] mx-auto">
              <p className="text-xs text-texto-sec mb-2">
                Edite o texto livremente. Use {'{{'}variavel{'}}'} para campos dinâmicos
                (ex: {'{{'}cliente_nome{'}}'}).
              </p>
              <textarea
                value={corpoEditavel ?? ''}
                onChange={(e) => setCorpoEditavel(e.target.value)}
                className="w-full h-[60vh] rounded-lg bg-preto-elev border border-linha p-4 text-sm font-mono outline-none focus:border-dourado resize-none"
              />
            </div>
          ) : (
            <FolhaA4 titulo={tituloRenderizado} corpo={corpoRenderizado} />
          )}
        </div>
      </div>
    </div>
  );
}
