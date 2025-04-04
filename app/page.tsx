"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { CircleIcon, BookOpen, Calendar, Calculator, GamepadIcon } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "../hooks/useTranslation"

export default function Home() {
  const { t } = useTranslation()
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "videoPlay") {
        const videoId = event.data.videoId
        if (videoId !== activeVideo) {
          setActiveVideo(videoId)
          Object.keys(videoRefs.current).forEach((id) => {
            if (id !== videoId && videoRefs.current[id]) {
              videoRefs.current[id]?.contentWindow?.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                "*",
              )
            }
          })
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [activeVideo])

  const videoUrls = [
    "https://www.youtube.com/embed/NGmQ0_dMtPk?enablejsapi=1",
    "https://www.youtube.com/embed/tECTtPxsCdg?enablejsapi=1",
    "https://www.youtube.com/embed/o7_Y7FPmKY4?enablejsapi=1",
  ]

  if (!mounted) {
    return <div className="min-h-screen bg-[#F3E5AB]"></div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <CircleIcon className="mx-auto h-24 w-24 mb-8 text-[#8B4513]" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            {t("enterCircleOfKnowledge")}
          </h1>
          <p className="text-xl text-[#D2691E] mb-8">{t("whereEveryLetterTellsStory")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/learn">{t("startLearning")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/fund">{t("fundUruziga")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/calendar">{t("exploreCalendar")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">{t("coreFeatures")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <BookOpen className="h-5 w-5" />
                  {t("learnUmwero")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("interactiveLessons")}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calendar className="h-5 w-5" />
                  {t("calendar")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("exploreAncientCalendar")}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calculator className="h-5 w-5" />
                  {t("tools")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("accessTools")}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <GamepadIcon className="h-5 w-5" />
                  {t("games")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("learnThroughGames")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cultural Insights */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">{t("culturalInsights")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-[#FFFFFF] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">{t("didYouKnow")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("umweroCircleFact")}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#FFFFFF] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">{t("culturalSignificance")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("eachCharacterTellsStory")}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#FFFFFF] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">{t("languagePreservation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t("umweroPreservesHeritage")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Umwero Movement Introduction */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#8B4513]">{t("umweroMovement")}</h2>
          <p className="text-xl mb-6 text-[#D2691E]">{t("joinPreservingCulture")}</p>
          <p className="mb-8 text-[#8B4513]">{t("umweroMovementDescription")}</p>
          <Button asChild>
            <Link href="/about">{t("learnMoreAboutUmwero")}</Link>
          </Button>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#F3E5AB]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">{t("videoTutorials")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoUrls.map((url, index) => (
              <div key={index} className="aspect-video">
                <iframe
                  ref={(el) => (videoRefs.current[`video-${index}`] = el)}
                  className="w-full h-full rounded-lg shadow-lg"
                  src={url}
                  title={t("umweroTutorial", { number: index + 1 })}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#8B4513]">{t("supportOurMission")}</h2>
          <p className="text-xl mb-6 text-[#D2691E]">{t("helpPreserveCulture")}</p>
          <p className="mb-8 text-[#8B4513]">{t("contributionHelps")}</p>
          <Button asChild>
            <Link href="/fund">{t("donateNow")}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

