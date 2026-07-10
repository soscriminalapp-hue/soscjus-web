// Folha A4 branca — o documento renderizado.
// Espelha o layout do gerar-pdf-documento.ts do backend:
//   - título centralizado, maiúsculo, Times-Bold 16pt
//   - corpo justificado, Times-Roman 12pt
//   - parágrafos separados por linha em branco (split /\n{2,}/)
// É o ÚNICO elemento visível na impressão (ver .folha-a4 em globals.css).

interface Props {
  titulo: string;
  corpo: string;
}

export function FolhaA4({ titulo, corpo }: Props) {
  // Divide em parágrafos como o backend: quebra dupla separa; quebra simples
  // vira espaço dentro do parágrafo (texto corrido justificado).
  const paragrafos = corpo.split(/\n{2,}/);

  return (
    <div className="folha-a4">
      <h1>{titulo}</h1>
      {paragrafos.map((par, i) => (
        <p key={i}>{par}</p>
      ))}
    </div>
  );
}
