'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import Icon from '@/components/Icon';
import Compra from '@/components/Compra';

export default function Sincronizar() {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [comprar, setComprar] = useState<string | null>(null);

  async function rodar() {
    setOcupado(true);
    try {
      await sosc.get('/processos/meus-processos?fonte=refresh');
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.semCota) {
        setComprar('CONSULTA_PROCESSUAL');
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <button className="btn b-gold" onClick={rodar} disabled={ocupado}>
        {ocupado ? (
          <>
            <span className="spin" style={{ borderTopColor: '#151206' }} />
            Buscando…
          </>
        ) : (
          <>
            <Icon n="sync" s={19} strokeWidth={2.1} />
            Sincronizar OAB
          </>
        )}
      </button>

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void rodar();
        }}
      />
    </>
  );
}
