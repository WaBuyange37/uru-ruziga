"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { ScrollArea } from "../../components/ui/scroll-area"
import { BookOpen, Video, Trophy, Search, Clock, ArrowRight, X, ArrowDown, GraduationCap, Play } from 'lucide-react'
import { VideoPlayer } from "../../components/VideoPlayer"
import { AvailableCourses } from "../../components/certification/AvailableCourses"
import { CourseModules } from "../../components/certification/CourseModules"
import { CertificateDisplay } from "../../components/certification/CertificateDisplay"
import { useTranslation } from '../../hooks/useTranslation'
import { CompleteVowelLesson } from "../../components/lessons/CompleteVowelLesson"

export default function Page() {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(65)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [showIntroVideo, setShowIntroVideo] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > 0)
      }
    }

    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const modules = [
    {
      title: t("beginner"),
      lessons: [
        {
          id: "vowels",
          title: t("umweroVowels"),
          description: t("learnVowelCharacters"),
          duration: "20 min",
          completed: false
        },
        {
          id: "consonants",
          title: t("umweroConsonants"),
          description: t("masterConsonantCharacters"),
          duration: "35 min",
          completed: false
        },
        {
          id: "first-words",
          title: t("writingYourFirstWords"),
          description: t("startFormingCompleteWords"),
          duration: "30 min",
          completed: false
        },
        {
          id: "numbers",
          title: t("numbersInUmwero"),
          description: t("learnToWriteNumbers"),
          duration: "25 min",
          completed: false
        },
        {
          id: "simple-sentences",
          title: t("constructingSimpleSentences"),
          description: t("practiceWritingSimpleSentences"),
          duration: "40 min",
          completed: false
        },
        {
          id: "pronunciation",
          title: t("pronunciationGuide"),
          description: t("learnCorrectPronunciation"),
          duration: "30 min",
          completed: false
        }
      ]
    },
    {
      title: t("intermediate"),
      lessons: [
        {
          id: "advanced-combos",
          title: t("advancedCharacterCombinations"),
          description: t("learnToCombineCharacters"),
          duration: "35 min",
          completed: false
        },
        {
          id: "cultural-significance",
          title: t("culturalSignificance"),
          description: t("understandSymbolMeanings"),
          duration: "40 min",
          completed: false
        },
        {
          id: "complex-words",
          title: t("complexWordFormation"),
          description: t("createComplexWords"),
          duration: "45 min",
          completed: false
        },
        {
          id: "idioms",
          title: t("umweroIdiomsAndExpressions"),
          description: t("learnCommonIdioms"),
          duration: "50 min",
          completed: false
        },
        {
          id: "calligraphy",
          title: t("umweroCalligraphy"),
          description: t("developHandwritingStyle"),
          duration: "55 min",
          completed: false
        }
      ]
    }
  ]

  const videoTutorials = [
    {
      id: "imibire",
      title: t("imibireExploringUmwero"),
      src: "/videos/imibire.mp4",
      description: t("diveDeepIntoUmwero"),
      duration: "15:30"
    },
    {
      id: "one",
      title: t("umweroBasicsPartOne"),
      src: "/videos/one.mp4",
      description: t("startUmweroJourney"),
      duration: "12:45"
    },
    {
      id: "two",
      title: t("umweroBasicsPartTwo"),
      src: "/videos/two.mp4",
      description: t("continueUmweroLearning"),
      duration: "20:15"
    }
  ]

  const practiceTools = [
    {
      id: "virtual-keyboard",
      title: t("virtualKeyboard"),
      description: t("practiceTypingUmwero"),
      icon: BookOpen
    },
    {
      id: "quizzes",
      title: t("quizzes"),
      description: t("testYourKnowledge"),
      icon: Trophy
    }
  ]

  const startLesson = (lessonId: string) => {
    setActiveLesson(lessonId)
  }

  const stopLesson = () => {
    setActiveLesson(null)
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="min-h-screen py-4">
            <Button
              className="fixed top-4 right-4 z-[60] bg-white text-[#8B4513] hover:bg-[#F3E5AB]"
              variant="ghost"
              size="icon"
              onClick={stopLesson}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Show CompleteVowelLesson for vowels lesson */}
            {activeLesson === 'vowels' ? (
              <CompleteVowelLesson />
            ) : (
              // Placeholder for other lessons
              <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 mt-16">
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">
                  Coming Soon: {modules.flatMap(m => m.lessons).find(l => l.id === activeLesson)?.title}
                </h2>
                <p className="text-gray-600">
                  This lesson is currently under development. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intro Video Modal */}
      {showIntroVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white rounded-lg overflow-auto relative p-4">
            <Button
              className="absolute top-4 right-4 z-50"
              variant="ghost"
              size="icon"
              onClick={() => setShowIntroVideo(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <VideoPlayer src="/videos/introTeach.mp4" title={t("introductionToUmweroTeaching")} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            {t("startYourUmweroJourneyToday")}
          </h1>
          <p className="text-xl text-[#D2691E] mb-8">
            {t("interactiveLessonsDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 bg-[#8B4513] hover:bg-[#A0522D]"
              onClick={() => startLesson('vowels')}
            >
              <BookOpen className="h-5 w-5" />
              {t("startLearning")}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#8B4513] text-[#8B4513]" 
              onClick={() => setShowIntroVideo(true)}
            >
              <Play className="h-5 w-5" />
              {t("watchIntroVideo")}
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Progress Section */}
      <section className="py-8 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
              <Input
                type="search"
                placeholder={t("searchLessons")}
                className="pl-10 bg-[#F3E5AB] text-[#8B4513] border-[#8B4513]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-[#8B4513]">{t("yourProgress")}</div>
              <Progress value={progress} className="w-[200px]" />
              <div className="text-[#D2691E]">{progress}%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="w-full justify-start mb-8">
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t("writtenCourses")}
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                {t("videoTutorials")}
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2">
                <Trophy className="h-4 w-4" />
                {t("practiceTools")}
              </TabsTrigger>
              <TabsTrigger value="certification" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                {t("certification")}
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((module, index) => (
                  <Card key={index} className="bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader>
                      <CardTitle className="text-[#8B4513]">{module.title}</CardTitle>
                      <CardDescription className="text-[#D2691E]">
                        {module.lessons.length} {t("lessons")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea 
                        className="h-[400px] overflow-y-auto pr-4"
                        ref={scrollRef}
                      >
                        <div className="space-y-4 pb-4">
                          {module.lessons.map((lesson) => (
                            <Card key={lesson.id} className="bg-white">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-[#8B4513] text-lg">
                                    {lesson.title}
                                  </CardTitle>
                                  {lesson.completed && (
                                    <Badge variant="outline" className="bg-green-100">
                                      {t("completed")}
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-[#D2691E]">
                                  {lesson.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-[#8B4513]">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {lesson.duration}
                                  </div>
                                  <Button
                                    size="sm"
                                    className="gap-2 bg-[#8B4513] hover:bg-[#A0522D]"
                                    onClick={() => startLesson(lesson.id)}
                                  >
                                    {t("startLesson")}
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className={`text-center mt-2 transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
                        <ArrowDown className="h-6 w-6 mx-auto text-[#8B4513] animate-bounce" />
                        <span className="text-sm text-[#8B4513]">{t("scrollForMore")}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader className="p-0">
                      <VideoPlayer src={video.src} title={video.title} />
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h3 className="font-bold text-[#8B4513] mb-2">{video.title}</h3>
                      <p className="text-[#D2691E] text-sm mb-4">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8B4513] text-sm">{video.duration}</span>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Play className="h-4 w-4" />
                          {t("watchNow")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Practice Tools Tab */}
            <TabsContent value="tools">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {practiceTools.map((tool) => (
                  <Card key={tool.id} className="bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader>
                      <CardTitle className="text-[#8B4513] flex items-center gap-2">
                        <tool.icon className="h-5 w-5" />
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-[#D2691E]">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D]">
                        {t("openTool")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Certification Tab */}
            <TabsContent value="certification">
              <div className="space-y-8">
                <AvailableCourses />
                <CourseModules />
                <CertificateDisplay />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}