import s from './grade.module.css';

/** Grade de cards. Desktop-first: 2 ou 3 colunas. */
export default function Grade({
  cols = 3,
  children,
}: {
  cols?: 2 | 3;
  children: React.ReactNode;
}) {
  return <div className={`${s.grade} ${cols === 2 ? s.c2 : s.c3}`}>{children}</div>;
}
