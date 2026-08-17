import prisma from "../utils/prismaClient.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { deriveOutcome } from "../utils/deriveOutcome.js";

export const getFixtures = asyncHandler(async (req, res) => {
  const { status } = req.query; // "upcoming" | "completed"
  const where = status ? { status: status.toUpperCase() } : {};

  const fixtures = await prisma.fixture.findMany({
    where,
    orderBy: { date: "asc" },
    include: { result: true },
  });

  res.json(fixtures);
});

export const createFixture = asyncHandler(async (req, res) => {
  const { opponent, date, homeAway } = req.body;

  if (!opponent || !date || !homeAway) {
    return res
      .status(400)
      .json({ error: "opponent, date, and homeAway are required" });
  }
  if (!["HOME", "AWAY"].includes(homeAway)) {
    return res
      .status(400)
      .json({ error: "homeAway must be HOME or AWAY", field: "homeAway" });
  }

  const fixture = await prisma.fixture.create({
    data: { opponent, date: new Date(date), homeAway },
  });

  res.status(201).json(fixture);
});

export const updateFixture = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.fixture.findUnique({
    where: { id },
    include: { result: true },
  });
  if (!existing) return res.status(404).json({ error: "Fixture not found" });

  const { opponent, date, homeAway } = req.body;

  if (homeAway && !["HOME", "AWAY"].includes(homeAway)) {
    return res
      .status(400)
      .json({ error: "homeAway must be HOME or AWAY", field: "homeAway" });
  }

  const fixture = await prisma.fixture.update({
    where: { id },
    data: {
      ...(opponent && { opponent }),
      ...(date && { date: new Date(date) }),
      ...(homeAway && { homeAway }),
    },
  });

  // W/D/L is derived from the club's side of the tie. Flipping home/away on an
  // already-completed fixture would otherwise leave a stale outcome (a win
  // recorded as a loss), so recompute it from the unchanged scoreline.
  if (existing.result && homeAway && homeAway !== existing.homeAway) {
    await prisma.result.update({
      where: { fixtureId: id },
      data: {
        outcome: deriveOutcome(
          existing.result.homeScore,
          existing.result.awayScore,
          homeAway,
        ),
      },
    });
  }

  res.json(fixture);
});

export const deleteFixture = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.fixture.findUnique({
    where: { id },
    include: { result: true },
  });
  if (!existing) return res.status(404).json({ error: "Fixture not found" });

  // Result.fixtureId is ON DELETE RESTRICT, so a completed fixture cannot be
  // removed until its result row goes first. Both run in one transaction so a
  // failure can't leave an orphaned result behind.
  await prisma.$transaction([
    ...(existing.result
      ? [prisma.result.delete({ where: { fixtureId: id } })]
      : []),
    prisma.fixture.delete({ where: { id } }),
  ]);

  res.status(204).send();
});
