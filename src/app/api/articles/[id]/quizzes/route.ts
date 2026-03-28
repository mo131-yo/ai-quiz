import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const quizzes = Array.isArray(body) ? body : body.quizzes;

    if (!quizzes || !Array.isArray(quizzes)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    } 

    const createdQuizzes = await Promise.all(
      quizzes.map((q: any) => 
        prisma.quiz.create({
          data: {
            question: q.question,
            options: q.options, 
            answer: String(q.answer), 
            articleId: params.id
          }
        })
      )
    );

    return NextResponse.json(createdQuizzes, { status: 201 });
  } catch (error) {
    console.error("POST QUIZ ERROR:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}