import s from './secao.module.css';

/**
 * Secao.tsx — o título de seção.
 * ASSINATURA: o traço colorido embaixo, e uma palavra em destaque.
 */

export default function Secao({
  titulo,
  destaque,
  sub,
  cor = 'gold',
}: {
  titulo: string;
  /** A palavra que ganha a cor da marca. */
  destaque?: string;
  sub?: string;
  cor?: 'gold' | 'lime' | 'miami' | 'rosa';
}) {
  return (
    <div className={`${s.sec} ${s[cor]}`}>
      <h2>
        {titulo}
        {destaque ? (
          <>
            {' '}
            <mark>{destaque}</mark>
          </>
        ) : null}
      </h2>
      {sub ? <p>{sub}</p> : null}
      <div className={s.traco} />
    </div>
  );
}
