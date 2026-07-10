// Motor de variáveis dos documentos — espelha a substituição {{var}} do backend
// (documents/routes.ts). Define também os campos editáveis por tipo de documento,
// pra montar o formulário do advogado na tela.

import type { DocKind } from './types';

export interface CampoVar {
  key: string; // nome da variável no template, ex: "cliente_nome"
  label: string; // rótulo no formulário
  placeholder?: string;
  tipo?: 'texto' | 'valor' | 'numero' | 'area';
  // Se true, é preenchido pelo cliente selecionado (não digitado à mão).
  doCliente?: boolean;
}

// Campos que aparecem no formulário lateral, por tipo de documento.
// Os que têm doCliente=true são preenchidos ao escolher o cliente.
export const CAMPOS_POR_KIND: Record<DocKind, CampoVar[]> = {
  PROCURACAO: [
    { key: 'cliente_nome', label: 'Nome do cliente (outorgante)', doCliente: true },
    { key: 'cliente_cpf', label: 'CPF do cliente', doCliente: true },
    { key: 'cliente_endereco', label: 'Endereço do cliente', placeholder: 'Rua, nº, bairro, cidade/UF' },
    { key: 'escritorio_endereco', label: 'Endereço do escritório', placeholder: 'Endereço completo' },
    { key: 'cidade', label: 'Cidade (foro)', placeholder: 'Belo Horizonte' },
    { key: 'data', label: 'Data', placeholder: 'preenchida automaticamente' },
  ],
  HONORARIOS: [
    { key: 'cliente_nome', label: 'Nome do cliente (contratante)', doCliente: true },
    { key: 'cliente_cpf', label: 'CPF do cliente', doCliente: true },
    { key: 'valor_honorarios', label: 'Valor dos honorários (R$)', tipo: 'valor', placeholder: '0,00' },
    { key: 'parcelas', label: 'Nº de parcelas', tipo: 'numero', placeholder: '1' },
    { key: 'valor_parcela', label: 'Valor de cada parcela (R$)', tipo: 'valor', placeholder: '0,00' },
    { key: 'cidade', label: 'Cidade (foro)', placeholder: 'Belo Horizonte' },
    { key: 'data', label: 'Data', placeholder: 'preenchida automaticamente' },
  ],
};

// Substitui {{chave}} pelos valores, idêntico ao backend:
//   body.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m)
export function preencher(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (m, k: string) => {
    const v = vars[k];
    return v !== undefined && v !== '' ? v : m;
  });
}

// Data de hoje no formato pt-BR longo (ex: "8 de julho de 2026"), como o backend.
export function dataHojeExtenso(): string {
  return new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Lista as variáveis presentes num template (pra detectar campos livres extras).
export function extrairVariaveis(template: string): string[] {
  const set = new Set<string>();
  for (const m of template.matchAll(/\{\{(\w+)\}\}/g)) {
    if (m[1]) set.add(m[1]);
  }
  return [...set];
}
