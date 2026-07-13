import { lerSaldo } from '@/lib/saldo';
import Consulta from '@/components/Consulta';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const saldo = await lerSaldo();

  return (
    <Consulta
      feature="CONSULTA_MANDADO"
      icone="alerta"
      cor="risk"
      titulo="Consulta de Mandado"
      oQueE="Existe mandado de prisão em aberto contra a pessoa? Consulta o Banco Nacional de Mandados de Prisão (BNMP/CNJ) e sai com o comprovante."
      nacional
      rota="/processos/mandado/consulta"
      saldo={saldo}
      campos={[
        { id: 'cpf', rotulo: 'CPF', placeholder: 'Só números', tipo: 'cpf' },
        { id: 'nome', rotulo: 'Nome completo', placeholder: 'Nome da pessoa' },
        {
          id: 'nomeMae',
          rotulo: 'Nome da mãe',
          placeholder: 'Refina o resultado',
          opcional: true,
        },
      ]}
      recebe={[
        { titulo: 'BNMP/CNJ nacional', texto: 'A base oficial do Conselho Nacional de Justiça.' },
        { titulo: 'O comprovante', texto: 'Relatório em PDF, com data e hora da consulta.' },
        { titulo: 'Todos os tipos', texto: 'Prisão, busca e apreensão, intimação, condução coercitiva.' },
      ]}
      aviso="Consulta em fonte oficial. O resultado reflete os registros no momento da consulta."
    />
  );
}
