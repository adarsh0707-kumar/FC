import prisma from "../utils/prismaClient.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getPlayers = asyncHandler(async (req, res) => {
  const players = await prisma.player.findMany({ orderBy: { number: "asc" } });
  res.json(players);
});

export const getPlayer = asyncHandler(async (req, res) => {
  const player = await prisma.player.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(player);
});

export const createPlayer = asyncHandler(async (req, res) => {
  const {
    name,
    position,
    number,
    goals,
    assists,
    appearances,
    cleanSheets,
    bio,
  } = req.body;

  if (!name || !position || !number) {
    return res
      .status(400)
      .json({ error: "name, position, and number are required" });
  }

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const player = await prisma.player.create({
    data: {
      name,
      position,
      number: Number(number),
      goals: Number(goals) || 0,
      assists: Number(assists) || 0,
      appearances: Number(appearances) || 0,
      cleanSheets: Number(cleanSheets) || 0,
      bio: bio || null,
      photoUrl,
    },
  });

  res.status(201).json(player);
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Player not found" });

  const {
    name,
    position,
    number,
    goals,
    assists,
    appearances,
    cleanSheets,
    bio,
  } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const player = await prisma.player.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(position && { position }),
      ...(number && { number: Number(number) }),
      ...(goals !== undefined && { goals: Number(goals) }),
      ...(assists !== undefined && { assists: Number(assists) }),
      ...(appearances !== undefined && { appearances: Number(appearances) }),
      ...(cleanSheets !== undefined && { cleanSheets: Number(cleanSheets) }),
      ...(bio !== undefined && { bio }),
      ...(photoUrl && { photoUrl }),
    },
  });

  res.json(player);
});

export const deletePlayer = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Player not found" });

  await prisma.player.delete({ where: { id } });
  res.status(204).send();
});
