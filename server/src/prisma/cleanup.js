/**
 * One-off maintenance script: removes duplicate + test data left behind by
 * running the seed twice and by manual admin-panel testing during Phase 5.
 *
 * Safe to re-run — every step is idempotent. Pass --dry to preview.
 *
 *   node src/prisma/cleanup.js --dry
 *   node src/prisma/cleanup.js
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DRY = process.argv.includes("--dry");
const log = (...a) => console.log(DRY ? "[dry]" : "[run]", ...a);

const CANONICAL_ADMIN = "admin@footballclub.demo";

// The squad as defined in seed.js — used to restore anything deleted during testing.
const SEED_SQUAD = [
  { name: "Callum Naylor", position: "GK", number: 1, goals: 0, assists: 0, appearances: 29, cleanSheets: 11, bio: "Shot-stopper with the best clean-sheet record in the division." },
  { name: "Marcus Reid", position: "DEF", number: 4, goals: 4, assists: 1, appearances: 31, cleanSheets: 0, bio: "Club captain, centre back." },
  { name: "Kian Broughton", position: "DEF", number: 3, goals: 1, assists: 2, appearances: 30, cleanSheets: 0, bio: null },
  { name: "Jamie Oduya", position: "MID", number: 8, goals: 7, assists: 9, appearances: 28, cleanSheets: 0, bio: null },
  { name: "Sam Ellery", position: "MID", number: 7, goals: 9, assists: 6, appearances: 27, cleanSheets: 0, bio: null },
  { name: "Tomás Ferreira", position: "FWD", number: 9, goals: 18, assists: 4, appearances: 27, cleanSheets: 0, bio: null },
];

const SEED_NAMES = new Set(SEED_SQUAD.map((p) => p.name));

async function main() {
  // ---- 1. Players: drop anything not in the canonical squad -----------------
  const players = await prisma.player.findMany({ orderBy: { id: "asc" } });
  const strayPlayers = players.filter((p) => !SEED_NAMES.has(p.name));

  for (const p of strayPlayers) {
    log(`delete player  #${p.number} ${p.name} (id ${p.id})`);
    if (!DRY) await prisma.player.delete({ where: { id: p.id } });
  }

  // ---- 2. Players: de-duplicate by name, keeping the lowest id -------------
  const seenNames = new Map();
  for (const p of players.filter((p) => SEED_NAMES.has(p.name))) {
    if (seenNames.has(p.name)) {
      log(`delete player  duplicate "${p.name}" (id ${p.id})`);
      if (!DRY) await prisma.player.delete({ where: { id: p.id } });
    } else {
      seenNames.set(p.name, p.id);
    }
  }

  // ---- 3. Players: restore any seed member deleted during testing ----------
  for (const p of SEED_SQUAD) {
    if (!seenNames.has(p.name)) {
      log(`restore player #${p.number} ${p.name}`);
      if (!DRY) await prisma.player.create({ data: p });
    }
  }

  // ---- 4. Fixtures: de-duplicate by (opponent, date, homeAway) -------------
  const fixtures = await prisma.fixture.findMany({
    orderBy: { id: "asc" },
    include: { result: true },
  });

  const seenFixtures = new Set();
  const dupes = [];
  for (const f of fixtures) {
    const key = `${f.opponent}|${f.date.toISOString()}|${f.homeAway}`;
    if (seenFixtures.has(key)) dupes.push(f);
    else seenFixtures.add(key);
  }

  for (const f of dupes) {
    log(`delete fixture duplicate "${f.opponent}" ${f.date.toISOString().slice(0, 10)} (id ${f.id})`);
    if (!DRY) {
      // Result FK is ON DELETE RESTRICT — the child row must go first.
      if (f.result) await prisma.result.delete({ where: { fixtureId: f.id } });
      await prisma.fixture.delete({ where: { id: f.id } });
    }
  }

  // ---- 5. Fixtures: drop test entries left from manual verification --------
  const KNOWN_OPPONENTS = new Set([
    "Denby Vale",
    "Marlpit Wanderers",
    "Ashfield Rovers",
  ]);
  const remaining = await prisma.fixture.findMany({ include: { result: true } });
  for (const f of remaining) {
    if (!KNOWN_OPPONENTS.has(f.opponent)) {
      log(`delete fixture test entry "${f.opponent}" (id ${f.id})`);
      if (!DRY) {
        if (f.result) await prisma.result.delete({ where: { fixtureId: f.id } });
        await prisma.fixture.delete({ where: { id: f.id } });
      }
    }
  }

  // ---- 6. Admin users: keep only the canonical account ---------------------
  const admins = await prisma.adminUser.findMany({ orderBy: { id: "asc" } });
  const canonical = admins.find((a) => a.email === CANONICAL_ADMIN);

  if (!canonical) {
    log(`create admin   ${CANONICAL_ADMIN}`);
    if (!DRY) {
      await prisma.adminUser.create({
        data: {
          email: CANONICAL_ADMIN,
          passwordHash: await bcrypt.hash("changeme123", 10),
        },
      });
    }
  }

  for (const a of admins) {
    if (a.email !== CANONICAL_ADMIN) {
      log(`delete admin   stale account ${a.email} (id ${a.id})`);
      if (!DRY) await prisma.adminUser.delete({ where: { id: a.id } });
    }
  }

  // ---- Summary -------------------------------------------------------------
  if (!DRY) {
    const [pc, fc, rc, ac] = await Promise.all([
      prisma.player.count(),
      prisma.fixture.count(),
      prisma.result.count(),
      prisma.adminUser.count(),
    ]);
    console.log(
      `\nFinal state: ${pc} players, ${fc} fixtures, ${rc} results, ${ac} admin user(s).`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
