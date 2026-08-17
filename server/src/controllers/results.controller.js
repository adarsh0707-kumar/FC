import prisma from "../utils/prismaClient.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { deriveOutcome } from "../utils/deriveOutcome.js";

export const getResults = asyncHandler(async (req, res) => {
  const fixtures = await prisma.fixture.findMany({
    where: { status: "COMPLETED" },
    orderBy: { date: "desc" },
    include: { result: true },
  });

  const results = fixtures
    .filter((f) => f.result)
    .map((f) => ({
      fixtureId: f.id,
      opponent: f.opponent,
      date: f.date,
      homeAway: f.homeAway,
      homeScore: f.result.homeScore,
      awayScore: f.result.awayScore,
      outcome: f.result.outcome,
    }));

  res.json(results);
});

// POST /api/fixtures/:id/result
export const recordResult = asyncHandler(async (req, res) => {
  const fixtureId = Number(req.params.id);
  const { homeScore, awayScore } = req.body;

  if (homeScore === undefined || awayScore === undefined) {
    return res
      .status(400)
      .json({ error: "homeScore and awayScore are required" });
  }

  const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
  if (!fixture) return res.status(404).json({ error: "Fixture not found" });

  const outcome = deriveOutcome(
    Number(homeScore),
    Number(awayScore),
    fixture.homeAway,
  );

  const result = await prisma.result.upsert({
    where: { fixtureId },
    update: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      outcome,
    },
    create: {
      fixtureId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      outcome,
    },
  });

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: { status: "COMPLETED" },
  });

  res.status(201).json(result);
});
