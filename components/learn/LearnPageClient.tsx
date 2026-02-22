// 🚀 CLIENT COMPONENT - Receives pre-fetched server data
// No loading delays - data is already available from server

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
import { EnhancedCharacterGrid } from '@/components/learn/EnhancedCharacterGrid'
import { useTranslation } from '@/hooks/useTranslation'
import { useProgressSummary } from '@/hooks/useProgressSummary'
import { ProgressDebugger } from '@/components/debug/ProgressDebugger'

// 🔥 TYPE DEFINITIONS
interface LessonData {
  id: string
  title: string
  description: string | null
  content: any
  module: string | null
  type: string
  order: number
  duration: number | null
  videoUrl: string | null
  thumbnailUrl: string | null
  isPublished: boolean
  createdAt: Date
}

interface LearnPageClientProps {
  initialVowelLessons: LessonData[]
  initialConsonantLessons: LessonData[]
  initialLigatureLessons: LessonData[]
  totalLessons: number
}

export function LearnPageClient({
  initialVowelLessons,
  initialConsonantLessons,
  initialLigatureLessons,
  totalLessons
}: LearnPageClientProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [showIntroVideo, setShowIntroVideo] = useState(false)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  // 🚀 SINGLE SOURCE OF TRUTH - Database only
  const { summary: progressSummary, loading: progressLoading } = useProgressSummary()

  // 🚀 INSTANT DATA - No loading needed, data comes from server
  const [vowelLessons] = useState<LessonData[]>(initialVowelLessons)
  const [consonantLessons] = useState<LessonData[]>(initialConsonantLessons)
  const [ligatureLessons] = useState<LessonData[]>(initialLigatureLessons)

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const startLesson = (lessonId: string, type: 'vowel' | 'consonant' | 'ligature') => {
    // Navigate to lesson workspace
    window.location.href = `/lessons/${lessonId}`
  }

  const stopLesson = () => {
    setActiveLesson(null)
    // Progress will be automatically updated via useProgressSummary hook
  }

  // Parse lesson content for character data
  const parseCharacterData = (lesson: LessonData) => {
    try {
      const content = typeof lesson.content === 'string' 
        ? JSON.parse(lesson.content) 
        : lesson.content

      // Extract the character based on lesson type and content structure
      let character = ''
      if (content.vowel) {
        character = content.vowel
      } else if (content.consonant) {
        character = content.consonant
      } else if (content.ligature) {
        character = content.ligature
      } else if (content.character) {
        character = content.character
      } else {
        // Fallback: extract from lesson title (e.g., "Consonant B" -> "b")
        const titleMatch = lesson.title.match(/(?:Vowel|Consonant|Ligature)\s+(.+)/)
        character = titleMatch ? titleMatch[1].toLowerCase() : lesson.title.charAt(0).toLowerCase()
      }

      return {
        id: lesson.id,
        vowel: character,
        umwero: content.glyph || content.umwero || '?',
        title: lesson.title,
        description: lesson.description || content.description || '',
        pronunciation: content.pronunciation || '',
        meaning: content.meaning || content.symbol || '',
        culturalNote: content.culturalNote || content.symbol || '',
        duration: lesson.duration || 10,
        difficulty: content.difficulty || 1,
        order: lesson.order,
        imageUrl: lesson.thumbnailUrl || '',
        audioUrl: content.audioUrl,
        examples: content.examples || []
      }
    } catch (e) {
      console.error('Error parsing lesson content:', e)
      return {
        id: lesson.id,
        vowel: lesson.title.charAt(0).toLowerCase(),
        umwero: '?',
        title: lesson.title,
        description: lesson.description || '',
        pronunciation: '',
        meaning: '',
        culturalNote: '',
        duration: 10,
        difficulty: 1,
        order: lesson.order,
        imageUrl: lesson.thumbnailUrl || '',
        audioUrl: null,
        examples: []
      }
    }
  }

  const getCurrentVowelData = (): VowelData | null => {
    if (!activeLesson || currentLessonIndex < 0 || currentLessonIndex >= vowelLessons.length) {
      return null
    }

    try {
      const lesson = vowelLessons[currentLessonIndex]
      const content = typeof lesson.content === 'string' 
        ? JSON.parse(lesson.content) 
        : lesson.content

      return {
        vowel: content.vowel || content.character || 'a',
        umwero: content.umwero || content.glyph || '"',
        pronunciation: content.pronunciation || '',
        meaning: content.meaning || '',
        culturalNote: content.culturalNote || '',
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

  // Filter lessons based on search query
  const filterLessons = (lessons: LessonData[]) => {
    if (!searchQuery) return lessons
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <>
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
                    const c = typeof l.content === 'string' ? JSON.parse(l.content) : l.content
                    return { vowel: c.vowel || c.character || 'a', completed: false, id: l.id }
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
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Preserving Rwandan Heritage</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Globe className="h-4 w-4 text-blue-500" />
              <a href="https://endangeredalphabets.net/umwero/" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                Endangered Alphabets Project
              </a>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <BookOpen className="h-4 w-4 text-green-500" />
              <a href="https://scriptkeepers.org/projects" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                ScriptKeepers Initiative
              </a>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[#8B4513]">
            {mounted ? t("startYourUmweroJourneyToday") : "Start Your Umwero Journey Today"}
          </h1>
          <p className="text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
            Learn the authentic Umwero script character by character. Each lesson reveals the deep cultural significance and helps preserve this endangered writing system for future generations.
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
          {/* Debug Component - Remove in production */}
          <ProgressDebugger />
          
          <Card className="bg-white/80 backdrop-blur border-[#8B4513]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <Target className="h-8 w-8 text-[#8B4513] flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#8B4513]">{t("yourProgress")}</span>
                      <span className="text-sm font-bold text-[#D2691E]">
                        {progressLoading ? '...' : `${progressSummary.overall.percentage}%`}
                      </span>
                    </div>
                    <Progress value={progressLoading ? 0 : progressSummary.overall.percentage} className="h-3" />
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
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 mb-8 h-auto bg-white/80 backdrop-blur p-2">
              <TabsTrigger value="vowels" className="gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Vowels</span>
                <span className="sm:hidden">V</span>
                <span className="hidden md:inline">({vowelLessons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="consonants" className="gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Consonants</span>
                <span className="sm:hidden">C</span>
                <span className="hidden md:inline">({consonantLessons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="ibihekane" className="gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Ibihekane</span>
                <span className="sm:hidden">I</span>
                <span className="hidden md:inline">({ligatureLessons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <Video className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Videos</span>
                <span className="sm:hidden">V</span>
              </TabsTrigger>
            </TabsList>

            {/* Vowels Tab */}
            <TabsContent value="vowels" className="space-y-6">
              <EnhancedCharacterGrid
                characters={filterLessons(vowelLessons).map(lesson => {
                  const charData = parseCharacterData(lesson)
                  return {
                    ...charData,
                    examples: charData.examples || []
                  }
                })}
                type="vowel"
                title={mounted ? t("umweroVowels") : "Umwero Vowels"}
                description={mounted ? t("learnVowelCharacters") : "Learn the 5 vowel characters and their cultural significance"}
                onStartLesson={startLesson}
                language={mounted ? (localStorage.getItem('language') as 'en' | 'rw') || 'en' : 'en'}
              />
            </TabsContent>

            {/* Consonants Tab */}
            <TabsContent value="consonants" className="space-y-6">
              <EnhancedCharacterGrid
                characters={filterLessons(consonantLessons).map(lesson => {
                  const charData = parseCharacterData(lesson)
                  return {
                    ...charData,
                    examples: charData.examples || []
                  }
                })}
                type="consonant"
                title={mounted ? t("umweroConsonants") : "Umwero Consonants"}
                description={mounted ? t("masterConsonantCharacters") : "Master consonant characters and combinations"}
                onStartLesson={startLesson}
                language={mounted ? (localStorage.getItem('language') as 'en' | 'rw') || 'en' : 'en'}
              />
            </TabsContent>

            {/* Ibihekane (Ligatures) Tab */}
            <TabsContent value="ibihekane" className="space-y-6">
              <EnhancedCharacterGrid
                characters={filterLessons(ligatureLessons).map(lesson => {
                  const charData = parseCharacterData(lesson)
                  return {
                    ...charData,
                    examples: charData.examples || []
                  }
                })}
                type="ligature"
                title="Ibihekane - Compound Characters"
                description="Master advanced compound characters - the building blocks of complex Umwero writing"
                onStartLesson={startLesson}
                language={mounted ? (localStorage.getItem('language') as 'en' | 'rw') || 'en' : 'en'}
              />
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="bg-white border-[#8B4513] overflow-hidden">
                    <div className="aspect-video relative">
                      <VideoPlayer src={video.src} title={video.title} />
                    </div>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-[#8B4513] mb-2 text-base md:text-lg">{video.title}</h3>
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
                Join the Cultural Movement
              </h3>
              <p className="text-amber-700 leading-relaxed">
                Every character you learn helps preserve the endangered Umwero script and honors Rwandan cultural heritage. Together, we can ensure this beautiful writing system continues to inspire future generations and maintains its place in the rich tapestry of African linguistic diversity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}