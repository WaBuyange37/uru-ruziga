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
import { CompleteVowelLesson, VowelData } from '@/components/lessons/CompleteVowelLesson'
import { VideoPlayer } from "@/components/VideoPlayer"
import { EnhancedCharacterGrid } from '@/components/learn/EnhancedCharacterGrid'
import { useTranslation } from '@/hooks/useTranslation'
import { useProgressSummary } from '@/hooks/useProgressSummary'
import { ProgressDebugger } from '@/components/debug/ProgressDebugger'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export function LearnPageClient({
  initialVowelLessons,
  initialConsonantLessons,
  initialLigatureLessons,
  totalLessons,
}: LearnPageClientProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [showIntroVideo, setShowIntroVideo] = useState(false)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  const { summary: progressSummary, loading: progressLoading } = useProgressSummary()

  const [vowelLessons] = useState<LessonData[]>(initialVowelLessons)
  const [consonantLessons] = useState<LessonData[]>(initialConsonantLessons)
  const [ligatureLessons] = useState<LessonData[]>(initialLigatureLessons)

  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll when a modal is open
  useEffect(() => {
    document.body.style.overflow = (activeLesson || showIntroVideo) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeLesson, showIntroVideo])

  const startLesson = (lessonId: string, _type: 'vowel' | 'consonant' | 'ligature') => {
    window.location.href = `/lessons/${lessonId}`
  }

  const stopLesson = () => setActiveLesson(null)

  const parseCharacterData = (lesson: LessonData) => {
    try {
      const content = typeof lesson.content === 'string'
        ? JSON.parse(lesson.content)
        : lesson.content

      let character = ''
      if (content.vowel)           character = content.vowel
      else if (content.consonant)  character = content.consonant
      else if (content.ligature)   character = content.ligature
      else if (content.character)  character = content.character
      else {
        const m = lesson.title.match(/(?:Vowel|Consonant|Ligature)\s+(.+)/)
        character = m ? m[1].toLowerCase() : lesson.title.charAt(0).toLowerCase()
      }

      return {
        id:           lesson.id,
        vowel:        character,
        umwero:       content.glyph || content.umwero || '?',
        title:        lesson.title,
        description:  lesson.description || content.description || '',
        pronunciation:content.pronunciation || '',
        meaning:      content.meaning || content.symbol || '',
        culturalNote: content.culturalNote || content.symbol || '',
        duration:     lesson.duration || 10,
        difficulty:   content.difficulty || 1,
        order:        lesson.order,
        imageUrl:     lesson.thumbnailUrl || '',
        audioUrl:     content.audioUrl,
        examples:     content.examples || [],
      }
    } catch {
      return {
        id: lesson.id, vowel: lesson.title.charAt(0).toLowerCase(),
        umwero: '?', title: lesson.title, description: lesson.description || '',
        pronunciation: '', meaning: '', culturalNote: '', duration: 10,
        difficulty: 1, order: lesson.order, imageUrl: lesson.thumbnailUrl || '',
        audioUrl: null, examples: [],
      }
    }
  }

  const getCurrentVowelData = (): VowelData | null => {
    if (!activeLesson || currentLessonIndex < 0 || currentLessonIndex >= vowelLessons.length) return null
    try {
      const lesson = vowelLessons[currentLessonIndex]
      const content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content
      return {
        vowel:       content.vowel || content.character || 'a',
        umwero:      content.umwero || content.glyph || '"',
        pronunciation: content.pronunciation || '',
        meaning:     content.meaning || '',
        culturalNote:content.culturalNote || '',
        examples:    Array.isArray(content.examples) ? content.examples : [],
      }
    } catch { return null }
  }

  const videoTutorials = [
    {
      id: "intro",
      title: t("introductionToUmweroTeaching"),
      src: "/videos/introTeach1.mp4",
      description: t("startUmweroJourney"),
      duration: "12:45",
    },
    {
      id: "numbers",
      title: t("imibireExploringUmwero"),
      src: "/videos/imibare1.mp4",
      description: t("learnToWriteNumbers"),
      duration: "15:30",
    },
  ]

  const filterLessons = (lessons: LessonData[]) =>
    searchQuery
      ? lessons.filter(l =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : lessons

  const lang = mounted ? (localStorage.getItem('language') as 'en' | 'rw') || 'en' : 'en'

  // ─── Tabs config (keeps JSX DRY) ─────────────────────────────────────────
  const tabs = [
    {
      value: 'vowels',
      icon: <BookOpen className="h-[18px] w-[18px] shrink-0" />,
      label: 'Vowels',
      count: vowelLessons.length,
    },
    {
      value: 'consonants',
      icon: <BookOpen className="h-[18px] w-[18px] shrink-0" />,
      label: 'Consonants',
      count: consonantLessons.length,
    },
    {
      value: 'ibihekane',
      icon: <Trophy className="h-[18px] w-[18px] shrink-0" />,
      label: 'Ibihekane',
      count: ligatureLessons.length,
    },
    {
      value: 'videos',
      icon: <Video className="h-[18px] w-[18px] shrink-0" />,
      label: 'Videos',
      count: null,
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Lesson Modal ── */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="min-h-screen py-4 px-2 sm:px-4">
            <Button
              className="fixed top-3 right-3 z-[60] h-9 w-9 rounded-full bg-white text-[#8B4513] shadow-lg hover:bg-[#F3E5AB]"
              variant="ghost"
              size="icon"
              onClick={stopLesson}
              aria-label="Close lesson"
            >
              <X className="h-5 w-5" />
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
                  } catch { return { vowel: 'a', completed: false, id: l.id } }
                })}
                onComplete={stopLesson}
                onNext={() => { if (currentLessonIndex < vowelLessons.length - 1) setCurrentLessonIndex(i => i + 1) }}
                onPrevious={() => { if (currentLessonIndex > 0) setCurrentLessonIndex(i => i - 1) }}
                hasNext={currentLessonIndex < vowelLessons.length - 1}
                hasPrevious={currentLessonIndex > 0}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Intro Video Modal ── */}
      {showIntroVideo && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setShowIntroVideo(false)}
        >
          <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl">
            <Button
              className="absolute top-3 right-3 z-50 h-8 w-8 rounded-full bg-white/90 text-[#8B4513] hover:bg-white"
              variant="ghost"
              size="icon"
              onClick={() => setShowIntroVideo(false)}
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </Button>
            <VideoPlayer src="/videos/introTeach1.mp4" title={t("introductionToUmweroTeaching")} />
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">

          {/* Cultural Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span>Preserving Rwandan Heritage</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <a
                href="https://endangeredalphabets.net/umwero/"
                target="_blank" rel="noopener noreferrer"
                className="hover:underline"
              >
                Endangered Alphabets Project
              </a>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <a
                href="https://scriptkeepers.org/projects"
                target="_blank" rel="noopener noreferrer"
                className="hover:underline"
              >
                ScriptKeepers Initiative
              </a>
            </Badge>
          </div>

          {/* Heading — fluid scale via clamp-like Tailwind classes */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-4 text-[#8B4513]">
            {mounted ? t("startYourUmweroJourneyToday") : "Start Your Umwero Journey Today"}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto leading-relaxed">
            Learn the authentic Umwero script character by character. Each lesson reveals the deep cultural significance and helps preserve this endangered writing system for future generations.
          </p>

          {/* CTA Buttons — stack on mobile, row on sm+ */}
          <div className="flex flex-col xs:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              className="w-full xs:w-auto gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => vowelLessons.length > 0 && startLesson(vowelLessons[0].id, 'vowel')}
            >
              <Sparkles className="h-5 w-5 shrink-0" />
              {t("startLearning")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full xs:w-auto gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
              onClick={() => setShowIntroVideo(true)}
            >
              <Play className="h-5 w-5 shrink-0" />
              {t("watchIntroVideo")}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Optional: Search bar */}
          <div className="relative mb-6 max-w-md mx-auto sm:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B4513]/50 pointer-events-none" />
            <Input
              placeholder="Search lessons…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 border-[#8B4513]/30 focus-visible:ring-[#8B4513]"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513]/60 hover:text-[#8B4513]"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Tabs defaultValue="vowels" className="w-full">
            {/* ── Tab List ── */}
            <TabsList
              className="
                grid grid-cols-4 mb-8
                h-auto p-1.5
                bg-white/80 backdrop-blur
                rounded-2xl shadow-sm border border-amber-100
                gap-1
              "
            >
              {tabs.map(({ value, icon, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    flex flex-col items-center justify-center gap-1
                    rounded-xl py-2.5 px-1
                    transition-all duration-200
                    data-[state=active]:bg-[#8B4513] data-[state=active]:text-white data-[state=active]:shadow-md
                    data-[state=inactive]:text-[#8B4513]/60 data-[state=inactive]:hover:bg-amber-50 data-[state=inactive]:hover:text-[#8B4513]
                    min-h-[3.5rem]
                    group
                  "
                >
                  {/* Icon — slightly larger, always visible */}
                  <span className="flex items-center justify-center h-5 w-5 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                    {icon}
                  </span>

                  {/* Full label — always shown, wraps if needed */}
                  <span className="text-[11px] leading-tight font-semibold text-center tracking-wide w-full px-0.5 truncate">
                    {label}
                  </span>

                  {/* Count pill — visible on sm+ */}
                  {count !== null && (
                    <span
                      className="
                        hidden sm:inline-flex items-center justify-center
                        h-4 min-w-[1.1rem] px-1 rounded-full
                        text-[9px] font-bold leading-none
                        bg-[#8B4513]/10 text-[#8B4513]
                        data-[state=active]:bg-white/20 data-[state=active]:text-white
                        group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white
                      "
                    >
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Vowels ── */}
            <TabsContent value="vowels" className="space-y-6">
              <EnhancedCharacterGrid
                characters={filterLessons(vowelLessons).map(l => ({ ...parseCharacterData(l), examples: parseCharacterData(l).examples || [] }))}
                type="vowel"
                title={mounted ? t("umweroVowels") : "Umwero Vowels"}
                description={mounted ? t("learnVowelCharacters") : "Learn the 5 vowel characters and their cultural significance"}
                onStartLesson={startLesson}
                language={lang}
              />
            </TabsContent>

            {/* ── Consonants ── */}
            <TabsContent value="consonants" className="space-y-6">
              <EnhancedCharacterGrid
                characters={filterLessons(consonantLessons).map(l => ({ ...parseCharacterData(l), examples: parseCharacterData(l).examples || [] }))}
                type="consonant"
                title={mounted ? t("umweroConsonants") : "Umwero Consonants"}
                description={mounted ? t("masterConsonantCharacters") : "Master consonant characters and combinations"}
                onStartLesson={startLesson}
                language={lang}
              />
            </TabsContent>

            {/* ── Ibihekane ── */}
            <TabsContent value="ibihekane" className="space-y-6">
              <EnhancedCharacterGrid
                characters={filterLessons(ligatureLessons).map(l => ({ ...parseCharacterData(l), examples: parseCharacterData(l).examples || [] }))}
                type="ligature"
                title="Ibihekane — Compound Characters"
                description="Master advanced compound characters — the building blocks of complex Umwero writing"
                onStartLesson={startLesson}
                language={lang}
              />
            </TabsContent>

            {/* ── Videos ── */}
            <TabsContent value="videos">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="bg-white border-[#8B4513]/30 overflow-hidden rounded-xl">
                    {/* 16/9 ratio container */}
                    <div className="aspect-video">
                      <VideoPlayer src={video.src} title={video.title} />
                    </div>
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="font-bold text-[#8B4513] mb-1.5 text-sm sm:text-base leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-[#D2691E] text-xs sm:text-sm mb-3 leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8B4513] text-xs sm:text-sm font-medium tabular-nums">
                          {video.duration}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {mounted ? t("videoTutorials") : "Video"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ── Cultural Footer Card ── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-10 text-center">
              <div className="text-4xl sm:text-5xl mb-4" role="img" aria-label="Heritage">🏛️</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-amber-800 mb-3">
                Join the Cultural Movement
              </h3>
              <p className="text-sm sm:text-base text-amber-700 leading-relaxed max-w-2xl mx-auto">
                Every character you learn helps preserve the endangered Umwero script and honors Rwandan cultural heritage. Together, we can ensure this beautiful writing system continues to inspire future generations and maintains its place in the rich tapestry of African linguistic diversity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}