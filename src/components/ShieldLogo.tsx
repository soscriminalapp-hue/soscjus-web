// Logo oficial do SOSC JUS — brasão real (escudo dourado/preto com diamante vermelho),
// o mesmo asset do app. Fica em public/sosc_jus_logo.png.
// Usa next/image para otimização automática.

import Image from 'next/image';

export function ShieldLogo({ size = 48 }: { size?: number }) {
  // A imagem é ~884x1095 (levemente mais alta que larga). Mantemos a proporção
  // dando altura = size e deixando a largura proporcional.
  const width = Math.round((size * 884) / 1095);
  return (
    <Image
      src="/sosc_jus_logo.png"
      alt="SOSC JUS"
      width={width}
      height={size}
      priority
      style={{ objectFit: 'contain' }}
    />
  );
}
