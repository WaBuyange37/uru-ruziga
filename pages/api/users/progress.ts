// pages/api/user/progress.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";

// Helper function to verify JWT token
function verifyToken(req: NextApiRequest) {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies.token ||
    (req.query.token as string);

  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = verifyToken(req);

    // Get user's lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: true,
            order: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const completedLessons = lessonProgress.filter((p) => p.completed).length;
    const totalLessons = await prisma.lesson.count({
      where: { isPublished: true },
    });

    // Calculate average score
    const scores = lessonProgress
      .filter((p) => p.score !== null && p.score !== undefined)
      .map((p) => p.score!);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Calculate current streak (consecutive days with completed lessons)
    const recentCompletions = lessonProgress.filter(
      (p) =>
        p.completed &&
        p.completedAt &&
        new Date(p.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    // Calculate quizzes passed (lessons with score >= 70)
    const quizzesPassed = lessonProgress.filter(
      (p) => p.completed && p.score !== null && p.score !== undefined && p.score >= 70
    ).length;

    // Get recent activity for last week
    const lastWeekProgress = lessonProgress.filter(
      (p) =>
        p.completedAt &&
        new Date(p.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Get next lesson to study (first incomplete lesson)
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        isPublished: true,
        NOT: {
          id: {
            in: lessonProgress
              .filter((p) => p.completed)
              .map((p) => p.lessonId),
          },
        },
      },
      orderBy: [{ module: "asc" }, { order: "asc" }],
    });

    // Get a practice lesson (completed lesson for review)
    const practiceLesson = await prisma.lesson.findFirst({
      where: {
        isPublished: true,
        id: {
          in: lessonProgress.filter((p) => p.completed).map((p) => p.lessonId),
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculate progress by module
    const moduleProgress = await prisma.lesson.groupBy({
      by: ['module'],
      where: { isPublished: true },
      _count: { id: true }
    });

    const progressByModule = moduleProgress.map(module => {
      const moduleLessons = lessonProgress.filter(
        p => p.lesson.module === module.module
      );
      const completed = moduleLessons.filter(p => p.completed).length;
      return {
        module: module.module,
        completed,
        total: module._count.id,
        progress: module._count.id > 0 ? Math.round((completed / module._count.id) * 100) : 0
      };
    });

    const progressData = {
      lessonsCompleted: completedLessons,
      totalLessons,
      averageScore,
      currentStreak: Math.min(recentCompletions.length, 7), // Max 7 days
      quizzesPassed,
      achievementsEarned: Math.floor(completedLessons / 5), // 1 achievement per 5 lessons
      progressFromLastWeek: lastWeekProgress,
      progressByModule,
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            description: nextLesson.description,
            module: nextLesson.module,
            order: nextLesson.order,
          }
        : null,
      practiceLesson: practiceLesson
        ? {
            id: practiceLesson.id,
            title: practiceLesson.title,
            description: practiceLesson.description,
            module: practiceLesson.module,
          }
        : null,
      recentProgress: lessonProgress
        .filter((p) => p.completedAt)
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() -
            new Date(a.completedAt!).getTime()
        )
        .slice(0, 5)
        .map((p) => ({
          lessonId: p.lessonId,
          lessonTitle: p.lesson.title,
          completedAt: p.completedAt,
          score: p.score,
        })),
    };

    res.status(200).json({ progress: progressData });
  } catch (error: any) {
    console.error("Error fetching user progress:", error);
    if (error.message === "No token provided" || error.name === "JsonWebTokenError") {
      res.status(401).json({ error: "Authentication required" });
    } else {
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? (error.message || 'Error fetching progress data')
        : 'Error fetching progress data'
      res.status(500).json({ error: errorMessage });
    }
  }
}
