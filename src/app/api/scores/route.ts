import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth(); 
    const body = await req.json();
    const { articleId, score, timeSpent } = body;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const newScore = await prisma.userScore.create({
      data: {
        articleId: articleId,
        userId: dbUser.id,
        score: Number(score),
        timeSpent: Number(timeSpent),
      },
    });

    return NextResponse.json(newScore);
  } catch (error) {
    console.error("BACKEND_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    const scores = await prisma.userScore.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}