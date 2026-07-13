import { lerSaldo } from '@/lib/saldo';
import Consulta from '@/components/Consulta';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const saldo = await lerSaldo();

  return (
    <Consulta
      feature="CONSULTA_CADASTRAL"
      icone="oab"
      cor="gold"
      titulo="Consulta Cadastral"
      oQueE="O dossiê da pessoa: ficha cadastral, antecedentes criminais e mandado de prisão — num relatório único. Busque por nome, CPF, celular ou e-mail."
      nacional
      rota="/processos/cpf/buscar"
      saldo={saldo}
      campos={[
        { id: 'cpf', rotulo: 'CPF', placeholder: 'Só números', tipo: 'cpf', opcional: true },
        { id: 'nome', rotulo: 'Nome completo', placeholder: 'Nome e sobrenome', opcional: true },
        { id: 'telefone', rotulo: 'Celular', placeholder: '(31) 99999-9999', opcional: true },
        { id: 'email', rotulo: 'E-mail', placeholder: 'email@exemplo.com', opcional: true },
      ]}
      recebe={[
        { titulo: 'Ficha cadastral', texto: 'Nome, CPF, nascimento, mãe, endereços e telefones.' },
        { titulo: 'Antecedentes criminais', texto: 'Processos e registros em nome da pessoa.' },
        { titulo: 'Mandado de prisão', texto: 'BNMP/CNJ — se existe algo em aberto.' },
        { titulo: 'Num relatório só', texto: 'As três consultas, um PDF.' },
      ]}
      aviso="Consultas oficiais em fonte pública (DirectData / BNMP). Uso conforme a LGPD — a responsabilidade pela finalidade é do advogado."
    />
  );
}
