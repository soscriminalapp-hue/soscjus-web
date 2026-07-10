'use client';

import { ApiException } from '@/lib/api';

// Bloco reutilizável de estado das consultas: loading, erro comum,
// e o caso especial 402 (cota esgotada → compra é feita no app do celular).
export function ConsultaEstado({
  loading,
  error,
  loadingText = 'Consultando…',
}: {
  loading: boolean;
  error: unknown;
  loadingText?: string;
}) {
  if (loading) {
    return (
      <div className="mt-5 rounded-xl border border-linha bg-preto-elev p-4 text-sm text-texto-sec">
        <span className="inline-block w-3.5 h-3.5 border-2 border-linha border-t-dourado rounded-full animate-spin align-[-2px] mr-2" />
        {loadingText}
      </div>
    );
  }
  if (!error) return null;

  const is402 = error instanceof ApiException && error.status === 402;
  const msg = error instanceof ApiException ? error.message : 'Não foi possível consultar agora.';

  if (is402) {
    // Cota grátis esgotada. Na web não há pagamento — a compra é confirmada no celular.
    return (
      <div className="mt-5 rounded-xl border border-dourado/30 bg-dourado/10 p-4">
        <p className="text-sm text-dourado font-medium mb-1">Consulta avulsa necessária</p>
        <p className="text-sm text-texto-sec">{msg}</p>
        <p className="text-sm text-texto-sec mt-2">
          Compras são confirmadas no app do celular (App Store). Faça a aquisição no aplicativo
          SOSC JUS e a consulta fica liberada aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-alerta/30 bg-alerta/10 p-4 text-sm text-alerta">
      {msg}
    </div>
  );
}
