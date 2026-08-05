import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-muted-foreground">Aradığınız sayfa mevcut değil.</p>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
