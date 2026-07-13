import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import Icon from '@/components/Icon';
import s from './assinados.module.css';

export const dynamic = 'force-dynamic';

/**
 * ✍️ JÁ ASSINADOS — os documentos que o cliente assinou.
 *
 * ⚠️ A assinatura acontece NO CELULAR (selfie + biometria). Aqui ele
 *    CONSULTA, BAIXA e IMPRIME — que é o que o computador faz melhor.
 */

interface Cliente { id: string; fullName?: string }
interface Doc {
  id: string;
  kind?: string;
  title?: string;
  signedAt?: string;
  clientName?: string;
}

export default async function Assinados() {
  const cl = await buscarSosc<{ clients?: Cliente[] }>('/clients');
  const clientes = cl.data?.clients ?? [];

  // busca os assinados de cada cliente
  const todos: Array<Doc & { clientId: string }> = [];
  await Promise.all(
    clientes.map(async (c) => {
      const r = await buscarSosc<{ documents?: Doc[]; assinados?: Doc[] }>(
        `/documents/assinados/${c.id}`,
      );
      const ds = r.data?.documents ?? r.data?.assinados ?? [];
      for (const d of ds) {
        todos.push({ ...d, clientId: c.id, clientName: d.clientName ?? c.fullName });
      }
    }),
  );

  todos.sort(
    (a, b) => new Date(b.signedAt ?? 0).getTime() - new Date(a.signedAt ?? 0).getTime(),
  );

  return (
    <>
      <header className={s.topo}>
        <div>
          <h1>Já Assinados</h1>
          <p>
            Os documentos que seus clientes assinaram — com selfie, biometria e
            carimbo de tempo. Baixe o PDF ou imprima.
          </p>
        </div>
      </header>

      {todos.length === 0 ? (
        <div className={`card ${s.vazio}`}>
          <Icon n="assinado" s={38} />
          <p>Nenhum documento assinado ainda.</p>
          <small>
            Monte o contrato ou a procuração em <b>Contrato e Procuração</b> e mande
            para o cliente assinar no aplicativo.
          </small>
          <Link href="/documentos" className="btn b-gold">
            <Icon n="doc" s={17} />
            Ir para os documentos
          </Link>
        </div>
      ) : (
        <div className={s.lista}>
          {todos.map((d) => (
            <article key={d.id} className={`card ${s.doc}`}>
              <span className={s.ic}>
                <Icon n="assinado" s={20} />
              </span>

              <div className={s.di}>
                <strong>{d.title ?? d.kind ?? 'Documento'}</strong>
                <small>{d.clientName ?? '—'}</small>
                {d.signedAt ? (
                  <em className="num">
                    assinado em {new Date(d.signedAt).toLocaleDateString('pt-BR')}
                  </em>
                ) : null}
              </div>

              <a
                href={`/api/sosc/documents/assinados/${d.clientId}/${d.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn b-ghost sm"
              >
                <Icon n="baixar" s={15} />
                PDF
              </a>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
