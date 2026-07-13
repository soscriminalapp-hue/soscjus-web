'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import Icon from '@/components/Icon';
import s from './plantao.module.css';

interface Perfil {
  disponivel?: boolean;
  areas?: string[];
  cidade?: string;
  uf?: string;
  bio?: string;
  whatsapp?: string;
}
interface Caso {
  id: string;
  area?: string;
  cidade?: string;
  uf?: string;
  resumo?: string;
  criadoEm?: string;
  status?: string;
  nomeCliente?: string;
  whatsapp?: string;
}

const AREAS = [
  'Criminal',
  'Execução Penal',
  'Cível',
  'Família',
  'Trabalhista',
  'Consumidor',
  'Previdenciário',
  'Tributário',
];

function faz(v?: string) {
  if (!v) return '';
  const min = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function Mural({
  perfil,
  casos,
  semPerfil,
}: {
  perfil: Perfil | null;
  casos: Caso[];
  semPerfil: boolean;
}) {
  const router = useRouter();
  const [p, setP] = useState<Perfil>(perfil ?? { disponivel: false, areas: [] });
  const [editando, setEditando] = useState(semPerfil);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const novos = casos.filter((c) => !c.status || c.status === 'NOVO');
  const aceitos = casos.filter((c) => c.status === 'ACEITO');

  async function alternar() {
    if (ocupado) return;
    const novo = !p.disponivel;
    setP({ ...p, disponivel: novo });   // otimista
    try {
      await sosc.patch('/mural/disponibilidade', { disponivel: novo });
    } catch {
      setP({ ...p, disponivel: !novo });
    }
  }

  async function salvar() {
    setOcupado(true);
    setErro('');
    try {
      await sosc.put('/mural/meu-perfil', {
        areas: p.areas ?? [],
        cidade: p.cidade ?? '',
        uf: p.uf ?? '',
        bio: p.bio ?? '',
        whatsapp: (p.whatsapp ?? '').replace(/\D/g, ''),
        disponivel: p.disponivel ?? true,
      });
      setEditando(false);
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar.');
    } finally {
      setOcupado(false);
    }
  }

  async function responder(id: string, aceitar: boolean) {
    setOcupado(true);
    try {
      await sosc.patch(`/mural/casos/${id}`, { status: aceitar ? 'ACEITO' : 'RECUSADO' });
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível responder.');
    } finally {
      setOcupado(false);
    }
  }

  function marcarArea(a: string) {
    const atuais = p.areas ?? [];
    setP({
      ...p,
      areas: atuais.includes(a) ? atuais.filter((x) => x !== a) : [...atuais, a],
    });
  }

  const ligado = Boolean(p.disponivel);

  return (
    <>
      {/* ═══ O SWITCH — o que ele mais usa (júri, férias) ═══ */}
      <header className={`card ${s.topo} ${ligado ? s.on : s.off}`}>
        <span className={`${s.ic} ${ligado ? s.icOn : ''}`}>
          <Icon n="radar" s={26} />
        </span>

        <div className={s.txt}>
          <h1>Plantão Adv.</h1>
          <p>
            {ligado ? (
              <>
                Você está <b className={s.visivel}>visível</b> no{' '}
                <b>Buscar Advogado</b>. Quando alguém precisar, você aparece.
              </>
            ) : (
              <b className={s.invisivel}>
                Você está invisível. Ninguém te encontra no Buscar Advogado.
              </b>
            )}
          </p>
          <span className={s.gratis}>Grátis no seu plano · não desconta token</span>
        </div>

        <button
          className={`${s.sw} ${ligado ? s.swOn : ''}`}
          onClick={() => void alternar()}
          aria-label={ligado ? 'Ficar invisível' : 'Ficar visível'}
        >
          <i />
        </button>
      </header>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}

      {/* ═══ ⚠️ A REGRA DA OAB — por que nunca cobramos ═══ */}
      <div className="nota lime">
        <Icon n="escudo" s={19} />
        <p>
          <b>O Plantão nunca desconta token.</b> Cobrar por caso recebido seria
          cobrança por lead — vedado pelo <b>Provimento 205 da OAB</b>. O SOSC JUS é
          software, não intermediação de clientela. O contato é direto, pelo WhatsApp,
          e a negociação é sua.
        </p>
      </div>

      {/* ═══ 📥 OS CASOS QUE CHEGARAM ═══ */}
      {novos.length > 0 ? (
        <section className={s.secao}>
          <h2 className={s.h2}>
            <Icon n="convite" s={19} />
            Casos esperando
            <b className={s.pill}>{novos.length}</b>
          </h2>

          <div className={s.casos}>
            {novos.map((c) => (
              <article key={c.id} className={`card ${s.caso}`}>
                <header>
                  <span className={s.area}>{c.area ?? 'Geral'}</span>
                  <em>{faz(c.criadoEm)}</em>
                </header>

                <p className={s.resumo}>{c.resumo ?? 'Sem descrição.'}</p>

                <footer>
                  <span className={s.local}>
                    <Icon n="pin" s={14} />
                    {c.cidade ?? '—'}
                    {c.uf ? `/${c.uf}` : ''}
                  </span>

                  <div className={s.cBtn}>
                    <button
                      className="btn b-ghost sm"
                      onClick={() => void responder(c.id, false)}
                      disabled={ocupado}
                    >
                      Recusar
                    </button>
                    <button
                      className="btn b-lime sm"
                      onClick={() => void responder(c.id, true)}
                      disabled={ocupado}
                    >
                      <Icon n="ok" s={15} strokeWidth={2.6} />
                      Aceitar
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══ ✅ OS QUE ELE ACEITOU ═══ */}
      {aceitos.length > 0 ? (
        <section className={s.secao}>
          <h2 className={s.h2}>
            <Icon n="ok" s={19} strokeWidth={2.4} />
            Aceitos
          </h2>

          <div className={s.casos}>
            {aceitos.map((c) => (
              <article key={c.id} className={`card ${s.caso} ${s.aceito}`}>
                <header>
                  <span className={s.area}>{c.area ?? 'Geral'}</span>
                  <em>{faz(c.criadoEm)}</em>
                </header>

                <p className={s.resumo}>{c.resumo ?? '—'}</p>

                <footer>
                  <span className={s.local}>
                    <Icon n="pin" s={14} />
                    {c.cidade ?? '—'}
                  </span>

                  {/* ⚠️ O CONTATO É DIRETO. Nunca pela plataforma. */}
                  {c.whatsapp ? (
                    <a
                      href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn b-lime sm ${s.wa}`}
                    >
                      <Icon n="wa" s={15} />
                      Falar no WhatsApp
                    </a>
                  ) : null}
                </footer>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {novos.length === 0 && aceitos.length === 0 && !editando ? (
        <div className={`card ${s.vazio}`}>
          <Icon n="radar" s={36} />
          <p>Nenhum caso ainda.</p>
          <small>
            {ligado
              ? 'Você está visível. Quando alguém procurar advogado na sua área, o caso chega aqui.'
              : 'Ligue o Plantão para aparecer no Buscar Advogado.'}
          </small>
        </div>
      ) : null}

      {/* ═══ 👤 O PERFIL — como o usuário te vê ═══ */}
      <section className={`card ${s.perfil}`}>
        <div className="card-h">
          <h2>
            <Icon n="oab" s={18} />
            Como o usuário te vê
          </h2>
          {!editando ? (
            <button className="btn b-ghost sm" onClick={() => setEditando(true)}>
              <Icon n="editar" s={15} />
              Editar
            </button>
          ) : null}
        </div>

        <div className="card-b">
          {editando ? (
            <>
              <div className={s.form}>
                <div className="fld">
                  <span>Áreas que você atende</span>
                  <div className={s.areas}>
                    {AREAS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={`${s.aChip} ${(p.areas ?? []).includes(a) ? s.aOn : ''}`}
                        onClick={() => marcarArea(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="fld">
                  <span>Cidade</span>
                  <input
                    value={p.cidade ?? ''}
                    onChange={(e) => setP({ ...p, cidade: e.target.value })}
                    placeholder="Belo Horizonte"
                    disabled={ocupado}
                  />
                </label>

                <label className="fld">
                  <span>UF</span>
                  <input
                    value={p.uf ?? ''}
                    onChange={(e) => setP({ ...p, uf: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="MG"
                    maxLength={2}
                    disabled={ocupado}
                  />
                </label>

                <label className="fld">
                  <span>WhatsApp</span>
                  <input
                    value={p.whatsapp ?? ''}
                    onChange={(e) => setP({ ...p, whatsapp: e.target.value })}
                    placeholder="(31) 99999-9999"
                    disabled={ocupado}
                  />
                </label>

                <label className={`fld ${s.bio}`}>
                  <span>Uma linha sobre você</span>
                  <textarea
                    value={p.bio ?? ''}
                    onChange={(e) => setP({ ...p, bio: e.target.value })}
                    placeholder="Ex.: Defesa criminal. 12 anos de tribunal do júri."
                    rows={2}
                    disabled={ocupado}
                  />
                </label>
              </div>

              <div className={s.pBtn}>
                {!semPerfil ? (
                  <button className="btn b-ghost" onClick={() => setEditando(false)}>
                    Cancelar
                  </button>
                ) : null}
                <button className="btn b-lime" onClick={() => void salvar()} disabled={ocupado}>
                  {ocupado ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
                  Salvar perfil
                </button>
              </div>
            </>
          ) : (
            <div className={s.verPerfil}>
              <div>
                <dt>Áreas</dt>
                <dd className={s.dAreas}>
                  {(p.areas ?? []).length > 0 ? (
                    (p.areas ?? []).map((a) => <em key={a}>{a}</em>)
                  ) : (
                    <span className={s.nada}>nenhuma área marcada</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Onde</dt>
                <dd>
                  {p.cidade ?? '—'}
                  {p.uf ? `/${p.uf}` : ''}
                </dd>
              </div>
              {p.bio ? (
                <div className={s.dBio}>
                  <dt>Sobre você</dt>
                  <dd>{p.bio}</dd>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
