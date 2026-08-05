import { useParams } from 'react-router';
import {
  EXAM_TYPE_LABELS,
  INSTITUTION_TYPE_LABELS,
  PERFORMANCE_SOURCE_LABELS,
  PRICE_SOURCE_LABELS,
} from '@shared/types';
import { SourceLabel } from '@/components/SourceLabel';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getInstitutionBySlug } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';

export function InstitutionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: institution, error, isLoading } = useAsyncData(
    () => getInstitutionBySlug(slug!),
    [slug],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <p className="text-muted-foreground">{error}</p>;
  }

  if (!institution) {
    return <p className="text-muted-foreground">Kurum bulunamadı.</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">{institution.name}</h1>
            {institution.brand && <p className="text-muted-foreground">{institution.brand}</p>}
          </div>
          <Badge variant="secondary">{INSTITUTION_TYPE_LABELS[institution.type]}</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{institution.description}</p>
        <p className="mt-3">
          {institution.rating.average !== null ? (
            <>
              ★ {institution.rating.average.toFixed(1)}{' '}
              <span className="text-muted-foreground">({institution.rating.count} yorum)</span>
            </>
          ) : (
            <span className="text-muted-foreground">Henüz puan yok</span>
          )}
        </p>
      </section>

      <Separator />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Programlar ve Fiyatlar</h2>
        {institution.programs.length === 0 ? (
          <p className="text-muted-foreground">Henüz program bilgisi yok.</p>
        ) : (
          <div className="space-y-4">
            {institution.programs.map((program) => {
              const currentPrice = program.priceRecords[0];
              return (
                <div key={program.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">{program.name}</h3>
                    <Badge variant="outline">{EXAM_TYPE_LABELS[program.examType]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {program.targetGrade ?? 'Tüm seviyeler'} · Haftalık {program.weeklyHours} saat ·
                    Sınıf mevcudu {program.classSize}
                  </p>

                  {currentPrice ? (
                    <div className="mt-3 flex flex-wrap items-baseline gap-3">
                      <span className="text-lg font-semibold">
                        {formatCurrency(currentPrice.discountedPrice ?? currentPrice.listPrice)}
                      </span>
                      {currentPrice.discountedPrice !== null && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(currentPrice.listPrice)}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {currentPrice.installmentCount > 1
                          ? `${currentPrice.installmentCount} taksit`
                          : 'Peşin'}
                      </span>
                      <SourceLabel>{PRICE_SOURCE_LABELS[currentPrice.source]}</SourceLabel>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">Fiyat bilgisi yok.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Başarı Verileri</h2>
        {institution.performanceRecords.length === 0 ? (
          <p className="text-muted-foreground">Henüz başarı verisi paylaşılmamış.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yıl</TableHead>
                  <TableHead>Sınav</TableHead>
                  <TableHead>Öğrenci</TableHead>
                  <TableHead>Ort. Net Artışı</TableHead>
                  <TableHead>İlk 1000</TableHead>
                  <TableHead>Yerleşme Oranı</TableHead>
                  <TableHead>Kaynak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institution.performanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.academicYear}</TableCell>
                    <TableCell>{EXAM_TYPE_LABELS[record.examType]}</TableCell>
                    <TableCell>{record.studentCount ?? '—'}</TableCell>
                    <TableCell>{record.avgNetIncrease ?? '—'}</TableCell>
                    <TableCell>{record.top1000Count ?? '—'}</TableCell>
                    <TableCell>
                      {record.placementRate !== null ? `%${record.placementRate}` : '—'}
                    </TableCell>
                    <TableCell>
                      <SourceLabel>{PERFORMANCE_SOURCE_LABELS[record.source]}</SourceLabel>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Şubeler</h2>
        {institution.branches.length === 0 ? (
          <p className="text-muted-foreground">Şube bilgisi yok.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {institution.branches.map((branch) => (
              <li key={branch.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">{branch.name}</p>
                <p className="text-muted-foreground">
                  {branch.district}, {branch.city}
                </p>
                <p className="text-muted-foreground">{branch.address}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Yorumlar</h2>
        {institution.reviews.length === 0 ? (
          <p className="text-muted-foreground">Henüz onaylı yorum yok.</p>
        ) : (
          <ul className="space-y-4">
            {institution.reviews.map((review) => (
              <li key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.authorAlias}</span>
                  <span>★ {review.rating}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
