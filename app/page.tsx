"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, CircleIcon, MessageCircle, Play, PenTool, TrendingUp } from "lucide-react"
import { useAuth } from "./contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ImageAsset } from "../components/ui/ImageAssets"
import { kbCultureNotes, kbDefinitions, kbFoundations, kbHome } from "../lib/umwero-knowledge-base"

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-base font-medium text-black">Loading...</p>
      </div>
    )
  }

  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"
  const primaryLabel = isAuthenticated ? "Continue Learning" : "Start Learning"

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="rounded-lg border border-[#8B4513]/20 bg-white p-6 sm:p-8">
            <Badge variant="secondary">Umwero for Kinyarwanda</Badge>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              {isAuthenticated ? `Welcome back, ${user?.fullName || "learner"}` : "Learn Umwero"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-black/70">
              {kbHome.hero}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
              {kbDefinitions.uruziga}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={primaryHref}>
                  <BookOpen className="h-4 w-4" />
                  {primaryLabel}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/translate">Open Translator</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-[#8B4513]/20 bg-white">
            <ImageAsset
              name="logo"
              alt="Uruziga Umwero learning visual"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <PenTool className="h-5 w-5 text-[#8B4513]" />
                Continue Learning
              </CardTitle>
            <CardDescription>{kbHome.nextAction}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Button asChild className="h-auto justify-start py-4">
                <Link href="/learn">
                  <BookOpen className="h-4 w-4" />
                  Lessons
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto justify-start py-4">
                <Link href="/dashboard">
                  <TrendingUp className="h-4 w-4" />
                  Progress
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto justify-start py-4">
                <Link href="/community">
                  <MessageCircle className="h-4 w-4" />
                  Ask Community
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CircleIcon className="h-5 w-5 text-[#8B4513]" />
                Why Writing Matters
              </CardTitle>
              <CardDescription>{kbCultureNotes[0].title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-black/70">
                {kbHome.whyWriting}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Featured Lessons</h2>
              <p className="mt-1 text-base text-black/65">Start with the writing system, then connect character practice to cultural foundations.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/learn">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Vowels", "Start with the first visible sound shapes.", "a"],
              ["Consonants", "Build character recognition through practice.", "m"],
              ["Ibihekane", "Practice compound Kinyarwanda sounds.", "rw"],
              ["Translator", "Use the existing mappings while you study.", "u"],
            ].map(([title, description, glyph]) => (
              <Card key={title}>
                <CardContent className="p-5">
                  <div className="flex h-20 items-center justify-center rounded-lg bg-white font-umwero text-5xl text-[#8B4513]">
                    {glyph}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/65">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Tutorials</h2>
            <p className="mt-1 text-base text-black/65">Short videos for learners who want a guided start.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["/videos/introTeach1.mp4", "Introduction to Umwero"],
              ["/videos/imibare1.mp4", "Writing Numbers"],
            ].map(([src, title]) => (
              <Card key={src} className="overflow-hidden">
                <div className="aspect-video bg-black">
                  <video className="h-full w-full" controls preload="metadata">
                    <source src={src} type="video/mp4" />
                  </video>
                </div>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <h3 className="font-semibold text-black">{title}</h3>
                  <Play className="h-4 w-4 text-[#8B4513]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-[#8B4513]/20 bg-white p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold">Three Cultural Foundations</h2>
          <p className="mx-auto mt-2 max-w-2xl text-base leading-7 text-black/70">
            Discover how Imana, Inka, and Ingoma help learners understand the cultural imagination behind Umwero.
          </p>
          <div className="mt-5 grid gap-3 text-left md:grid-cols-3">
            {kbFoundations.map((foundation) => (
              <div key={foundation.name} className="rounded-lg border border-[#8B4513]/20 bg-white p-4">
                <p className="font-semibold text-[#8B4513]">{foundation.name}</p>
                <p className="mt-2 text-sm leading-6 text-black/70">{foundation.title}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Button asChild>
              <Link href="/culture-and-history">Explore Culture & History</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
