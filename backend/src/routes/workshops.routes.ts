import { Router } from "express";
import { prisma } from "../infrastructure/db/client";

export const workshopsRouter = Router();

workshopsRouter.get("/", async (req, res, next) => {
  try {
    const activeEdition = await prisma.periziaEdition.findFirst({
      where: { isActive: true },
      include: {
        days: {
          orderBy: { date: "asc" }
        },
        workshops: {
          include: {
            _count: {
              select: { workshopRegistrations: { where: { status: "REGISTERED" } } }
            }
          }
        }
      }
    });

    if (!activeEdition) {
      res.status(404).json({ success: false, error: "No active Perizia edition found." });
      return;
    }

    res.json({ success: true, data: activeEdition });
  } catch (error) {
    next(error);
  }
});
