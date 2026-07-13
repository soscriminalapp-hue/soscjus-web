/**
 * /abrir NÃO passa pelo Shell.
 *
 * É uma página pública, aberta no CELULAR, sem login. Ela não tem sidebar,
 * não tem topbar, não tem sessão.
 */
export default function LayoutAbrir({ children }: { children: React.ReactNode }) {
  return children;
}
