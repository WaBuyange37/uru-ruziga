"use client";
// /home/nzela37/Kwizera/Projects/uru-ruziga/app/page.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  CircleIcon,
  BookOpen,
  Calendar,
  Calculator,
  GamepadIcon,
  BarChart3,
  Settings,
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "./contexts/AuthContext";
import { useUmweroTranslation } from "../hooks/use-umwero-translation";

interface CommunityPost {
  id: string;
  content: string;
  language: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  likes: { userId: string }[];
  comments: any[];
  _count?: {
    likes: number;
    comments: number;
  };
}

interface Discussion {
  id: string;
  userId: string;
  title: string;
  content: string;
  script: string;
  category?: string;
  mediaUrls?: string[];
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
  views: number;
  likesCount: number;
}

interface CommunityItem {
  id: string;
  type: 'post' | 'discussion';
  title?: string;
  content: string;
  language?: string;
  script?: string;
  category?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username?: string;
    avatar?: string;
  };
  likes?: { userId: string }[];
  comments?: any[];
  _count?: {
    likes?: number;
    comments: number;
  };
  views?: number;
  likesCount?: number;
}

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const [mounted, setMounted] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "videoPlay") {
        const videoId = event.data.videoId;
        if (videoId !== activeVideo) {
          setActiveVideo(videoId);
          Object.keys(videoRefs.current).forEach((id) => {
            if (id !== videoId && videoRefs.current[id]) {
              videoRefs.current[id]?.contentWindow?.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                "*"
              );
            }
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeVideo]);

  const videoUrls = [
    "https://www.youtube.com/embed/NGmQ0_dMtPk?enablejsapi=1",
    "https://www.youtube.com/embed/tECTtPxsCdg?enablejsapi=1",
    "https://www.youtube.com/embed/o7_Y7FPmKY4?enablejsapi=1",
  ];

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#F3E5AB] flex items-center justify-center">
        <div className="text-[#8B4513]">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login/signup options
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Hero Section for Non-Authenticated Users */}
        <section className="relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
          <div className="container mx-auto text-center max-w-5xl">
            <CircleIcon className="mx-auto h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 mb-6 sm:mb-8 text-[#8B4513] animate-pulse" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-3 sm:mb-4 text-[#8B4513] px-2">
              {t("welcomeToUmwero")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#D2691E] mb-6 sm:mb-8 px-4">
              {t("joinCommunity")}
            </p>

            {/* Founder's Quote - Verified Content */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#8B4513] shadow-xl mb-8 mx-4">
              <CardContent className="p-6 sm:p-8">
                <blockquote className="text-lg sm:text-xl italic text-[#8B4513] leading-relaxed">
                  "Every culture is protected by its language, and any language may be protected by its own writing system."
                </blockquote>
                <p className="text-sm sm:text-base text-[#D2691E] mt-4 font-semibold">
                  — Kwizera Mugisha, Founder of Umwero
                </p>
              </CardContent>
            </Card>

            {/* Three Cultural Pillars - Verified Content */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#8B4513] mb-6">
                Three Pillars of Rwandan Culture
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-4">
                <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-3">
                    <div className="text-5xl mb-3">🐄</div>
                    <CardTitle className="text-xl text-[#8B4513]">In'ka</CardTitle>
                    <CardDescription className="text-[#D2691E] font-semibold">Cattle</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-[#8B4513]">
                      Symbol of wealth and prosperity. "In'ka ni Umunyarwanda" - A cow is Rwandan, helping mothers raise children.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-3">
                    <div className="text-5xl mb-3">⭕</div>
                    <CardTitle className="text-xl text-[#8B4513]">Imana</CardTitle>
                    <CardDescription className="text-[#D2691E] font-semibold">God</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-[#8B4513]">
                      The eternal circle - Hero na Herezo (Alpha and Omega). The circle has no beginning nor ending, representing divine continuity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-3">
                    <div className="text-5xl mb-3">👑</div>
                    <CardTitle className="text-xl text-[#8B4513]">Ingoma</CardTitle>
                    <CardDescription className="text-[#D2691E] font-semibold">Throne/Kingdom</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-[#8B4513]">
                      Cultural sovereignty and royal heritage. "Akami ka muntu ni umutima we" - The kingdom of a person is in their heart.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <Button
                size="lg"
                asChild
                className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] w-full sm:w-auto shadow-lg"
              >
                <Link href="/signup">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t("getStarted")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] w-full sm:w-auto"
              >
                <Link href="/login">{t("alreadyHaveAccount")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Preview Features */}
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-[#FFFFFF]">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-[#8B4513] px-4">
              {t("whatYouGetAccess")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513] text-base sm:text-lg">
                    <BookOpen className="h-5 w-5" />
                    {t("interactiveLessonsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm">
                    {t("interactiveLessonsDesc")}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513] text-base sm:text-lg">
                    <BarChart3 className="h-5 w-5" />
                    {t("trackProgressTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm">
                    {t("trackProgressDesc")}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513] text-base sm:text-lg">
                    <GamepadIcon className="h-5 w-5" />
                    {t("funGamesTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm">
                    {t("funGamesDesc")}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513] text-base sm:text-lg">
                    <Calculator className="h-5 w-5" />
                    {t("translationToolsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm">
                    {t("translationToolsDesc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Authenticated user home page
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F3E5AB] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Hero Section with Mission */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-[#F3E5AB] via-[#FAEBD7] to-[#F3E5AB]">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <CircleIcon className="h-12 w-12 text-[#8B4513] animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#8B4513]">
              {t("welcomeBack")}, {user?.fullName}! 👋
            </h1>
            <p className="text-lg md:text-xl text-[#D2691E] max-w-2xl mx-auto">
              {t("continueJourney")}
            </p>
          </div>

          {/* Mission Statement - Based on Verified Umwero Data */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8B4513] shadow-xl mb-8">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl md:text-3xl text-[#8B4513] flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6" />
                {t("umweroMovement")}
              </CardTitle>
              <CardDescription className="text-[#D2691E] text-base md:text-lg mt-2">
                {t("culturalRenaissance")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#8B4513] text-center leading-relaxed">
                {t("umweroAlphabetDescription")}
              </p>
              <blockquote className="border-l-4 border-[#8B4513] pl-4 italic text-[#D2691E] text-center py-4">
                "{t("umweroQuote")}"
              </blockquote>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-[#F3E5AB]/50 rounded-lg">
                  <div className="text-3xl mb-2">🐄</div>
                  <h3 className="font-semibold text-[#8B4513] mb-1">In'ka</h3>
                  <p className="text-sm text-[#D2691E]">Cattle - Symbol of wealth and prosperity</p>
                </div>
                <div className="text-center p-4 bg-[#F3E5AB]/50 rounded-lg">
                  <div className="text-3xl mb-2">⭕</div>
                  <h3 className="font-semibold text-[#8B4513] mb-1">Imana</h3>
                  <p className="text-sm text-[#D2691E]">God - The eternal circle</p>
                </div>
                <div className="text-center p-4 bg-[#F3E5AB]/50 rounded-lg">
                  <div className="text-3xl mb-2">👑</div>
                  <h3 className="font-semibold text-[#8B4513] mb-1">Ingoma</h3>
                  <p className="text-sm text-[#D2691E]">Throne - Cultural sovereignty</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            {user?.role === "ADMIN" && (
              <Button
                size="lg"
                asChild
                className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] shadow-lg"
              >
                <Link href="/admin">
                  <Settings className="mr-2 h-5 w-5" />
                  {t("adminDashboard")}
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              asChild
              className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] shadow-lg"
            >
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-5 w-5" />
                {t("viewYourProgress")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] shadow-lg"
            >
              <Link href="/learn">
                <BookOpen className="mr-2 h-5 w-5" />
                {t("continueLearn")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cultural Proverbs Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-[#8B4513]">
            {t("culturalInsights")}
          </h2>
          <p className="text-center text-[#D2691E] mb-12 max-w-2xl mx-auto">
            {t("didYouKnow")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513] text-lg">
                  Umwero Circle Symbolism
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513]">
                  {t("umweroCircleMeaning")} - representing Hero na Herezo (Alpha and Omega), the beginning and end of all knowledge.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513] text-lg">
                  {t("languagePreservation")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513]">
                  {t("umweroRoleInPreservation")} through authentic phonetic representation and cultural symbolism.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513] text-lg">
                  Measurement of 8 (Umunani)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513]">
                  All Umwero characters use the measurement of 8, symbolizing heritage and intellectual property passed to future generations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#F3E5AB] to-[#FAEBD7] border-2 border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513] text-lg">
                  Founder's Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4513] italic">
                  "Every culture is protected by its language, and any language may be protected by its own writing system." - Kwizera Mugisha
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Features */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F3E5AB]/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">
            {t("features")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <BookOpen className="h-5 w-5" />
                  {t("learnUmweroTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E] text-sm mb-4">
                  {t("learnUmweroDesc")}
                </p>
                <Button asChild size="sm" className="w-full bg-[#8B4513] hover:bg-[#A0522D]">
                  <Link href="/learn">{t("startLearning")}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Users className="h-5 w-5" />
                  {t("community")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E] text-sm mb-4">
                  {t("connectWithFellowLearners")}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full border-[#8B4513] text-[#8B4513]">
                  <Link href="/community">{t("joinDiscussion")}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calculator className="h-5 w-5" />
                  {t("toolsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E] text-sm mb-4">
                  {t("toolsDesc")}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full border-[#8B4513] text-[#8B4513]">
                  <Link href="/translate">{t("translate")}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#8B4513] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <GamepadIcon className="h-5 w-5" />
                  {t("gamesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E] text-sm mb-4">
                  {t("gamesDesc")}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full border-[#8B4513] text-[#8B4513]">
                  <Link href="/games-and-quizzes">{t("gamesAndQuizzes")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    {/* Video Tutorials */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F3E5AB]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">
            {t("videoTutorialsTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoUrls.map((url, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden shadow-xl border-2 border-[#8B4513]">
                <iframe
                  ref={(el) => {
                    if (el) videoRefs.current[`video-${index}`] = el
                  }}
                  className="w-full h-full"
                  src={url}
                  title={`Umwero Tutorial ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto max-w-4xl text-center">
          <TrendingUp className="h-12 w-12 text-[#8B4513] mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-[#8B4513]">
            {t("supportOurMissionTitle")}
          </h2>
          <p className="text-xl mb-8 text-[#D2691E]">
            {t("supportOurMissionDesc")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] shadow-xl"
          >
            <Link href="/fund">{t("supportTheProject")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
