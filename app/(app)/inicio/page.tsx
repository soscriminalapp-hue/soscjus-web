/**
 * Início — a home da estação.
 *
 * ⚠️ DUAS REGRAS QUE MANDAM NESTA TELA:
 *
 *  1. NENHUM DADO DE CLIENTE. O advogado trabalha com a tela aberta, e passa
 *     estagiário, cliente e visita atrás dele. Só números.
 *
 *  2. O PREÇO APARECE ANTES DO CLIQUE. A variação é de 26× (6 💎 → 160 💎).
 *     Se ele clica sem saber e queima 40 de uma vez, não pensa "que legal" —
 *     pensa "esse app me roubou".
 */

import { buscarSosc } from '@/lib/proxy';
import { sessaoAtual } from '@/lib/session';
import Cabecalho from '@/components/Cabecalho';
import Secao from '@/components/Secao';
import Grade from '@/components/Grade';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';

export const dynamic = 'force-dynamic';

interface Cota {
  novidades?: number;
}
interface Prazos {
  prazos?: Array<{ diasRestantes?: number }>;
}
interface Audiencias {
  audiencias?: unknown[];
}
interface Clientes {
  clients?: unknown[];
}
interface SaldoAPI {
  saldo?: { total?: number | null; ilimitado?: boolean };
}

function saudacao(h: number) {
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}
function primeiroNome(n: string) {
  return n.replace(/^Dr[aª]?\.?\s*/i, '').trim().split(/\s+/)[0] || 'Advogado';
}

