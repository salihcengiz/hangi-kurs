import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  CURRENT_ACADEMIC_YEAR,
  PREVIOUS_ACADEMIC_YEAR,
  REVIEW_ALIASES,
  REVIEW_BODIES,
  SEED_INSTITUTIONS,
  type SeedProgram,
} from './seed-data.js';

/**
 * Populates the database with fictional demo data.
 *
 * Idempotent: it wipes the tables it owns and rewrites them, so running it
 * twice leaves the same database as running it once.
 *
 * Deterministic: all "randomness" comes from a fixed-seed PRNG, so every
 * teammate ends up with byte-identical data and screenshots/bug reports line up.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[seed] DATABASE_URL is not set. Copy backend/.env.example to backend/.env.');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// --- deterministic PRNG -----------------------------------------------------

/** mulberry32 — small, fast, good enough for demo data, and reproducible. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20240731);

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('pick() called with an empty array');
  return item;
}

// --- helpers ----------------------------------------------------------------

/**
 * Previous year's price, derived from the current one.
 *
 * The point of storing it is to exercise the append-only price history: the
 * detail page must show that a price changed and where each figure came from.
 */
function previousYearPrice(currentPrice: number): number {
  const inflationFactor = 0.72 + random() * 0.08; // last year was 72–80% of today
  return Math.round((currentPrice * inflationFactor) / 500) * 500;
}

/** Sub-scores wobble around the overall rating but stay inside 1–5. */
function subScore(rating: number): number {
  return Math.min(5, Math.max(1, rating + randomInt(-1, 1)));
}

function reviewBodyFor(rating: number): string {
  if (rating <= 2) return pick(REVIEW_BODIES.low);
  if (rating === 3) return pick(REVIEW_BODIES.mid);
  return pick(REVIEW_BODIES.high);
}

/**
 * Ratings are drawn from a distribution that leans positive but leaves room for
 * bad reviews — a seed where everything is 4.8 stars makes sorting and filtering
 * impossible to test.
 */
function drawRating(): number {
  const roll = random();
  if (roll < 0.06) return 1;
  if (roll < 0.16) return 2;
  if (roll < 0.36) return 3;
  if (roll < 0.7) return 4;
  return 5;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// --- seeding ----------------------------------------------------------------

async function clearDatabase(): Promise<void> {
  // Child tables first. Cascades would handle this, but being explicit keeps
  // the intent obvious and survives future schema changes.
  await prisma.priceRecord.deleteMany();
  await prisma.review.deleteMany();
  await prisma.performanceRecord.deleteMany();
  await prisma.program.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.institution.deleteMany();
}

function buildPriceRecords(program: SeedProgram) {
  const previousListPrice = previousYearPrice(program.listPrice);

  return [
    {
      academicYear: PREVIOUS_ACADEMIC_YEAR,
      listPrice: previousListPrice,
      discountedPrice: null,
      installmentCount: program.installmentCount,
      currency: 'TRY',
      source: program.priceSource,
      sourceNote: `${program.priceSourceNote} (önceki döneme ait arşiv kaydı)`,
      recordedAt: daysAgo(randomInt(380, 420)),
    },
    {
      academicYear: CURRENT_ACADEMIC_YEAR,
      listPrice: program.listPrice,
      discountedPrice: program.discountedPrice,
      installmentCount: program.installmentCount,
      currency: 'TRY',
      source: program.priceSource,
      sourceNote: program.priceSourceNote,
      recordedAt: daysAgo(randomInt(20, 90)),
    },
  ];
}

function buildReviews(institutionSlug: string) {
  const approvedCount = randomInt(5, 15);
  const pendingCount = randomInt(1, 2);

  const reviews = [];

  for (let index = 0; index < approvedCount; index += 1) {
    const rating = drawRating();
    reviews.push({
      authorAlias: pick(REVIEW_ALIASES),
      rating,
      teachingScore: subScore(rating),
      facilityScore: subScore(rating),
      guidanceScore: subScore(rating),
      valueScore: subScore(rating),
      body: reviewBodyFor(rating),
      attendedYear: randomInt(2021, 2024),
      status: 'APPROVED' as const,
      createdAt: daysAgo(randomInt(10, 700)),
    });
  }

  // Unmoderated reviews exist in every institution so the moderation rule is
  // visibly enforced: these must never appear in any API response.
  for (let index = 0; index < pendingCount; index += 1) {
    const rating = drawRating();
    reviews.push({
      authorAlias: `${pick(REVIEW_ALIASES)} (moderasyon bekliyor)`,
      rating,
      teachingScore: subScore(rating),
      facilityScore: subScore(rating),
      guidanceScore: subScore(rating),
      valueScore: subScore(rating),
      body: `[${institutionSlug}] ${reviewBodyFor(rating)}`,
      attendedYear: randomInt(2022, 2024),
      status: 'PENDING' as const,
      createdAt: daysAgo(randomInt(1, 9)),
    });
  }

  return reviews;
}

async function main(): Promise<void> {
  console.log('[seed] Clearing existing data...');
  await clearDatabase();

  console.log(`[seed] Inserting ${SEED_INSTITUTIONS.length} fictional institutions...`);

  for (const institution of SEED_INSTITUTIONS) {
    await prisma.institution.create({
      data: {
        slug: institution.slug,
        name: institution.name,
        brand: institution.brand,
        type: institution.type,
        description: institution.description,
        foundedYear: institution.foundedYear,
        website: institution.website,
        phone: institution.phone,
        logoUrl: null,
        isVerified: institution.isVerified,

        branches: { create: institution.branches },

        programs: {
          create: institution.programs.map((program) => ({
            name: program.name,
            examType: program.examType,
            targetGrade: program.targetGrade,
            weeklyHours: program.weeklyHours,
            classSize: program.classSize,
            durationMonths: program.durationMonths,
            includesMaterials: program.includesMaterials,
            includesEtut: program.includesEtut,
            priceRecords: { create: buildPriceRecords(program) },
          })),
        },

        performanceRecords: {
          create: institution.performance.map((record) => ({
            academicYear: record.academicYear,
            examType: record.examType,
            studentCount: record.studentCount,
            avgNetIncrease: record.avgNetIncrease,
            top1000Count: record.top1000Count,
            placementRate: record.placementRate,
            source: record.source,
            sourceNote: record.sourceNote,
            verifiedAt: record.verified ? daysAgo(randomInt(30, 200)) : null,
          })),
        },

        reviews: { create: buildReviews(institution.slug) },
      },
    });
  }

  const [institutions, branches, programs, prices, performance, approved, pending] =
    await Promise.all([
      prisma.institution.count(),
      prisma.branch.count(),
      prisma.program.count(),
      prisma.priceRecord.count(),
      prisma.performanceRecord.count(),
      prisma.review.count({ where: { status: 'APPROVED' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
    ]);

  console.log('\n[seed] Done. Row counts:');
  console.log(`  institutions        ${institutions}`);
  console.log(`  branches            ${branches}`);
  console.log(`  programs            ${programs}`);
  console.log(`  price records       ${prices}`);
  console.log(`  performance records ${performance}`);
  console.log(`  reviews (APPROVED)  ${approved}`);
  console.log(`  reviews (PENDING)   ${pending}`);
  console.log('\n[seed] Reminder: every institution above is fictional.\n');
}

main()
  .catch((error: unknown) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
