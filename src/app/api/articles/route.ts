import { NextResponse } from "next/server";
import { syncUser } from "@/lib/sync-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbUser = await syncUser();
    
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await prisma.article.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles || []);
  } catch (error) {
    console.error("GET Articles Error:", error);
    return NextResponse.json({ error: "Датаг авахад алдаа гарлаа" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const dbUser = await syncUser();
    
    if (!dbUser) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, summary } = body;
    
    const article = await prisma.article.create({
      data: {
        title: title || "Гарчиггүй артикл",
        content: content,
        summary: summary,
        userId: dbUser.id, 
      }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: "Хадгалахад алдаа гарлаа" }, { status: 500 });
  }
}