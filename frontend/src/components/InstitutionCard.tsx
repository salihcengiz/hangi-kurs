import { Link } from 'react-router';
import { INSTITUTION_TYPE_LABELS, type InstitutionSummaryDto } from '@shared/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

export function InstitutionCard({ institution }: { institution: InstitutionSummaryDto }) {
  return (
    <Link to={`/kurum/${institution.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:border-foreground/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{institution.name}</CardTitle>
            <Badge variant="secondary">{INSTITUTION_TYPE_LABELS[institution.type]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="line-clamp-2">{institution.description}</p>

          {institution.cities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {institution.cities.map((city) => (
                <Badge key={city} variant="outline">
                  {city}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-foreground">
            <span>
              {institution.rating.average !== null
                ? `★ ${institution.rating.average.toFixed(1)} (${institution.rating.count})`
                : 'Henüz puan yok'}
            </span>
            <span className="font-medium">
              {institution.minPrice !== null
                ? `${formatCurrency(institution.minPrice)}'den`
                : 'Fiyat yok'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
