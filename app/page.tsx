"use client";
// /home/nzela37/Kwizera/Projects/uru-ruziga/app/page.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  CircleIcon,
  BookOpen,
  Calendar,
  Calculator,
  GamepadIcon,
  BarChart3,
  Settings,
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
        <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
          <div className="container mx-auto text-center">
            <CircleIcon className="mx-auto h-24 w-24 mb-8 text-[#8B4513]" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
              {t("welcomeToUmwero")}
            </h1>
            <p className="text-xl text-[#D2691E] mb-8">
              {t("joinCommunity")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              >
                <Link href="/signup">{t("getStarted")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-[#8B4513] text-[#8B4513]"
              >
                <Link href="/login">{t("alreadyHaveAccount")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Preview Features */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">
              {t("whatYouGetAccess")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#F3E5AB] border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                    <BookOpen className="h-5 w-5" />
                    {t("interactiveLessonsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E]">
                    {t("interactiveLessonsDesc")}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#F3E5AB] border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                    <BarChart3 className="h-5 w-5" />
                    {t("trackProgressTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E]">
                    {t("trackProgressDesc")}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#F3E5AB] border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                    <GamepadIcon className="h-5 w-5" />
                    {t("funGamesTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E]">
                    {t("funGamesDesc")}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#F3E5AB] border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                    <Calculator className="h-5 w-5" />
                    {t("translationToolsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D2691E]">
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
    <div className="flex flex-col min-h-screen">
      {/* Welcome Section for Authenticated Users */}
      <section className="relative py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            {t("welcomeBack")}, {user?.fullName}! 👋
          </h1>
          <p className="text-lg text-[#D2691E] mb-6">
            {t("continueJourney")}
          </p>

          {/* Dashboard Access Button */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {user?.role === "ADMIN" ? (
              <>
                <Button
                  size="lg"
                  asChild
                  className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                >
                  <Link href="/admin">
                    <Settings className="mr-2 h-5 w-5" />
                    {t("adminDashboard")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="border-[#8B4513] text-[#8B4513]"
                >
                  <Link href="/dashboard">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {t("myProgress")}
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                asChild
                className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              >
                <Link href="/dashboard">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  {t("viewYourProgress")}
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-[#8B4513] text-[#8B4513]"
            >
              <Link href="/learn">
                <BookOpen className="mr-2 h-5 w-5" />
                {t("continueLearn")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features - Same as before */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">
            {t("features")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <BookOpen className="h-5 w-5" />
                  {t("learnUmweroTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">
                  {t("learnUmweroDesc")}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calendar className="h-5 w-5" />
                  {t("calendarTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">
                  {t("calendarDesc")}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calculator className="h-5 w-5" />
                  {t("toolsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("toolsDesc")}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <GamepadIcon className="h-5 w-5" />
                  {t("gamesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">
                  {t("gamesDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">
            {t("videoTutorialsTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoUrls.map((url, index) => (
              <div key={index} className="aspect-video">
                <iframe
                  ref={(el) => {
                    if (el) videoRefs.current[`video-${index}`] = el
                  }}
                  className="w-full h-full rounded-lg shadow-lg"
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
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#8B4513]">
            {t("supportOurMissionTitle")}
          </h2>
          <p className="text-xl mb-6 text-[#D2691E]">
            {t("supportOurMissionDesc")}
          </p>
          <Button
            asChild
            className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
          >
            <Link href="/fund">{t("supportTheProject")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
