/**
 * Shared API contract between backend and frontend.
 *
 * This is the single source of truth for the shape of data crossing the wire.
 * Both workspaces import from `@shared/types` — when you change a DTO here,
 * both sides fail to compile until they agree again. That is the point.
 *
 * Dates are ISO 8601 strings, not Date objects: they have already been through
 * JSON.stringify by the time the frontend sees them.
 */
// ---------------------------------------------------------------------------
// Enums — kept as const objects + union types rather than TS `enum` so they are
// usable in the browser bundle without importing Prisma's generated client.
// The string values must stay identical to the Prisma enum members.
// ---------------------------------------------------------------------------
export const INSTITUTION_TYPES = ['DERSHANE', 'KURS_MERKEZI', 'ETUT', 'ONLINE'];
export const EXAM_TYPES = ['YKS', 'LGS', 'KPSS', 'DIL', 'DIGER'];
/** Where a price figure came from. Never render a price without showing this. */
export const PRICE_SOURCES = ['OFFICIAL', 'USER_REPORTED', 'ESTIMATED'];
/** Where a performance figure came from. Never render one without showing this. */
export const PERFORMANCE_SOURCES = ['INSTITUTION_CLAIM', 'OSYM_PUBLIC', 'USER_REPORTED'];
export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
// ---------------------------------------------------------------------------
// Turkish display labels — the UI is Turkish, the code is English.
// Every enum that reaches the screen needs a label map here.
// ---------------------------------------------------------------------------
export const INSTITUTION_TYPE_LABELS = {
    DERSHANE: 'Dershane',
    KURS_MERKEZI: 'Kurs Merkezi',
    ETUT: 'Etüt Merkezi',
    ONLINE: 'Online',
};
export const EXAM_TYPE_LABELS = {
    YKS: 'YKS',
    LGS: 'LGS',
    KPSS: 'KPSS',
    DIL: 'Dil Sınavı',
    DIGER: 'Diğer',
};
export const PRICE_SOURCE_LABELS = {
    OFFICIAL: 'Kurum açıklaması',
    USER_REPORTED: 'Kullanıcı beyanı',
    ESTIMATED: 'Tahmini',
};
export const PERFORMANCE_SOURCE_LABELS = {
    INSTITUTION_CLAIM: 'Kurum beyanı',
    OSYM_PUBLIC: 'ÖSYM açık verisi',
    USER_REPORTED: 'Kullanıcı beyanı',
};
//# sourceMappingURL=types.js.map