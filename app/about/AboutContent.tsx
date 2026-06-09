"use client"

import Link from "next/link"
import { BookOpen, CircleIcon, Landmark, PenTool } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { kbDefinitions, kbFoundations, kbTimeline } from "../../lib/umwero-knowledge-base"

const sections = [
  {
    title: "Introduction",
    body:
      "Umwero is a writing system for Kinyarwanda. Uruziga is the educational platform that helps learners study, practice, and use it.",
  },
  {
    title: "Purpose",
    body:
      "Umwero was created to help Kinyarwanda be written through forms connected to its own sounds, heritage, identity, and learning.",
  },
  {
    title: "Creator Vision",
    body:
      "Kwizera Mugisha created Umwero so Kinyarwanda could be represented by a writing system connected to its own sounds, structure, and cultural roots.",
  },
  {
    title: "Philosophical Inspiration",
    body:
      "At the heart of Umwero is a simple belief: a people can honor their language by giving it a written form that reflects their own way of seeing the world.",
  },
  {
    title: "Umwero and Kinyarwanda",
    body:
      "Kwizera noticed that some spoken Kinyarwanda sounds were difficult to represent clearly with Latin-script writing. Umwero grew from that concern.",
  },
  {
    title: "Preservation Through Writing",
    body:
      "Umwero turns sound, shape, and cultural memory into a writing system so learners can connect language practice with Rwandan identity and heritage.",
  },
]

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-white text-black">
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Badge variant="outline">About Umwero and Uruziga</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            A Kinyarwanda writing system, taught through a learner platform.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-black/70 sm:text-lg">
            {kbDefinitions.umwero}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/learn">
                <BookOpen className="h-4 w-4" />
                Start Learning
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/culture-and-history">Explore Culture & History</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-xl text-black">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-7 text-black/70">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-black">Creation Timeline</h2>
            <p className="mt-1 text-base text-black/65">A short path through the moments that shaped Umwero.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {kbTimeline.map((item) => (
              <Card key={`${item.date}-${item.title}`}>
                <CardContent className="p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8B4513]">{item.date}</p>
                  <h3 className="mt-3 text-lg font-semibold text-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/70">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-black">Three Cultural Foundations</h2>
            <p className="mt-1 text-base text-black/65">Meet the cultural roots that help explain the spirit and shape of Umwero.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {kbFoundations.map((foundation, index) => {
              const Icon = index === 0 ? CircleIcon : index === 1 ? PenTool : Landmark
              return (
                <Card key={foundation.name}>
                  <CardContent className="p-5">
                    <Icon className="h-6 w-6 text-[#8B4513]" />
                    <h3 className="mt-4 text-xl font-semibold text-black">{foundation.name}</h3>
                    <p className="mt-1 font-medium text-[#8B4513]">{foundation.title}</p>
                    <p className="mt-3 text-sm leading-6 text-black/70">{foundation.body}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
