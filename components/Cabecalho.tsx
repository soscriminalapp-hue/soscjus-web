import s from './cabecalho.module.css';

/** Cabeçalho de página. ASSINATURA: o traço tricolor sob o título. */
export default function Cabecalho({
  eyebrow,
  titulo,
  destaque,
  tom = 'gold',
  texto,
  acoes,
}: {
  eyebrow?: string;
  titulo: string;
  destaque?: string;
  tom?: 'gold' | 'risk' | 'tech' | 'mind' | 'money' | 'lime';
  texto?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <header className={s.cab}>
      <div>
        {eyebrow ? <span className={`${s.eb} ${s[tom]}`}>{eyebrow}</span> : null}
        <h1 className={s.h1}>
          {titulo}
          {destaque ? (
            <>
              {' '}
              <em className={s[tom]}>{destaque}</em>
            </>
          ) : null}
        </h1>
        {texto ? <p className={s.txt}>{texto}</p> : null}
      </div>
      {acoes ? <div className={s.acoes}>{acoes}</div> : null}
    </header>
  );
}
