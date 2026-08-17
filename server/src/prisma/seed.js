import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@footballclub.demo" },
    update: {},
    create: { email: "admin@footballclub.demo", passwordHash },
  });

  // Players
  const players = [
    {
      name: "Callum Naylor",
      position: "GK",
      number: 1,
      goals: 0,
      assists: 0,
      appearances: 29,
      cleanSheets: 11,
    },
    {
      name: "Marcus Reid",
      position: "DEF",
      number: 4,
      goals: 4,
      assists: 1,
      appearances: 31,
      cleanSheets: 0,
      bio: "Club captain, centre back.",
    },
    {
      name: "Kian Broughton",
      position: "DEF",
      number: 3,
      goals: 1,
      assists: 2,
      appearances: 30,
      cleanSheets: 0,
    },
    {
      name: "Jamie Oduya",
      position: "MID",
      number: 8,
      goals: 7,
      assists: 9,
      appearances: 28,
      cleanSheets: 0,
    },
    {
      name: "Sam Ellery",
      position: "MID",
      number: 7,
      goals: 9,
      assists: 6,
      appearances: 27,
      cleanSheets: 0,
    },
    {
      name: "Tomás Ferreira",
      position: "FWD",
      number: 9,
      goals: 18,
      assists: 4,
      appearances: 27,
      cleanSheets: 0,
    },
  ];

  for (const p of players) {
    await prisma.player.upsert({
      where: { id: players.indexOf(p) + 1 },
      update: {},
      create: p,
    });
  }

  // Fixtures + a couple of completed results
  const fixture1 = await prisma.fixture.create({
    data: {
      opponent: "Denby Vale",
      date: new Date("2026-08-16T15:00:00Z"),
      homeAway: "HOME",
      status: "COMPLETED",
    },
  });
  await prisma.result.create({
    data: { fixtureId: fixture1.id, homeScore: 3, awayScore: 1, outcome: "W" },
  });

  const fixture2 = await prisma.fixture.create({
    data: {
      opponent: "Marlpit Wanderers",
      date: new Date("2026-08-09T15:00:00Z"),
      homeAway: "AWAY",
      status: "COMPLETED",
    },
  });
  await prisma.result.create({
    data: { fixtureId: fixture2.id, homeScore: 1, awayScore: 1, outcome: "D" },
  });

  await prisma.fixture.create({
    data: {
      opponent: "Ashfield Rovers",
      date: new Date("2026-08-23T15:00:00Z"),
      homeAway: "HOME",
      status: "UPCOMING",
    },
  });

  console.log(
    "Seed complete. Admin login: admin@footballclub.demo / changeme123",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
