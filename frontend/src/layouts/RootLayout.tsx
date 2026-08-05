import { Link, Outlet } from 'react-router';

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-foreground px-4 py-2 text-center text-sm text-background">
        Bu sitedeki tüm kurum, fiyat ve başarı verileri örnek amaçlıdır — gerçek değildir.
      </div>

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            HangiKurs
          </Link>
          <nav className="text-sm">
            <Link to="/kurumlar" className="hover:underline">
              Kurumlar
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        HangiKurs — örnek veriyle çalışan bir gösterim uygulamasıdır.
      </footer>
    </div>
  );
}
