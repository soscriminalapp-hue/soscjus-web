import { lerSaldo } from '@/lib/saldo';
import Consulta from '@/components/Consulta';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const saldo = await lerSaldo();

  return (
    <Consulta
      feature="CONSULTA_PROCESSUAL"
      icone="busca"
      cor="gold"
      titulo="Consulta Processual SOSC"
      oQueE="O pente-fino: até 200 processos da pessoa, em qualquer tribunal do Brasil. Não é uma busca casual — use quando quiser mapear tudo que existe em nome dela."
      nacional
      rota="/processos/consulta"
      saldo={saldo}
      campos={[
        {
          id: 'termo',
          rotulo: 'CPF ou CNPJ',
          placeholder: 'Só números',
          tipo: 'cpf',
          dica: 'Uma varredura rigorosa de toda a vida processual da pessoa.',
        },
      ]}
      recebe={[
        { titulo: 'Até 200 processos', texto: 'De qualquer tribunal do país — estaduais, federais, trabalhistas.' },
        { titulo: 'A capa de cada um', texto: 'Classe, assunto, vara, partes e data de distribuição.' },
        { titulo: 'O relatório', texto: 'Já vem incluído — tudo explicado, sem jargão.' },
        { titulo: 'E você vincula', texto: 'Escolha quais processos entram na sua lista. Vincular é grátis.' },
      ]}
      aviso="Consulta pontual em fontes públicas. Não monitora nem vincula o processo — isso é o Acompanhamento."
    />
  );
}
