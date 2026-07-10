import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <Link href="/dashboard" className="text-dourado text-sm hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
