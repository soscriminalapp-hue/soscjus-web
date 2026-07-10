// Helpers de formatação pt-BR.

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  const d = cpf.replace(/\D/g, '').slice(0, 11);
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// Formata número em moeda BRL (sem o "R$", que já vem no template).
export function formatValor(v: string | number): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Calcula valor de parcela a partir de total e nº de parcelas.
export function calcularParcela(total: string, parcelas: string): string {
  const t = parseFloat(String(total).replace(/\./g, '').replace(',', '.'));
  const p = parseInt(parcelas, 10);
  if (Number.isNaN(t) || Number.isNaN(p) || p <= 0) return '';
  return formatValor(t / p);
}
