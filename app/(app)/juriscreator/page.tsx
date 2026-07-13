import { env } from '@/lib/env';
import { lerSaldo } from '@/lib/saldo';
import Icon from '@/components/Icon';
import Token from '@/components/Token';
import s from './juriscreator.module.css';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ✨ JURISCREATOR — a estação LINKA, não reimplementa
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ O JurisCreator JÁ EXISTE, e roda em juriscreator.soscriminal.com.br.
 *
 *     O backend SOSC só controla o CRÉDITO dele (/juriscreator/credito) —
 *     a geração acontece lá. Não existe rota /juriscreator/gerar.
 *
 *     Reimplementar aqui seria: duplicar código, duplicar bug, e ter duas
 *     versões pra manter. A estação LINKA. É a mesma conta.
 *
 *  ⚠️ E ele é 📱 MELHOR NO CELULAR — porque é ferramenta de INSTAGRAM:
 *
 *       No celular: gera → COMPARTILHA. Três toques.
 *       Aqui:       gera → baixa → manda pro telefone → abre o Insta → sobe.
 *
 *     A estação DIZ isso. Não bloqueia — avisa.
 */

export default async function JurisCreator() {
  const saldo = await lerSaldo();

  return (
    <>
      <header className={s.topo}>
        <span className={s.ic}>
          <Icon n="ia" s={26} />
        </span>
        <div>
          <h1>JurisCreator</h1>
          <p>
            Escreva o tema da decisão. Ele acha a jurisprudência e monta o post — com
            a legenda pronta para o Instagram.
          </p>
        </div>
        <Token n={3_000} saldo={saldo} />
      </header>

      {/* 📱 A VERDADE — é melhor no celular, e a gente diz por quê */}
      <section className={`card ${s.honesto}`}>
        <div className="card-b">
          <div className={s.hTopo}>
            <span className={s.hIc}>
              <Icon n="celular" s={26} />
            </span>
            <div>
              <h2>É muito melhor no celular</h2>
              <p>
                O JurisCreator é ferramenta de <b>Instagram</b>, não de escritório.
              </p>
            </div>
          </div>

          <div className={s.compara}>
            <div className={s.bom}>
              <header>
                <Icon n="celular" s={17} />
                No celular
              </header>
              <ol>
                <li>Escreve o tema</li>
                <li>Sai o criativo + a legenda</li>
                <li>
                  <b>Compartilha direto no Instagram</b>
                </li>
              </ol>
              <em>Três toques.</em>
            </div>

            <div className={s.ruim}>
              <header>
                <Icon n="monitor" s={17} />
                No computador
              </header>
              <ol>
                <li>Escreve o tema</li>
                <li>Sai o criativo</li>
                <li>Baixa a imagem</li>
                <li>Manda pro celular</li>
                <li>Abre o Instagram</li>
                <li>Sobe</li>
              </ol>
              <em>Seis passos — e o post é o mesmo.</em>
            </div>
          </div>

          <p className={s.hNota}>
            Por isso a estação não reimplementa o JurisCreator: ela te leva até ele.
            <b> É a mesma conta</b> — o mesmo saldo de tokens.
          </p>
        </div>
      </section>

      {/* ─── OS DOIS CAMINHOS ─── */}
      <div className={s.caminhos}>
        <a
          href={env.JURISCREATOR}
          target="_blank"
          rel="noopener noreferrer"
          className={`card ${s.caminho} ${s.web}`}
        >
          <span className={`${s.cIc} ${s.cMind}`}>
            <Icon n="monitor" s={22} />
          </span>
          <div>
            <strong>Abrir o JurisCreator aqui</strong>
            <small>
              No navegador, na tela grande. Você gera e baixa — depois manda pro
              celular para postar.
            </small>
          </div>
          <Icon n="externo" s={17} className={s.seta} />
        </a>

        <a
          href="https://apps.apple.com/br/app/sosc-jus/id6770715490"
          target="_blank"
          rel="noopener noreferrer"
          className={`card ${s.caminho} ${s.app}`}
        >
          <span className={`${s.cIc} ${s.cLime}`}>
            <Icon n="celular" s={22} />
          </span>
          <div>
            <strong>Usar no aplicativo</strong>
            <small>
              <b>Recomendado.</b> Gera e compartilha no Instagram na hora — sem baixar
              nada.
            </small>
          </div>
          <Icon n="externo" s={17} className={s.seta} />
        </a>
      </div>

      {/* ─── O QUE ELE FAZ ─── */}
      <section className={`card ${s.oQue}`}>
        <div className="card-h">
          <h2>
            <Icon n="ok" s={17} strokeWidth={2.4} />O que ele entrega
          </h2>
        </div>
        <div className="card-b">
          <ul>
            <li>
              <strong>A jurisprudência</strong>
              <span>
                Ele procura a decisão sobre o tema — STF, STJ, tribunais estaduais.
              </span>
            </li>
            <li>
              <strong>O criativo</strong>
              <span>
                Feed 4:5 ou Story 9:16. Quatro modelos: Jornal, Informativo, Matéria e
                Destaque.
              </span>
            </li>
            <li>
              <strong>A legenda pronta</strong>
              <span>
                Com a explicação, os hashtags e a fonte. É só colar.
              </span>
            </li>
            <li>
              <strong>Com a sua logo</strong>
              <span>A que você subiu em Escritório. Sai em todo criativo.</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