export default async function Inicio() {
  const s = await sessaoAtual();
  const agora = new Date();

  const [proc, saldoR, prazos, audiencias, clientes] = await Promise.all([
    buscarSosc<Cota>('/processos/meus-processos/cota'),
    buscarSosc<SaldoAPI>('/creditos/saldo'),
    buscarSosc<Prazos>('/processos/meus-prazos?dias=180'),
    buscarSosc<Audiencias>('/processos/minhas-audiencias?dias=180'),
    buscarSosc<Clientes>('/clients'),
  ]);

  const novidades = proc.data?.novidades ?? 0;
  const listaPrazos = prazos.data?.prazos ?? [];
  const vencidos = listaPrazos.filter((p) => (p.diasRestantes ?? 0) < 0).length;
  const nAudiencias = audiencias.data?.audiencias?.length ?? 0;
  const nClientes = clientes.data?.clients?.length ?? 0;

  const ilimitado = saldoR.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Infinity : (saldoR.data?.saldo?.total ?? 0);

  return (
    <>
      <Cabecalho
        eyebrow={agora.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        titulo={`${saudacao(agora.getHours())},`}
        destaque={`${primeiroNome(s?.nome ?? '')}.`}
        texto="Cada ferramenta mostra quanto custa, antes do clique. Nenhum dado de cliente aparece nesta tela."
      />

      {/* ═══ TODO DIA ═══ */}
      <Secao titulo="O que você faz" destaque="todo dia" sub="Comece por aqui" cor="lime" />
      <Grade cols={2}>
        <Card
          grande
          familia="jur"
          icone="processo"
          titulo="Meus Processos"
          texto="Veja todos os processos em que você atua, em qualquer tribunal do Brasil. O sistema busca pela sua OAB — você não precisa cadastrar nada."
          href="/processos"
          selo={novidades > 0 ? { n: novidades } : undefined}
          estado={
            novidades > 0
              ? { texto: `${novidades} andaram hoje`, tom: 'warn' }
              : { texto: 'Grátis para abrir', tom: 'free' }
          }
        />

        <Card
          familia="risco"
          icone="agenda"
          titulo="Prazos e Audiências"
          texto="O sistema lê cada movimentação e avisa quando virou prazo ou audiência. Mas quem confere nos autos é você — isto é um aviso, não é uma certidão."
          href="/agenda"
          selo={vencidos > 0 ? { n: vencidos } : undefined}
          gratis
          estado={
            vencidos > 0
              ? { texto: `${vencidos} já venceram`, tom: 'stop' }
              : { texto: `${listaPrazos.length} prazos · ${nAudiencias} audiências`, tom: 'ok' }
          }
        />

        <Card
          grande
          familia="tech"
          icone="radar"
          titulo="Plantão Adv."
          texto={
            <>
              Diga em que áreas e cidades você atende e ligue o plantão. Quem precisa de
              advogado vê o seu cartão e decide se procura você.{' '}
              <b style={{ color: 'var(--lime)' }}>
                O SOSC JUS não escolhe por ninguém e não fica com nada.
              </b>
            </>
          }
          href="/plantao"
          acao="Ver casos"
          gratis
        />
      </Grade>

      {/* ═══ CLIENTES ═══ */}
      <Secao titulo="Seus" destaque="clientes" sub="Do contrato até receber o dinheiro" cor="rosa" />
      <Grade cols={3}>
        <Card
          familia="neutro"
          icone="clientes"
          titulo="Clientes"
          texto="Todo mundo que se vinculou a você pelo aplicativo. Cada um traz seus processos, contratos e conversas."
          href="/clientes"
          gratis
          estado={{ texto: `${nClientes} vinculados`, tom: 'free' }}
        />
        <Card
          familia="jur"
          icone="doc"
          titulo="Contrato e Procuração"
          texto="Preencha um formulário e o documento fica pronto, com a sua logomarca. Imprima ou mande o cliente assinar pelo celular."
          href="/documentos"
          gratis
        />
        <Card
          familia="dinheiro"
          icone="assinado"
          titulo="Já Assinados"
          texto="Tudo que o cliente já assinou, com a data, a selfie que ele tirou na hora e a firma. É a sua prova de que foi ele mesmo."
          href="/assinados"
          gratis
        />
        <Card
          grande
          familia="dinheiro"
          icone="dinheiro"
          titulo="Cobrar Honorários"
          texto={
            <>
              Cobre por PIX ou anexe o boleto que você gerou no seu banco.{' '}
              <b style={{ color: 'var(--lime)' }}>
                O dinheiro vai direto pra sua conta — o SOSC JUS não fica com nada.
              </b>
            </>
          }
          href="/cobrancas"
          gratis
        />
      </Grade>

      {/* ═══ CONSULTAS ═══ */}
      <Secao
        titulo="Consultas"
        sub="O preço está no card. Você nunca descobre depois de gastar."
      />
      <Grade cols={3}>
        <Card
          familia="jur"
          icone="balanca"
          titulo="Consulta Processual SOSC"
          texto="Pente-fino. Digite o CPF e veja todos os processos da pessoa no Brasil inteiro. Serve para CNPJ também."
          href="/consultas?f=processual"
          acao="Consultar"
          custa="CONSULTA_PROCESSUAL"
          saldo={saldo}
        />
        <Card
          familia="risco"
          icone="alerta"
          titulo="Consulta de Mandado"
          texto="Existe mandado de prisão em aberto contra a pessoa? Consulta o banco nacional e sai com comprovante."
          href="/consultas?f=mandado"
          acao="Consultar"
          custa="CONSULTA_MANDADO"
          saldo={saldo}
        />
        <Card
          familia="jur"
          icone="busca"
          titulo="Consulta Cadastral"
          texto="Nome, CPF, celular ou e-mail. Traz tudo da pessoa — ficha, antecedentes, e mandado se houver."
          href="/consultas?f=cadastral"
          acao="Consultar"
          custa="CONSULTA_CADASTRAL"
          saldo={saldo}
        />
        <Card
          familia="risco"
          icone="carro"
          titulo="Pente-Fino do Veículo"
          texto="Digite a placa ou tire uma foto. Modelo, ano, FIPE, restrições — e quem é o dono, com o CPF dele."
          href="/consultas?f=veiculo"
          acao="Consultar"
          custa="PENTE_FINO_VEICULO"
          saldo={saldo}
        />
        <Card
          familia="tech"
          icone="print"
          titulo="Analisar Print"
          texto="O cliente mandou print de conversa? Antes de juntar no processo, confira se a imagem foi adulterada."
          href="/consultas?f=print"
          acao="Analisar"
          gratis
        />
        <Card
          familia="neutro"
          icone="convite"
          titulo="Convidar Cliente"
          texto="Mande um convite para o cliente entrar no aplicativo. Depois que ele aceitar, vocês compartilham tudo."
          href="/clientes?convidar=1"
          acao="Convidar"
          gratis
        />
      </Grade>

      {/* ═══ FERRAMENTAS SOSC ═══ */}
      <Secao titulo="Ferramentas" destaque="SOSC" sub="Fazem o trabalho pesado por você" cor="miami" />
      <Grade cols={2}>
        <Card
          grande
          familia="mente"
          icone="balanca"
          titulo="FinaisJus Pro"
          texto={
            <>
              Jogue aqui o PDF do processo e o vídeo ou o áudio da audiência. Ele
              transcreve separando quem falou, mostra onde a testemunha se
              contradisse, aponta as nulidades e{' '}
              <b style={{ color: 'var(--pink)' }}>devolve a peça escrita.</b>
            </>
          }
          href="/finaisjus"
          custa="FINAISJUS"
          saldo={saldo}
        />
        <Card
          familia="mente"
          icone="ia"
          titulo="JurisCreator"
          texto="Procure a jurisprudência sobre um assunto. Ele acha a decisão e monta um post pronto para você publicar."
          href="/juriscreator"
          custa="JURISCREATOR"
          saldo={saldo}
        />
        <Card
          familia="jur"
          icone="relatorio"
          titulo="Relatório SOSC"
          texto="Explica o processo em linguagem que o cliente entende. Sai com a sua logomarca — e só chega nele depois que você aprovar."
          href="/relatorio"
          custa="RELATORIO"
          saldo={saldo}
        />
      </Grade>

      {/* ═══ ESCRITÓRIO ═══ */}
      <Secao titulo="Seu escritório" sub="Configure uma vez e não mexe mais" />
      <Grade cols={3}>
        <Card
          familia="dinheiro"
          icone="pix"
          titulo="Sua Chave PIX"
          texto="Sem ela você não consegue cobrar. Cadastre e o contrato já sai com a cobrança pronta."
          href="/escritorio"
          acao="Cadastrar"
          gratis
        />
        <Card
          familia="neutro"
          icone="logo"
          titulo="Sua Logomarca"
          texto="Ela entra sozinha em todo contrato, procuração e relatório que você fizer."
          href="/escritorio"
          acao="Trocar"
          gratis
        />
        <Card
          familia="neutro"
          icone="plano"
          titulo="Meus Créditos"
          texto="Veja quanto você tem, quanto custa cada ferramenta e compre mais quando precisar."
          href="/plano"
          acao="Ver"
          estado={{
            texto: ilimitado
              ? 'Ilimitado'
              : `${saldo.toLocaleString('pt-BR')} créditos`,
            tom: ilimitado || saldo > 0 ? 'ok' : 'stop',
          }}
        />
      </Grade>

      <div className="nota tech">
        <Diamante s={20} />
        <p>
          <b>O preço está sempre à vista, antes do clique.</b> Um relatório custa 6
          créditos; o FinaisJus custa 160. Você nunca descobre quanto gastou depois
          de gastar.
        </p>
      </div>

      <div className="nota">
        <Icon n="lock" s={20} />
        <p>
          <b>E o nome dos seus clientes não aparece aqui.</b> Você trabalha com a tela
          aberta. Passa estagiário, passa cliente, passa visita. Nesta tela só há
          números.
        </p>
      </div>
    </>
  );
}
