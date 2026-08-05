import { InstitutionCard } from '@/components/InstitutionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getInstitutions } from '@/lib/api';

export function InstitutionsListPage() {
  const { data, error, isLoading } = useAsyncData(getInstitutions, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Kurumlar</h1>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {!isLoading && error && <p className="text-muted-foreground">{error}</p>}

      {!isLoading && !error && data && data.length === 0 && (
        <p className="text-muted-foreground">Henüz listelenecek kurum yok.</p>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((institution) => (
            <InstitutionCard key={institution.id} institution={institution} />
          ))}
        </div>
      )}
    </div>
  );
}
