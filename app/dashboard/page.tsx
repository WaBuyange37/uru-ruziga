"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { useTranslation } from "../../hooks/useTranslation";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  Trophy,
  PlayCircle,
  CheckCircle2,
  Flame,
  Star,
} from "lucide-react";

interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  completed: boolean;
  score: number;
  completedAt: string;
  timeSpent: number;
}

interface VowelProgress {
  vowel: string;
  umwero: string;
  attempts: number;
  bestScore: number;
  lastPracticed: string;
  drawings: string[]; // Array of canvas image data
}

interface UserDashboardData {
  totalLessons: number;
  completedLessons: number;
  currentLevel: string;
  totalTimeSpent: number;
  streak: number;
  lessonsProgress: LessonProgress[];
  vowelsProgress: VowelProgress[];
  nextLesson: {
    id: string;
    title: string;
    duration: number;
  } | null;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = () => {
    // Load from localStorage for now (before database integration)
    const vowelsProgress = JSON.parse(localStorage.getItem('vowelsProgress') || '[]');
    const completedVowels = JSON.parse(localStorage.getItem('completedVowels') || '[]');
    const totalTimeSpent = parseInt(localStorage.getItem('totalTimeSpent') || '0');
    const streak = parseInt(localStorage.getItem('learningStreak') || '0');

    // Calculate lesson progress
    const vowelLessonsTotal = 5; // a, e, i, o, u
    const completedCount = completedVowels.length;

    const data: UserDashboardData = {
      totalLessons: vowelLessonsTotal,
      completedLessons: completedCount,
      currentLevel: completedCount === 0 ? 'BEGINNER' : completedCount === vowelLessonsTotal ? 'INTERMEDIATE' : 'BEGINNER',
      totalTimeSpent: totalTimeSpent,
      streak: streak,
      lessonsProgress: vowelsProgress.map((vp: any) => ({
        lessonId: vp.vowel,
        lessonTitle: `Vowel: ${vp.vowel.toUpperCase()}`,
        completed: completedVowels.includes(vp.vowelIndex),
        score: vp.bestScore || 0,
        completedAt: vp.lastPracticed || new Date().toISOString(),
        timeSpent: vp.timeSpent || 0,
      })),
      vowelsProgress: vowelsProgress,
      nextLesson: completedCount < vowelLessonsTotal ? {
        id: 'vowels',
        title: 'Continue Vowel Lesson',
        duration: 20,
      } : {
        id: 'consonants',
        title: 'Start Consonants',
        duration: 30,
      },
    };

    setDashboardData(data);
    setLoading(false);
  };

