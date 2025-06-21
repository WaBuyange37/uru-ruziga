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
    return res.status(405).json({ message: "Method not allowed" });
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
    });

    // Calculate statistics
    const completedLessons = lessonProgress.filter((p) => p.completed).length;
    const totalLessons = await prisma.lesson.count({
      where: { isPublished: true },
    });

    // Calculate current streak (simplified - days with completed lessons)
    const recentCompletions = lessonProgress.filter(
      (p) =>
        p.completed &&
        p.completedAt &&
        new Date(p.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    // Calculate quizzes passed (for now, we'll use completed lessons as proxy)
    const quizzesPassed = lessonProgress.filter(
      (p) => p.completed && p.score && p.score >= 70
    ).length;

    // Get recent activity for last week
    const lastWeekProgress = lessonProgress.filter(
      (p) =>
        p.completedAt &&
        new Date(p.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Get next lesson to study
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

    // Get a random practice quiz lesson
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

    const progressData = {
      lessonsCompleted: completedLessons,
      totalLessons,
      currentStreak: Math.min(recentCompletions.length, 7), // Max 7 days
      quizzesPassed,
      achievementsEarned: Math.floor(completedLessons / 5), // 1 achievement per 5 lessons
      progressFromLastWeek: lastWeekProgress,
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            description: nextLesson.description,
            module: nextLesson.module,
          }
        : null,
      practiceLesson: practiceLesson
        ? {
            id: practiceLesson.id,
            title: practiceLesson.title,
            description: practiceLesson.description,
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
          lessonTitle: p.lesson.title,
          completedAt: p.completedAt,
          score: p.score,
        })),
    };

    res.status(200).json({ progress: progressData });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    if (error.message === "No token provided") {
      res.status(401).json({ message: "Authentication required" });
    } else {
      res.status(500).json({ message: "Error fetching progress data" });
    }
  }
}
