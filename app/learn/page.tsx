// app/learn/page-unified.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Video, 
  Trophy, 
  Search, 
  X, 
  Play, 
  Heart,
  Globe,
  Sparkles,
  Target
} from 'lucide-react'
import { CharacterCard } from '@/components/learn/CharacterCard'
import { CompleteVowelLesson, VowelData } from '@/components/lessons/CompleteVowelLesson'
import { VideoPlayer } from "@/components/VideoPlayer"
import { useTranslation } from '@/hooks/useTranslation'

interface LessonData {
  id: string
  title: string
  description: string
  content: string
  module: string
  type: string
  order: number
  duration: number
}

export default function UnifiedLearnPage() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [showIntroVideo, setShowIntroVideo] = useState(false)
  
  // Lessons state
  const [vowelLessons, setVowelLessons] = useState<LessonData[]>([])
  const [consonantLessons, setConsonantLessons] = useState<LessonData[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load lessons from API
  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Fetch vowels
      const vowelsRes = await fetch('/api/lessons?type=VOWEL', { headers })
      if (vowelsRes.ok) {
        const data = await vowelsRes.json()
        const sorted = (data.lessons || []).sort((a: any, b: any) => a.order - b.order)
        setVowelLessons(sorted)
      }

      // Fetch consonants
      const consonantsRes = await fetch('/api/lessons?type=CONSONANT', { headers })
      if (consonantsRes.ok) {
        const data = await consonantsRes.json()
        const sorted = (data.lessons || []).sort((a: any, b: any) => a.order - b.order)
        setConsonantLessons(sorted)
      }

      // Calculate progress
      calculateProgress()
    } catch (error) {
      console.error('Error loading lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch('/api/progress/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setProgress(data.overview?.progressPercentage || 0)
      }
    } catch (error) {
      console.error('Error calculating progress:', error)
    }
  }

  const startLesson = (lessonId: string, type: 'vowel' | 'consonant') => {
    // Navigate to new single-page lesson workspace
    window.location.href = `/lessons/${lessonId}`
  }

  const stopLesson = () => {
    setActiveLesson(null)
    loadLessons() // Refresh to get updated progress
  }

  const parseCharacterData = (lesson: LessonData) => {
    try {
      const content = JSON.parse(lesson.content)
      return {
        id: lesson.id,
        vowel: content.vowel || content.consonant || '',
        umwero: content.umwero || '',
        title: lesson.title,
        description: lesson.description,
        pronunciation: content.pronunciation || '',
        meaning: content.meaning || '',
        culturalNote: content.culturalNote || '',
        duration: lesson.duration,
        difficulty: 1,
        order: lesson.order,
        imageUrl: `/UmweroLetaByLeta/${(content.vowel || content.consonant || 'a').toLowerCase()}/${(content.vowel || content.consonant || 'A')}-ways.png`,
        audioUrl: `/UmweroLetaByLeta/${(content.vowel || content.consonant || 'a').toLowerCase()}/${(content.vowel || content.consonant || 'A')}.mp3`,
        examples: content.examples || []
      }
    } catch (e) {
      return null
    }
  }

  const getCurrentVowelData = (): VowelData | null => {
    if (!activeLesson || currentLessonIndex < 0 || currentLessonIndex >= vowelLessons.length) {
      return null
    }

    try {
      const lesson = vowelLessons[currentLessonIndex]
      const content = JSON.parse(lesson.content)
      return {
        vowel: content.vowel,
        umwero: content.umwero,
        pronunciation: content.pronunciation,
        meaning: content.meaning,
        culturalNote: content.culturalNote,
        examples: Array.isArray(content.examples) ? content.examples : []
      }
    } catch (e) {
      return null
    }
  }

  const videoTutorials = [
    {
      id: "intro",
      title: t("introductionToUmweroTeaching"),
      src: "/videos/introTeach1.mp4",
      description: t("startUmweroJourney"),
      duration: "12:45"
    },
    {
      id: "numbers",
      title: t("imibireExploringUmwero"),
      src: "/videos/imibare1.mp4",
      description: t("learnToWriteNumbers"),
      duration: "15:30"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="min-h-screen py-4">
            <Button
              className="fixed top-4 right-4 z-[60] bg-white text-[#8B4513] hover:bg-[#F3E5AB] shadow-lg"
              variant="ghost"
              size="icon"
              onClick={stopLesson}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {vowelLessons.length > 0 && getCurrentVowelData() && (
              <CompleteVowelLesson
                vowelData={getCurrentVowelData()!}
                lessonId={vowelLessons[currentLessonIndex].id}
                vowelNumber={currentLessonIndex + 1}
                totalVowels={vowelLessons.length}
                allVowels={vowelLessons.map((l: any) => {
                  try {
                    const c = JSON.parse(l.content)
                    return { vowel: c.vowel, completed: false, id: l.id }
                  } catch (e) {
                    return { vowel: 'a', completed: false, id: l.id }
                  }
                })}
                onComplete={stopLesson}
                onNext={() => {
                  if (currentLessonIndex < vowelLessons.length - 1) {
                    setCurrentLessonIndex(currentLessonIndex + 1)
                  }
                }}
                onPrevious={() => {
                  if (currentLessonIndex > 0) {
                    setCurrentLessonIndex(currentLessonIndex - 1)
                  }
                }}
                hasNext={currentLessonIndex < vowelLessons.length - 1}
                hasPrevious={currentLessonIndex > 0}
              />
            )}
          </div>
        </div>
      )}

      {/* Intro Video Modal */}
      {showIntroVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg overflow-hidden relative">
            <Button
              className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white"
              variant="ghost"
              size="icon"
              onClick={() => setShowIntroVideo(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <VideoPlayer src="/videos/introTeach1.mp4" title={t("introductionToUmweroTeaching")} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Cultural Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">{mounted ? "Preserving Rwandan Heritage" : "Preserving Rwandan Heritage"}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{mounted ? "UNESCO Endangered Script" : "UNESCO Endangered Script"}</span>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[#8B4513]">
            {mounted ? t("startYourUmweroJourneyToday") : "Start Your Umwero Journey Today"}
          </h1>
          <p className="text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
            {mounted 
              ? "Learn the authentic Umwero script character by character. Each lesson reveals the deep cultural significance and helps preserve this endangered writing system for future generations."
              : "Learn the authentic Umwero script character by character. Each lesson reveals the deep cultural significance and helps preserve this endangered writing system for future generations."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => vowelLessons.length > 0 && startLesson(vowelLessons[0].id, 'vowel')}
            >
              <Sparkles className="h-5 w-5" />
              {t("startLearning")}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]" 
              onClick={() => setShowIntroVideo(true)}
            >
              <Play className="h-5 w-5" />
              {t("watchIntroVideo")}
            </Button>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-white/80 backdrop-blur border-[#8B4513]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <Target className="h-8 w-8 text-[#8B4513] flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#8B4513]">{t("yourProgress")}</span>
                      <span className="text-sm font-bold text-[#D2691E]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B4513]" />
                  <Input
                    type="search"
                    placeholder={t("searchLessons")}
                    className="pl-10 bg-[#F3E5AB] border-[#8B4513] text-[#8B4513]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="vowels" className="w-full">
            <TabsList className="w-full grid grid-cols-3 gap-2 mb-8 h-auto bg-white/80 backdrop-blur p-2">
              <TabsTrigger value="vowels" className="gap-2 data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <BookOpen className="h-4 w-4" />
                <span>Vowels ({vowelLessons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="consonants" className="gap-2 data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <BookOpen className="h-4 w-4" />
                <span>Consonants ({consonantLessons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2 data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <Video className="h-4 w-4" />
                <span>Videos</span>
              </TabsTrigger>
            </TabsList>

            {/* Vowels Tab */}
            <TabsContent value="vowels" className="space-y-6">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🌍</div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">
                        {mounted ? t("umweroVowels") : "Umwero Vowels"}
                      </h3>
                      <p className="text-blue-700">
                        {mounted ? t("learnVowelCharacters") : "Learn the 5 vowel characters and their cultural significance"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vowelLessons.map((lesson, index) => {
                  const charData = parseCharacterData(lesson)
                  if (!charData) return null

                  return (
                    <CharacterCard
                      key={lesson.id}
                      character={charData}
                      isLocked={index > 0 && !vowelLessons[index - 1]} // Simple lock logic
                      onStart={() => startLesson(lesson.id, 'vowel')}
                    />
                  )
                })}
              </div>
            </TabsContent>

            {/* Consonants Tab */}
            <TabsContent value="consonants" className="space-y-6">
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h3 className="text-xl font-semibold text-amber-800 mb-2">
                        {mounted ? t("umweroConsonants") : "Umwero Consonants"}
                      </h3>
                      <p className="text-amber-700">
                        {mounted ? t("masterConsonantCharacters") : "Master consonant characters and combinations"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consonantLessons.map((lesson, index) => {
                  const charData = parseCharacterData(lesson)
                  if (!charData) return null

                  return (
                    <CharacterCard
                      key={lesson.id}
                      character={charData}
                      isLocked={vowelLessons.length === 0} // Unlock after vowels
                      onStart={() => startLesson(lesson.id, 'consonant')}
                    />
                  )
                })}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid md:grid-cols-2 gap-6">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="bg-white border-[#8B4513] overflow-hidden">
                    <div className="aspect-video relative">
                      <VideoPlayer src={video.src} title={video.title} />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-[#8B4513] mb-2 text-lg">{video.title}</h3>
                      <p className="text-[#D2691E] text-sm mb-4">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8B4513] text-sm">{video.duration}</span>
                        <Badge variant="outline">{mounted ? t("videoTutorials") : "Video"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Cultural Footer */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-2xl font-semibold text-amber-800 mb-3">
                {mounted ? "Join the Cultural Movement" : "Join the Cultural Movement"}
              </h3>
              <p className="text-amber-700 leading-relaxed">
                {mounted 
                  ? "Every character you learn helps preserve the endangered Umwero script and honors Rwandan cultural heritage. Together, we can ensure this beautiful writing system continues to inspire future generations and maintains its place in the rich tapestry of African linguistic diversity."
                  : "Every character you learn helps preserve the endangered Umwero script and honors Rwandan cultural heritage. Together, we can ensure this beautiful writing system continues to inspire future generations and maintains its place in the rich tapestry of African linguistic diversity."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
