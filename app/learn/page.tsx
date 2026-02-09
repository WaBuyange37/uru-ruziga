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
import { CompleteVowelLesson, VowelData } from '../../components/lessons/CompleteVowelLesson'

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

  const [vowelLessons, setVowelLessons] = useState<any[]>([])
  const [vowelIndex, setVowelIndex] = useState(0)

  const startLesson = (lessonId: string) => {
    setActiveLesson(lessonId)
    if (lessonId === 'vowels') {
      setVowelIndex(0)
    }
  }

  const stopLesson = () => {
    setActiveLesson(null)
  }

  // Fetch vowel lessons (and consonants) on mount
  useEffect(() => {
    const loadLessons = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch('/api/lessons?type=VOWEL', { headers })
        if (!res.ok) {
          console.warn('Failed to fetch vowel lessons, status:', res.status)
          return
        }
        const data = await res.json()
        let lessons = data.lessons || []

        // Sort by the order field in the database (1-5 for A, U, O, E, I)
        lessons = lessons.sort((a: any, b: any) => a.order - b.order)

        console.log('Loaded vowel lessons:', lessons.map((l: any) => {
          try {
            const content = JSON.parse(l.content)
            return { vowel: content.vowel, order: l.order, title: l.title }
          } catch (e) {
            return { error: 'parse error', order: l.order }
          }
        }))

        setVowelLessons(lessons)
      } catch (error) {
        console.error('Error loading lessons:', error)
      }
    }

    loadLessons()
  }, [])


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
              vowelLessons.length > 0 ? (
                <CompleteVowelLesson
                  vowelData={(() => {
                    try {
                      const content = JSON.parse(vowelLessons[vowelIndex].content)
                      return {
                        vowel: content.vowel,
                        umwero: content.umwero,
                        pronunciation: content.pronunciation,
                        meaning: content.meaning,
                        culturalNote: content.culturalNote,
                        examples: Array.isArray(content.examples) ? content.examples : []
                      } as VowelData
                    } catch (e) {
                      return {
                        vowel: 'a',
                        umwero: '"',
                        pronunciation: '/a/ as in father',
                        meaning: 'Represents Cows',
                        culturalNote: '',
                        examples: []
                      } as VowelData
                    }
                  })()}
                  lessonId={vowelLessons[vowelIndex].id}
                  vowelNumber={vowelIndex + 1}
                  totalVowels={vowelLessons.length}
                  allVowels={vowelLessons.map((l: any) => {
                    try {
                      const c = JSON.parse(l.content)
                      return { vowel: c.vowel, completed: l.progress?.completed || false, id: l.id }
                    } catch (e) {
                      return { vowel: 'a', completed: false, id: l.id }
                    }
                  })}
                  onComplete={async () => {
                    // refresh lessons progress after completion
                    const token = localStorage.getItem('token')
                    const headers: any = {}
                    if (token) headers['Authorization'] = `Bearer ${token}`
                    const res = await fetch('/api/lessons?type=VOWEL', { headers })
                    if (res.ok) {
                      const data = await res.json()
                      setVowelLessons(data.lessons || [])
                    }
                    stopLesson()
                  }}
                  onNext={() => {
                    if (vowelIndex < vowelLessons.length - 1) setVowelIndex(vowelIndex + 1)
                  }}
                  onPrevious={() => {
                    if (vowelIndex > 0) setVowelIndex(vowelIndex - 1)
                  }}
                  hasNext={vowelIndex < vowelLessons.length - 1}
                  hasPrevious={vowelIndex > 0}
                />
              ) : (
                <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 mt-16">
                  <h2 className="text-2xl font-bold text-[#8B4513] mb-4">No vowel lessons found</h2>
                  <p className="text-gray-600">Please try logging in or seeding the database.</p>
                </div>
              )
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
      <section className="relative py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-3 sm:mb-4 text-[#8B4513]">
            {t("startYourUmweroJourneyToday")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#D2691E] mb-6 sm:mb-8 px-2">
            {t("interactiveLessonsDescription")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-2">
            <Button 
              size="lg" 
              className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] w-full sm:w-auto h-12 text-base"
              onClick={() => startLesson('vowels')}
            >
              <BookOpen className="h-5 w-5" />
              {t("startLearning")}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#8B4513] text-[#8B4513] w-full sm:w-auto h-12 text-base" 
              onClick={() => setShowIntroVideo(true)}
            >
              <Play className="h-5 w-5" />
              {t("watchIntroVideo")}
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Progress Section */}
      <section className="py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 items-stretch mb-6 sm:mb-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
              <Input
                type="search"
                placeholder={t("searchLessons")}
                className="pl-10 h-11 bg-[#F3E5AB] text-[#8B4513] border-[#8B4513] w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full bg-[#F3E5AB] p-3 rounded-lg border border-[#8B4513]">
              <div className="text-[#8B4513] text-sm sm:text-base whitespace-nowrap">{t("yourProgress")}</div>
              <Progress value={progress} className="flex-1" />
              <div className="text-[#D2691E] font-semibold text-sm sm:text-base whitespace-nowrap">{progress}%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 mb-6 sm:mb-8 h-auto">
              <TabsTrigger value="courses" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t("writtenCourses")}</span>
                <span className="sm:hidden">Courses</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t("videoTutorials")}</span>
                <span className="sm:hidden">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t("practiceTools")}</span>
                <span className="sm:hidden">Tools</span>
              </TabsTrigger>
              <TabsTrigger value="certification" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t("certification")}</span>
                <span className="sm:hidden">Cert</span>
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {modules.map((module, index) => (
                  <Card key={index} className="bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-[#8B4513] text-lg sm:text-xl">{module.title}</CardTitle>
                      <CardDescription className="text-[#D2691E] text-sm">
                        {module.lessons.length} {t("lessons")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[350px] sm:h-[400px] overflow-y-auto pr-2 sm:pr-4">
                        <div className="space-y-3 sm:space-y-4 pb-4">
                          {module.lessons.map((lesson) => (
                            <Card key={lesson.id} className="bg-white">
                              <CardHeader className="pb-2 sm:pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-[#8B4513] text-base sm:text-lg">
                                    {lesson.title}
                                  </CardTitle>
                                  {lesson.completed && (
                                    <Badge variant="outline" className="bg-green-100 text-xs flex-shrink-0">
                                      {t("completed")}
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-[#D2691E] text-xs sm:text-sm">
                                  {lesson.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                  <div className="flex items-center text-[#8B4513] text-xs sm:text-sm">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    {lesson.duration}
                                  </div>
                                  <Button
                                    size="sm"
                                    className="gap-1 sm:gap-2 bg-[#8B4513] hover:bg-[#A0522D] w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                                    onClick={() => startLesson(lesson.id)}
                                  >
                                    {t("startLesson")}
                                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className={`text-center mt-2 transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
                        <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-[#8B4513] animate-bounce" />
                        <span className="text-xs sm:text-sm text-[#8B4513]">{t("scrollForMore")}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader className="p-0">
                      <VideoPlayer src={video.src} title={video.title} />
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
                      <h3 className="font-bold text-[#8B4513] mb-2 text-sm sm:text-base">{video.title}</h3>
                      <p className="text-[#D2691E] text-xs sm:text-sm mb-3 sm:mb-4">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8B4513] text-xs sm:text-sm">{video.duration}</span>
                        <Button size="sm" variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {practiceTools.map((tool) => (
                  <Card key={tool.id} className="bg-[#F3E5AB] border-[#8B4513]">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-[#8B4513] flex items-center gap-2 text-base sm:text-lg">
                        <tool.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-[#D2691E] text-xs sm:text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D] h-10 sm:h-11 text-sm sm:text-base">
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
