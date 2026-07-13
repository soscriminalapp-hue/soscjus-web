'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  📡 PLANTÃO ADV. — a conexão com o usuário
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ESPELHO EXATO do backend real (src/routes/mural-advogado.ts):
 *
 *    GET  /mural/meu-perfil       → { perfil: PerfilMural | null }
 *    PUT  /mural/meu-perfil       → { perfil, aviso? }         (exige assinatura)
 *    PATCH /mural/disponibilidade → { perfil } | 409 se perfil não existe
 *    GET  /mural/casos            → { casos: Caso[], stats }   (exige assinatura)
 *    PATCH /mural/casos/:id       → aceitar/recusar
 *
 *  O bug que isto corrige: a versão anterior tratava a resposta de
 *  GET /mural/meu-perfil como se já fosse o perfil (sem desembrulhar
 *  `.perfil`), e o backend SEMPRE devolve 200 (nunca 404) — mesmo quando
 *  não existe nada ainda. Resultado: todo advogado que nunca configurou via
 *  "Você está invisível" (vermelho) em vez do convite para configurar.
 *
 *  ⚠️ O Plantão NUNCA desconta token — efeito de rede (Provimento 205 OAB).
 */

import { useCallback, useEffect, useState } from 'react';
import { sosc, ApiError } from '@/lib/api';
import { AREAS_CRIMINAL, AREAS_CIVEL, acharArea } from '@/lib/mural-areas';
import Icon from '@/components/Icon';
import s from './plantao.module.css';

interface PerfilMural {
  id: string;
  nomeExibicao: string;
  bio: string | null;
  oabNumero: string;
  oabUf: string;
  oabValidada: boolean;
  areas: string[];
  cidades: string[];
  remoto: boolean;
  presencial: boolean;
  disponivel: boolean;
  disponivelAte: string | null;
  atendeUrgencia: boolean;
  perfilPublicado: boolean;
  whatsapp: string;
  telefone: string | null;
}

interface Caso {
  id: string;
  ramo: 'CRIMINAL' | 'CIVEL';
  areaId: string;
  situacao: string;
  relato: string | null;
  cidade: string;
  status: 'NOVO' | 'ACEITO' | 'RECUSADO' | 'EXPIRADO';
  slaHoras: number;
  expiraEm: string;
  criadoEm: string;
  usuario: { nome: string; whatsapp: string | null };
}

function faz(v: string) {
  const min = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return h < 24 ? `há ${h}h` : `há ${Math.floor(h / 24)}d`;
}

function restam(expiraEm: string) {
  const min = Math.floor((new Date(expiraEm).getTime() - Date.now()) / 60000);
  if (min <= 0) return 'expirando';
  if (min < 60) return `${min} min restantes`;
  return `${Math.floor(min / 60)}h restantes`;
}

const FORM_VAZIO = {
  nomeExibicao: '',
  bio: '',
  oabNumero: '',
  oabUf: '',
  areas: [] as string[],
  cidades: '',
  remoto: true,
  presencial: true,
  atendeUrgencia: false,
  whatsapp: '',
  telefone: '',
  perfilPublicado: true,
};

