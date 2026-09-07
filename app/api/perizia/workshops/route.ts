import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic"; // Ensure fresh data for registration

export async function GET() {
  try {
    // Fetch the currently active edition and its days & workshops
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
      return NextResponse.json(
        { success: false, error: "No active Perizia edition found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activeEdition
    });
  } catch (error) {
    console.error("[Workshops API Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
