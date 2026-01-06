"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Star,
  Trophy,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

interface UserProgress {
  totalLessons: number;
  completedLessons: number;
  currentLevel: string;
  totalTimeSpent: number;
  streak: number;
  achievements: string[];
  recentActivity: {
    id: string;
    type: "LESSON_COMPLETED" | "DISCUSSION_POSTED" | "ACHIEVEMENT_EARNED";
    title: string;
    description: string;
    createdAt: string;
  }[];
  nextLessons: {
    id: string;
    title: string;
    level: string;
    duration: number;
    isUnlocked: boolean;
  }[];
  levelProgress: {
    level: string;
    completed: number;
    total: number;
  }[];
}

interface UserStats {
  discussionsPosted: number;
  commentsPosted: number;
  ordersPlaced: number;
  donationsMade: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "all"
  >("week");

  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching progress:", errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch("/api/users/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching stats:", errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getCurrentLevelProgress = () => {
    if (!progress) return 0;
    const currentLevelData = progress.levelProgress.find(
      (lp) => lp.level === progress.currentLevel
    );
    if (!currentLevelData || currentLevelData.total === 0) return 0;
    return Math.round(
      (currentLevelData.completed / currentLevelData.total) * 100
    );
  };

  const getOverallProgress = () => {
    if (!progress || progress.totalLessons === 0) return 0;
    return Math.round(
      (progress.completedLessons / progress.totalLessons) * 100
    );
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "LESSON_COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "DISCUSSION_POSTED":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "ACHIEVEMENT_EARNED":
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-800";
      case "ADVANCED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          Welcome back, {user.fullName || user.email}!
        </h1>
        <p className="text-[#D2691E] text-lg">
          Continue your Umwero learning journey
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#D2691E] text-sm">Lessons Completed</p>
                <p className="text-2xl font-bold text-[#8B4513]">
                  {progress?.completedLessons || 0}/
                  {progress?.totalLessons || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-[#8B4513]" />
            </div>
            <Progress value={getOverallProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#D2691E] text-sm">Current Level</p>
                <Badge
                  className={getLevelColor(
                    progress?.currentLevel || "BEGINNER"
                  )}
                >
                  {progress?.currentLevel || "BEGINNER"}
                </Badge>
              </div>
              <Target className="h-8 w-8 text-[#8B4513]" />
            </div>
            <Progress value={getCurrentLevelProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#D2691E] text-sm">Time Spent</p>
                <p className="text-2xl font-bold text-[#8B4513]">
                  {formatTimeSpent(progress?.totalTimeSpent || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-[#8B4513]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#D2691E] text-sm">Learning Streak</p>
                <p className="text-2xl font-bold text-[#8B4513]">
                  {progress?.streak || 0} days
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#8B4513]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Lessons */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress?.nextLessons.slice(0, 3).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-[#8B4513]">
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-[#D2691E]">
                      <Badge className={getLevelColor(lesson.level)} size="sm">
                        {lesson.level}
                      </Badge>
                      <Clock className="h-3 w-3" />
                      {lesson.duration}min
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!lesson.isUnlocked}
                    className="bg-[#8B4513] text-[#F3E5AB]"
                    asChild={lesson.isUnlocked}
                  >
                    {lesson.isUnlocked ? (
                      <a href={`/learn#lesson-${lesson.id}`}>Start</a>
                    ) : (
                      <span>Locked</span>
                    )}
                  </Button>
                </div>
              )) || <p className="text-[#D2691E]">No lessons available</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress?.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-[#8B4513] text-sm">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-[#D2691E]">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              )) || <p className="text-[#D2691E]">No recent activity</p>}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements ({progress?.achievements.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {progress?.achievements.slice(0, 6).map((achievement) => (
                <div
                  key={achievement}
                  className="flex items-center gap-2 p-2 bg-white rounded text-sm"
                >
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-[#8B4513] truncate">{achievement}</span>
                </div>
              )) || (
                <p className="text-[#D2691E] col-span-2">No achievements yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">
              Community Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#D2691E]">Discussions Posted</span>
                <span className="font-bold text-[#8B4513]">
                  {stats?.discussionsPosted || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D2691E]">Comments Posted</span>
                <span className="font-bold text-[#8B4513]">
                  {stats?.commentsPosted || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D2691E]">Orders Placed</span>
                <span className="font-bold text-[#8B4513]">
                  {stats?.ordersPlaced || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#D2691E]">Donations Made</span>
                <span className="font-bold text-[#8B4513]">
                  {stats?.donationsMade || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 bg-[#F3E5AB] border-[#8B4513]">
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
              <a href="/community">Join Discussion</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#8B4513] text-[#8B4513]"
            >
              <a href="/translate">Use Translator</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#8B4513] text-[#8B4513]"
            >
              <a href="/shop">Browse Shop</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
