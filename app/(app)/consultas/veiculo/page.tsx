import { lerSaldo } from '@/lib/saldo';
import Consulta from '@/components/Consulta';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const saldo = await lerSaldo();

  return (
    <Consulta
      feature="PENTE_FINO_VEICULO"
      icone="carro"
      cor="mind"
      titulo="Consultar Veículo"
      oQueE="Pela placa: quem é o dono, quanto vale, e o que pesa sobre ele — inclusive penhora judicial (RENAJUD), roubo, leilão e chassi remarcado."
      nacional
      rota="/processos/veiculo/consultar"
      saldo={saldo}
      campos={[
        {
          id: 'placa',
          rotulo: 'Placa do veículo',
          placeholder: 'ABC1D23 ou ABC-1234',
          tipo: 'placa',
          dica: '📱 No celular você fotografa a placa — o app lê sozinho.',
        },
      ]}
      recebe={[
        { titulo: '🔴 Restrições', texto: 'RENAJUD (penhora judicial) · roubo e furto · Receita Federal · leilão · infrações · comunicado de venda · recall · chassi remarcado.' },
        { titulo: '💰 Valor de mercado', texto: 'Tabela FIPE, com o mês de referência.' },
        { titulo: '👤 Proprietário', texto: 'Nome e CPF/CNPJ — e daí você já consulta a ficha completa dele.' },
        { titulo: '🚗 O veículo', texto: 'Marca, modelo, ano, cor, combustível, categoria, situação, UF.' },
        { titulo: '🔧 Identificação', texto: 'Chassi, RENAVAM, motor, câmbio, potência, cilindrada, eixos.' },
      ]}
      aviso="Consulta em fonte oficial (DETRAN/SENATRAN via DirectData). Uso conforme a LGPD — a responsabilidade pela finalidade é do advogado."
    />
  );
}