export default function Mural() {
  const [perfil, setPerfil] = useState<PerfilMural | null>(null);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [stats, setStats] = useState({ novos: 0, aceitos: 0, total: 0 });
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mudandoDisp, setMudandoDisp] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(FORM_VAZIO);

  const ler = useCallback(async () => {
    setErro('');
    try {
      // ⚠️ O backend ENVELOPA: { perfil: {...} | null }. Sempre 200.
      const r = await sosc.get<{ perfil: PerfilMural | null }>('/mural/meu-perfil');
      setPerfil(r.perfil);

      if (r.perfil) {
        setForm({
          nomeExibicao: r.perfil.nomeExibicao,
          bio: r.perfil.bio ?? '',
          oabNumero: r.perfil.oabNumero,
          oabUf: r.perfil.oabUf,
          areas: r.perfil.areas,
          cidades: r.perfil.cidades.join(', '),
          remoto: r.perfil.remoto,
          presencial: r.perfil.presencial,
          atendeUrgencia: r.perfil.atendeUrgencia,
          whatsapp: r.perfil.whatsapp,
          telefone: r.perfil.telefone ?? '',
          perfilPublicado: r.perfil.perfilPublicado,
        });

        try {
          const c = await sosc.get<{ casos: Caso[]; stats: typeof stats }>(
            '/mural/casos?status=NOVO',
          );
          setCasos(c.casos);
          setStats(c.stats);
        } catch {
          /* precisa de assinatura ativa — não é erro fatal, a tela mostra o resto */
        }
      } else {
        // Nunca configurou. Abre o formulário direto — é o que ele precisa fazer.
        setEditando(true);
      }
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar o Plantão.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void ler();
  }, [ler]);

  async function alternar() {
    if (!perfil || mudandoDisp) return;
    const novo = !perfil.disponivel;
    setMudandoDisp(true);
    setPerfil({ ...perfil, disponivel: novo }); // otimista
    setErro('');
    try {
      const r = await sosc.patch<{ perfil: PerfilMural }>('/mural/disponibilidade', {
        disponivel: novo,
      });
      setPerfil(r.perfil);
    } catch (e) {
      setPerfil({ ...perfil, disponivel: !novo }); // desfaz
      if (e instanceof ApiError && e.status === 409) {
        setErro('Salve seu perfil antes de ficar disponível.');
        setEditando(true);
      } else {
        setErro(e instanceof ApiError ? e.message : 'Não foi possível mudar.');
      }
    } finally {
      setMudandoDisp(false);
    }
  }

  function marcarArea(id: string) {
    setForm((f) => ({
      ...f,
      areas: f.areas.includes(id) ? f.areas.filter((x) => x !== id) : [...f.areas, id],
    }));
  }

  async function salvar() {
    setErro('');
    setAviso('');

    if (form.nomeExibicao.trim().length < 3) return setErro('O nome tem que ter ao menos 3 letras.');
    if (form.oabNumero.trim().length < 3) return setErro('Informe o número da OAB.');
    if (form.oabUf.trim().length !== 2) return setErro('A UF da OAB tem 2 letras.');
    if (form.areas.length === 0) return setErro('Selecione ao menos uma área de atuação.');
    const cidades = form.cidades.split(',').map((c) => c.trim()).filter(Boolean);
    if (cidades.length === 0) return setErro('Informe ao menos uma cidade.');
    if (form.whatsapp.replace(/\D/g, '').length < 10) return setErro('Informe um WhatsApp válido.');

    setSalvando(true);
    try {
      const r = await sosc.put<{ perfil: PerfilMural; aviso?: string }>('/mural/meu-perfil', {
        nomeExibicao: form.nomeExibicao.trim(),
        bio: form.bio.trim() || null,
        oabNumero: form.oabNumero.trim(),
        oabUf: form.oabUf.trim().toUpperCase(),
        areas: form.areas,
        cidades,
        remoto: form.remoto,
        presencial: form.presencial,
        atendeUrgencia: form.atendeUrgencia,
        whatsapp: form.whatsapp.trim(),
        telefone: form.telefone.trim() || null,
        perfilPublicado: form.perfilPublicado,
      });
      setPerfil(r.perfil);
      if (r.aviso) setAviso(r.aviso);
      setEditando(false);
      void ler();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  async function decidir(id: string, decisao: 'ACEITAR' | 'RECUSAR') {
    setErro('');
    try {
      await sosc.patch(`/mural/casos/${id}`, { decisao });
      setCasos((cs) => cs.filter((c) => c.id !== id));
      setStats((st) => ({ ...st, novos: Math.max(0, st.novos - 1) }));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível responder.');
    }
  }

  if (carregando) {
    return <div className={`card ${s.skel}`} />;
  }

  return (
    <>
      <header className={s.topoPagina}>
        <div>
          <h1>Plantão Adv.</h1>
          <p>
            Do outro lado, o usuário abre o <b>Buscar Advogado</b> — e você aparece.
            É a mesma ponte, os dois lados.
          </p>
        </div>
        <span className={s.gratisGrande}>Grátis no seu plano · não desconta token</span>
      </header>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}
      {aviso ? (
        <div className={s.avisoBox}>
          <Icon n="alerta" s={17} />
          <span>{aviso}</span>
        </div>
      ) : null}

      {/* ═══ O SWITCH — só existe se o perfil já existir ═══ */}
      {perfil ? (
        <section className={`card ${s.switchCard} ${perfil.disponivel ? s.on : s.off}`}>
          <span className={`${s.ic} ${perfil.disponivel ? s.icOn : ''}`}>
            <Icon n="radar" s={24} />
          </span>
          <div className={s.switchTxt}>
            <strong>{perfil.nomeExibicao}</strong>
            <small>
              OAB {perfil.oabUf} {perfil.oabNumero}
              {!perfil.oabValidada ? (
                <em className={s.naoValidada}> · OAB em validação</em>
              ) : null}
            </small>
            <p>
              {perfil.disponivel ? (
                <>
                  Você está <b className={s.visivel}>visível</b> no Buscar Advogado.
                </>
              ) : (
                <b className={s.invisivel}>
                  Você está invisível. Ninguém te encontra no Buscar Advogado.
                </b>
              )}
            </p>
          </div>
          <button
            className={`${s.sw} ${perfil.disponivel ? s.swOn : ''}`}
            onClick={() => void alternar()}
            disabled={mudandoDisp || !perfil.oabValidada}
            title={!perfil.oabValidada ? 'A OAB precisa ser validada primeiro' : ''}
            aria-label="Alternar disponibilidade"
          >
            <i />
          </button>
        </section>
      ) : null}

      {/* ═══ 📥 OS CASOS ═══ */}
      {perfil?.perfilPublicado && casos.length > 0 ? (
        <section className={s.secaoCasos}>
          <h2 className={s.h2Casos}>
            Casos esperando
            <b className={s.pillCasos}>{stats.novos}</b>
          </h2>
          <div className={s.grid}>
            {casos.map((c) => {
              const area = acharArea(c.areaId);
              const urgente = c.slaHoras <= 6;
              return (
                <article key={c.id} className={`card ${s.caso} ${urgente ? s.urgente : ''}`}>
                  <header>
                    <span className={s.areaTag}>
                      {area?.ico} {area?.titulo ?? c.areaId}
                    </span>
                    {urgente ? <span className={s.urgenteTag}>URGENTE</span> : null}
                  </header>
                  <p className={s.situacao}>{c.situacao}</p>
                  {c.relato ? <p className={s.relato}>{c.relato}</p> : null}
                  <footer>
                    <span className={s.meta}>
                      <Icon n="pin" s={13} />
                      {c.cidade} · {faz(c.criadoEm)} · {restam(c.expiraEm)}
                    </span>
                    <div className={s.acoesCaso}>
                      <button className="btn b-ghost sm" onClick={() => void decidir(c.id, 'RECUSAR')}>
                        Recusar
                      </button>
                      <button className="btn b-lime sm" onClick={() => void decidir(c.id, 'ACEITAR')}>
                        Aceitar
                      </button>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ═══ O FORMULÁRIO — perfil real, rico ═══ */}
      {editando ? (
        <section className={`card ${s.form}`}>
          <div className="card-h">
            <h2>{perfil ? 'Editar meu perfil' : 'Configurar o Plantão'}</h2>
            {perfil ? (
              <button className="btn b-ghost sm" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            ) : null}
          </div>
          <div className="card-b">
            <div className={s.linha2}>
              <label className="fld">
                <span>Nome de exibição</span>
                <input
                  value={form.nomeExibicao}
                  onChange={(e) => setForm((f) => ({ ...f, nomeExibicao: e.target.value }))}
                  placeholder="Como o usuário vai te ver"
                />
              </label>
            </div>

            <div className={s.linha3}>
              <label className="fld">
                <span>OAB número</span>
                <input
                  value={form.oabNumero}
                  onChange={(e) => setForm((f) => ({ ...f, oabNumero: e.target.value }))}
                  placeholder="123456"
                />
              </label>
              <label className="fld">
                <span>OAB UF</span>
                <input
                  value={form.oabUf}
                  onChange={(e) => setForm((f) => ({ ...f, oabUf: e.target.value.toUpperCase().slice(0, 2) }))}
                  placeholder="MG"
                  maxLength={2}
                />
              </label>
              <label className="fld">
                <span>WhatsApp</span>
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="(31) 99999-9999"
                />
              </label>
            </div>

            <label className="fld">
              <span>Bio · opcional</span>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Uma linha sobre sua atuação"
                rows={2}
              />
            </label>

            <label className="fld">
              <span>Cidades que atende (separadas por vírgula)</span>
              <input
                value={form.cidades}
                onChange={(e) => setForm((f) => ({ ...f, cidades: e.target.value }))}
                placeholder="Belo Horizonte, Contagem"
              />
            </label>

            <div className={s.checks}>
              <label>
                <input
                  type="checkbox"
                  checked={form.remoto}
                  onChange={(e) => setForm((f) => ({ ...f, remoto: e.target.checked }))}
                />
                Atende remoto
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.presencial}
                  onChange={(e) => setForm((f) => ({ ...f, presencial: e.target.checked }))}
                />
                Atende presencial
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.atendeUrgencia}
                  onChange={(e) => setForm((f) => ({ ...f, atendeUrgencia: e.target.checked }))}
                />
                Atende urgência (B.O, custódia)
              </label>
            </div>

            {/* ⚠️ AS ÁREAS — por ID real, com ícone e título do backend */}
            <div className="fld">
              <span>Áreas de atuação</span>
              <div className={s.ramo}>
                <h3>Criminal</h3>
                <div className={s.areasGrid}>
                  {AREAS_CRIMINAL.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`${s.areaChip} ${form.areas.includes(a.id) ? s.areaOn : ''}`}
                      onClick={() => marcarArea(a.id)}
                    >
                      {a.ico} {a.titulo}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.ramo}>
                <h3>Pequenas Causas</h3>
                <div className={s.areasGrid}>
                  {AREAS_CIVEL.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`${s.areaChip} ${form.areas.includes(a.id) ? s.areaOn : ''}`}
                      onClick={() => marcarArea(a.id)}
                    >
                      {a.ico} {a.titulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn b-lime full" onClick={() => void salvar()} disabled={salvando}>
              {salvando ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
              Salvar perfil
            </button>
            <p className={s.notaOab}>
              A OAB precisa ser validada antes do perfil ficar visível. Trocar a OAB
              reinicia a validação.
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
