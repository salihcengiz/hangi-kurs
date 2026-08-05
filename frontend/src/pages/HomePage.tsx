import { Link } from 'react-router';

/** Placeholder — hero, arama kutusu ve öne çıkan kurumlar Faz 2'de gelir. */
export function HomePage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-semibold">HangiKurs</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Dershane ve kurs merkezlerini fiyat ve performans verilerine göre karşılaştırın.
      </p>
      <Link
        to="/kurumlar"
        className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Kurumları incele
      </Link>
    </div>
  );
}