  const getOverallProgress = () => {
    if (!dashboardData || dashboardData.totalLessons === 0) return 0;
    return Math.round((dashboardData.completedLessons / dashboardData.totalLessons) * 100);
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800 border-green-300";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ADVANCED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold text-[#8B4513] mb-4">
              Access Denied
            </h2>
            <p className="text-[#D2691E] mb-4">
              Please log in to view your dashboard.
            </p>
            <Button
              asChild
              className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
            >
              <a href="/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto"></div>
          <p className="mt-4 text-[#8B4513]">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
          Welcome back, {user.fullName || user.email}! 👋
        </h1>
        <p className="text-[#D2691E] text-lg">
          Continue your Umwero learning journey
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Lessons Completed */}
        <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FFF8DC] border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#D2691E] text-sm font-semibold">Vowels Mastered</p>
                <p className="text-3xl font-bold text-[#8B4513]">
                  {dashboardData?.completedLessons || 0}
                  <span className="text-xl text-[#D2691E]">/5</span>
                </p>
              </div>
              <div className="bg-[#8B4513] p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-[#F3E5AB]" />
              </div>
            </div>
            <Progress value={getOverallProgress()} className="h-2" />
            <p className="text-xs text-[#D2691E] mt-2">{getOverallProgress()}% complete</p>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FFF8DC] border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#D2691E] text-sm font-semibold">Current Level</p>
                <Badge
                  className={`${getLevelColor(dashboardData?.currentLevel || "BEGINNER")} text-sm px-3 py-1 font-bold mt-2`}
                >
                  {dashboardData?.currentLevel || "BEGINNER"}
                </Badge>
              </div>
              <div className="bg-[#8B4513] p-3 rounded-full">
                <Target className="h-6 w-6 text-[#F3E5AB]" />
              </div>
            </div>
            <p className="text-xs text-[#D2691E] mt-2">
              {dashboardData?.completedLessons === 5 
                ? "Ready for Intermediate!" 
                : `${5 - (dashboardData?.completedLessons || 0)} vowels to go`}
            </p>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FFF8DC] border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#D2691E] text-sm font-semibold">Practice Time</p>
                <p className="text-3xl font-bold text-[#8B4513]">
                  {formatTimeSpent(dashboardData?.totalTimeSpent || 0)}
                </p>
              </div>
              <div className="bg-[#8B4513] p-3 rounded-full">
                <Clock className="h-6 w-6 text-[#F3E5AB]" />
              </div>
            </div>
            <p className="text-xs text-[#D2691E] mt-2">Keep up the great work!</p>
          </CardContent>
        </Card>

        {/* Learning Streak */}
        <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FFF8DC] border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#D2691E] text-sm font-semibold">Learning Streak</p>
                <p className="text-3xl font-bold text-[#8B4513] flex items-center gap-2">
                  {dashboardData?.streak || 0}
                  <Flame className="h-6 w-6 text-orange-500" />
                </p>
              </div>
              <div className="bg-[#8B4513] p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-[#F3E5AB]" />
              </div>
            </div>
            <p className="text-xs text-[#D2691E] mt-2">
              {dashboardData?.streak === 0 ? "Start your streak today!" : "days in a row"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Vowel Progress Details */}
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Star className="h-5 w-5" />
              Vowel Practice Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.vowelsProgress && dashboardData.vowelsProgress.length > 0 ? (
                dashboardData.vowelsProgress.map((vowel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#D2691E]"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="text-5xl font-bold"
                        style={{ fontFamily: "'UMWEROalpha', serif" }}
                      >
                        {vowel.umwero}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#8B4513] text-lg">
                          Vowel: {vowel.vowel.toUpperCase()}
                        </h4>
                        <p className="text-sm text-[#D2691E]">
                          Practiced {vowel.attempts || 0} times
                        </p>
                        <p className="text-xs text-gray-600">
                          Best score: {vowel.bestScore || 0}%
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className={`h-6 w-6 ${vowel.attempts > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#D2691E]">No practice data yet. Start learning!</p>
                  <Button
                    asChild
                    className="mt-4 bg-[#8B4513] text-[#F3E5AB]"
                  >
                    <a href="/learn">Start Learning</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Lesson */}
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Continue Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.nextLesson ? (
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg border-2 border-[#8B4513]">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-2">
                    {dashboardData.nextLesson.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#D2691E] mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{dashboardData.nextLesson.duration} minutes</span>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                    size="lg"
                  >
                    <a href="/learn">
                      {dashboardData.completedLessons === 0 ? 'Start Learning' : 'Continue'}
                    </a>
                  </Button>
                </div>

                {/* Motivational Quote */}
                <div className="p-4 bg-gradient-to-r from-[#FFF8DC] to-[#F3E5AB] rounded-lg border border-[#D2691E]">
                  <p className="text-sm italic text-[#8B4513] mb-2">
                    "Umwero wagenewe gusigasira n'umurimi rw'Ikinyarwanda"
                  </p>
                  <p className="text-xs text-[#D2691E]">
                    Umwero exists to preserve the Kinyarwanda language
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[#D2691E]">Great job! You've completed all available lessons.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      {dashboardData && dashboardData.completedLessons > 0 && (
        <Card className="mb-8 bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* First Vowel */}
              {dashboardData.completedLessons >= 1 && (
                <div className="p-4 bg-white rounded-lg border border-yellow-400 text-center">
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-bold text-[#8B4513] text-sm">First Steps</p>
                  <p className="text-xs text-[#D2691E]">Completed first vowel</p>
                </div>
              )}

              {/* Half Way */}
              {dashboardData.completedLessons >= 3 && (
                <div className="p-4 bg-white rounded-lg border border-blue-400 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold text-[#8B4513] text-sm">Half Way There</p>
                  <p className="text-xs text-[#D2691E]">3 vowels mastered</p>
                </div>
              )}

              {/* All Vowels */}
              {dashboardData.completedLessons === 5 && (
                <div className="p-4 bg-white rounded-lg border border-green-400 text-center">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-[#8B4513] text-sm">Vowel Master</p>
                  <p className="text-xs text-[#D2691E]">All vowels completed!</p>
                </div>
              )}

              {/* Time Spent */}
              {dashboardData.totalTimeSpent >= 60 && (
                <div className="p-4 bg-white rounded-lg border border-purple-400 text-center">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-bold text-[#8B4513] text-sm">Dedicated Learner</p>
                  <p className="text-xs text-[#D2691E]">1+ hour practiced</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              asChild
              className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
            >
              <a href="/learn">Continue Learning</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#8B4513] text-[#8B4513]"
            >
              <a href="/translate">Translator</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#8B4513] text-[#8B4513]"
            >
              <a href="/umwero-chat">Umwero Chat</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#8B4513] text-[#8B4513]"
            >
              <a href="/gallery">Gallery</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}