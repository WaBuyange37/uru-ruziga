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
  Sparkles
} from 'lucide-react'
import { CompleteVowelLesson, VowelData } from '@/components/lessons/CompleteVowelLesson'
import { VideoPlayer } from "@/components/VideoPlayer"
import { EnhancedCharacterGrid } from '@/components/learn/EnhancedCharacterGrid'
import { useTranslation } from '@/hooks/useTranslation'
import { useProgressSummary } from '@/hooks/useProgressSummary'
import { lessonIdToCharacterId } from '@/lib/character-mapping'

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
  characterId: string | null
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
              className="fixed top-3 right-3 z-[60] h-9 w-9 rounded-full bg-white text-[#8B4513] shadow-lg hover:bg-white"
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
                characterId={
                  vowelLessons[currentLessonIndex].characterId ||
                  lessonIdToCharacterId(vowelLessons[currentLessonIndex].id)
                }
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

      {/* ── Current Lesson Section ── */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_360px] lg:items-stretch">
          <div className="rounded-lg border border-[#8B4513]/20 bg-white p-5 sm:p-7">
            <Badge variant="outline">Current lesson</Badge>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-black sm:text-4xl">
              {vowelLessons[0]?.title || "Start Your Umwero Journey"}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-black/70">
              Start with the next available card, practice the character, and return here as your saved progress grows.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2"
              onClick={() => vowelLessons.length > 0 && startLesson(vowelLessons[0].id, 'vowel')}
            >
              <Sparkles className="h-5 w-5 shrink-0" />
              Continue Learning
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={() => setShowIntroVideo(true)}
            >
              <Play className="h-5 w-5 shrink-0" />
              {t("watchIntroVideo")}
            </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-[#8B4513]">Current focus</p>
              <h2 className="mt-2 text-xl font-bold text-black">
                {vowelLessons[0]?.title || "First available lesson"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/65">
                {progressLoading ? "Loading progress..." : `${progressSummary.overall.learned} characters learned out of ${progressSummary.overall.total || totalLessons}.`}
              </p>
              <Progress
                value={progressSummary.overall.percentage || 0}
                className="mt-4 h-3"
              />
            </CardContent>
          </Card>
          </div>
      </section>

      {/* ── Main Content ── */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black">Available Lessons</h2>
              <p className="mt-1 text-base text-black/65">Choose one card. The queue uses your saved progress.</p>
            </div>
          <div className="relative max-w-md sm:min-w-[320px]">
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
          </div>

          <Tabs defaultValue="vowels" className="w-full">
            {/* ── Tab List ── */}
            <TabsList
              className="
                grid grid-cols-4 mb-8
                h-auto p-1.5
                bg-white
                rounded-lg shadow-sm border border-[#8B4513]/20
                gap-1
              "
            >
              {tabs.map(({ value, icon, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    flex flex-col items-center justify-center gap-1
                    rounded-md py-2.5 px-1
                    transition-all duration-200
                    data-[state=active]:bg-[#8B4513] data-[state=active]:text-white data-[state=active]:shadow-md
                    data-[state=inactive]:text-[#8B4513]/60 data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:text-[#8B4513]
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
                description="Begin with the next visible vowel card."
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
                description="Continue with consonant cards when you are ready."
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
                description="Practice compound characters after the basics feel familiar."
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
                      <p className="text-black/65 text-xs sm:text-sm mb-3 leading-relaxed line-clamp-2">
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

    </>
  )
}
