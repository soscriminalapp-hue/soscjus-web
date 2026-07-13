'use client';

/**
 * 👤 CONVIDAR CLIENTE — a prospecção disfarçada.
 *
 * ⚠️ ELE CONVIDA QUEM JÁ É CLIENTE num processo.
 *
 *    O cliente entra. A primeira busca é POR NOSSA CONTA. E aparecem
 *    10 processos.
 *
 *    Ele só sabia de 1.
 *
 *    Os outros 9 são OPORTUNIDADE — inclusive os arquivados (dá pra pedir
 *    a baixa definitiva).
 *
 *    Um único caso novo paga anos de assinatura.
 */

import { useState } from 'react';
import { sosc, ApiError } from '@/lib/api';
import Icon from '@/components/Icon';
import { Gratis } from '@/components/Token';
import s from './convidar.module.css';

export default function Convidar() {
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [convite, setConvite] = useState<{ code?: string; link?: string } | null>(null);

  async function gerar() {
    setOcupado(true);
    setErro('');
    try {
      const r = await sosc.post<{ code?: string; link?: string; url?: string }>('/invites', {
        clientName: nome.trim() || undefined,
        clientPhone: tel.replace(/\D/g, '') || undefined,
      });
      setConvite({ code: r.code, link: r.link ?? r.url });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível gerar o convite.');
    } finally {
      setOcupado(false);
    }
  }

  const texto = convite
    ? `Olá${nome ? ` ${nome.split(' ')[0]}` : ''}! Sou seu advogado. Baixe o SOSC JUS e entre com este convite: ${convite.code ?? ''}\n\n${convite.link ?? 'https://soscriminalapp.com.br'}\n\nAssim você acompanha seus processos em tempo real e fala comigo por lá.`
    : '';

  const wa = tel.replace(/\D/g, '');

  return (
    <>
      <header className={s.topo}>
        <span className={s.ic}>
          <Icon n="convite" s={26} />
        </span>
        <div>
          <h1>Convidar cliente</h1>
          <p>
            Quando ele entrar, o SOSC JUS busca <b>todos os processos dele</b> —
            inclusive os que <b>você não sabia que existiam</b>. Até os arquivados:
            dá pra pedir a baixa definitiva.
          </p>
        </div>
        <Gratis texto="Grátis" />
      </header>

      {/* ⚠️ A CONTA QUE VENDE — sem ela, ele não entende o valor */}
      <div className="nota lime">
        <Icon n="busca" s={19} />
        <p>
          <b>A primeira busca é por nossa conta.</b> Ele entra, e aparecem os
          processos — todos. Se ele só sabia de um, os outros são{' '}
          <b>oportunidade sua</b>. Um único caso novo paga anos de assinatura.
        </p>
      </div>

      <div className={s.duas}>
        <section className="card">
          <div className="card-h">
            <h2>
              <Icon n="clientes" s={18} />
              Quem você quer convidar
            </h2>
          </div>
          <div className="card-b">
            <label className="fld">
              <span>Nome · opcional</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
                disabled={ocupado}
              />
            </label>

            <label className="fld">
              <span>WhatsApp · opcional</span>
              <input
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="(31) 99999-9999"
                disabled={ocupado}
              />
            </label>

            {erro ? (
              <div className={s.erro}>
                <Icon n="alerta" s={17} />
                <span>{erro}</span>
              </div>
            ) : null}

            <button className="btn b-lime full" onClick={() => void gerar()} disabled={ocupado}>
              {ocupado ? <span className="spin" /> : <Icon n="convite" s={17} />}
              Gerar convite
            </button>
          </div>
        </section>

        {/* ─── O CONVITE PRONTO ─── */}
        {convite ? (
          <section className={`card ${s.pronto}`}>
            <div className="card-h">
              <h2>
                <Icon n="ok" s={18} strokeWidth={2.4} />
                Convite pronto
              </h2>
            </div>
            <div className="card-b">
              {convite.code ? (
                <div className={s.codigo}>
                  <span>CÓDIGO</span>
                  <b className="num">{convite.code}</b>
                  <button
                    onClick={() => void navigator.clipboard.writeText(convite.code ?? '')}
                    title="Copiar"
                  >
                    <Icon n="copiar" s={16} strokeWidth={2.2} />
                  </button>
                </div>
              ) : null}

              <p className={s.txt}>{texto}</p>

              <div className={s.acoes}>
                <button
                  className="btn b-ghost"
                  onClick={() => void navigator.clipboard.writeText(texto)}
                >
                  <Icon n="copiar" s={16} strokeWidth={2.2} />
                  Copiar mensagem
                </button>

                {/* ⚠️ O WhatsApp é INTOCADO — o contato é direto */}
                <a
                  href={`https://wa.me/${wa ? `55${wa}` : ''}?text=${encodeURIComponent(texto)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${s.wa}`}
                >
                  <Icon n="wa" s={17} />
                  Mandar no WhatsApp
                </a>
              </div>
            </div>
          </section>
        ) : (
          <aside className={`card ${s.como}`}>
            <div className="card-h">
              <h2>Como funciona</h2>
            </div>
            <div className="card-b">
              <ol>
                <li>
                  <b>Você gera o convite</b>
                  <span>Um código e um link. Mande pelo WhatsApp.</span>
                </li>
                <li>
                  <b>Ele baixa o app e entra</b>
                  <span>Com o seu código — e já fica vinculado a você.</span>
                </li>
                <li>
                  <b>O SOSC JUS busca tudo</b>
                  <span>
                    Todos os processos dele, em todos os tribunais. A primeira busca é
                    por nossa conta.
                  </span>
                </li>
                <li>
                  <b>Você vê o que ele nem sabia</b>
                  <span>
                    Vincula os que interessam — vincular é grátis. Acompanhar custa
                    10.000 tokens por mês.
                  </span>
                </li>
              </ol>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
