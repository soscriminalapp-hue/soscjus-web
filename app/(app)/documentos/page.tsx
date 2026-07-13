import { buscarSosc } from '@/lib/proxy';
import { sessaoAtual } from '@/lib/session';
import Editor from './Editor';

export const dynamic = 'force-dynamic';

/**
 * 📄 CONTRATO E PROCURAÇÃO — o editor de verdade.
 *
 * ⚠️ NO CELULAR NINGUÉM ESCREVE CONTRATO.
 *
 *    É o hábito de 30 anos: ele senta no computador e DIGITA. Se o sistema
 *    impõe um modelo fechado, ele volta pro Word — e a gente perde.
 *
 *    Então: modelo pronto, mas ELE EDITA À VONTADE. E ainda pode:
 *      · copiar formatado → cola no Word
 *      · baixar .doc
 *      · imprimir (Ctrl+P) com a logo dele
 *
 *    Tudo nativo do navegador. Zero biblioteca.
 */

interface Template { kind?: string; title?: string; body?: string }
interface Cliente { id: string; fullName?: string; cpf?: string }

export default async function Page() {
  const ses = await sessaoAtual();

  const [proc, hon, cli, adv] = await Promise.all([
    buscarSosc<Template>('/documents/PROCURACAO'),
    buscarSosc<Template>('/documents/HONORARIOS'),
    buscarSosc<{ clients?: Cliente[] }>('/clients'),
    buscarSosc<{ officeName?: string; logoUrl?: string; address?: string }>('/lawyers/me'),
  ]);

  return (
    <Editor
      procuracao={proc.data ?? null}
      honorarios={hon.data ?? null}
      clientes={cli.data?.clients ?? []}
      advogado={{
        nome: ses?.nome ?? '',
        oab: ses?.oab ?? '',
        escritorio: adv.data?.officeName ?? '',
        endereco: adv.data?.address ?? '',
        logo: adv.data?.logoUrl ?? '',
      }}
    />
  );
}
