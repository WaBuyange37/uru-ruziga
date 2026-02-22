"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  CircleIcon,
  BookOpen,
  Calculator,
  GamepadIcon,
  BarChart3,
  Settings,
  Heart,
  TrendingUp,
  Sparkles,
  Users,
  Globe,
  Target,
  Play,
  ArrowRight,
  Star
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const [mounted, setMounted] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB] flex items-center justify-center">
        <div className="text-[#8B4513] text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show modern landing page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
        {/* Hero Section */}
        <section className="relative py-16 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto text-center max-w-5xl">
            {/* Cultural Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm">Preserving Rwandan Heritage</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Endangered Alphabets Project</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Cultural Renaissance</span>
              </Badge>
            </div>

            <CircleIcon className="mx-auto h-20 w-20 md:h-24 md:w-24 mb-6 text-[#8B4513] animate-pulse" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[#8B4513]">
              {t("welcomeToUmwero")}
            </h1>
            <p className="text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
              Discover the revolutionary Umwero script and join a cultural movement preserving Rwandan heritage through authentic writing systems.
            </p>

            {/* Founder's Quote */}
            <Card className="bg-white/80 backdrop-blur border-[#8B4513] shadow-xl mb-8">
              <CardContent className="p-6 md:p-8">
                <blockquote className="text-lg md:text-xl italic text-[#8B4513] leading-relaxed">
                  "Every culture is protected by its language, and any language may be protected by its own writing system."
                </blockquote>
                <p className="text-sm md:text-base text-[#D2691E] mt-4 font-semibold">
                  — Kwizera Mugisha, Founder of Umwero
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/signup">
                  <Sparkles className="h-5 w-5" />
                  {t("getStarted")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
              >
                <Link href="/login">
                  <ArrowRight className="h-5 w-5" />
                  {t("alreadyHaveAccount")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Three Cultural Pillars */}
        <section className="py-16 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#8B4513] mb-4">
                Three Pillars of Rwandan Culture
              </h2>
              <p className="text-lg text-[#D2691E] max-w-2xl mx-auto">
                Understanding the foundational elements that shape Rwandan identity and inspire the Umwero script
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all">
                <CardHeader className="text-center pb-4">
                  <div className="text-6xl mb-4">🐄</div>
                  <CardTitle className="text-2xl text-blue-800">In'ka</CardTitle>
                  <CardDescription className="text-blue-600 font-semibold">Cattle</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-blue-700 leading-relaxed">
                    Symbol of wealth and prosperity. "In'ka ni Umunyarwanda" - A cow is Rwandan, helping mothers raise children.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all">
                <CardHeader className="text-center pb-4">
                  <div className="text-6xl mb-4">⭕</div>
                  <CardTitle className="text-2xl text-purple-800">Imana</CardTitle>
                  <CardDescription className="text-purple-600 font-semibold">God</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-purple-700 leading-relaxed">
                    The eternal circle - Hero na Herezo (Alpha and Omega). The circle has no beginning nor ending, representing divine continuity.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-xl transition-all">
                <CardHeader className="text-center pb-4">
                  <div className="text-6xl mb-4">👑</div>
                  <CardTitle className="text-2xl text-amber-800">Ingoma</CardTitle>
                  <CardDescription className="text-amber-600 font-semibold">Throne/Kingdom</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-amber-700 leading-relaxed">
                    Cultural sovereignty and royal heritage. "Akami ka muntu ni umutima we" - The kingdom of a person is in their heart.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-white/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#8B4513] mb-4">
                {t("whatYouGetAccess")}
              </h2>
              <p className="text-lg text-[#D2691E] max-w-2xl mx-auto">
                Comprehensive tools and resources for mastering the Umwero script
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-[#8B4513] hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="h-8 w-8 text-[#8B4513] group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-xs">Essential</Badge>
                  </div>
                  <CardTitle className="text-[#8B4513] text-lg">
                    {t("interactiveLessonsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm leading-relaxed">
                    {t("interactiveLessonsDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#8B4513] hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-8 w-8 text-[#8B4513] group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-xs">Analytics</Badge>
                  </div>
                  <CardTitle className="text-[#8B4513] text-lg">
                    {t("trackProgressTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm leading-relaxed">
                    {t("trackProgressDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#8B4513] hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <GamepadIcon className="h-8 w-8 text-[#8B4513] group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-xs">Fun</Badge>
                  </div>
                  <CardTitle className="text-[#8B4513] text-lg">
                    {t("funGamesTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm leading-relaxed">
                    {t("funGamesDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#8B4513] hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Calculator className="h-8 w-8 text-[#8B4513] group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-xs">Tools</Badge>
                  </div>
                  <CardTitle className="text-[#8B4513] text-lg">
                    {t("translationToolsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E] text-sm leading-relaxed">
                    {t("translationToolsDesc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-2xl md:text-3xl font-semibold text-amber-800 mb-4">
                  Join the Cultural Movement
                </h3>
                <p className="text-amber-700 leading-relaxed mb-6 max-w-2xl mx-auto">
                  Every character you learn helps preserve the endangered Umwero script and honors Rwandan cultural heritage. Start your journey today and become part of this important cultural renaissance.
                </p>
                <Button
                  size="lg"
                  asChild
                  className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg"
                >
                  <Link href="/signup">
                    <Sparkles className="h-5 w-5" />
                    Begin Your Journey
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
