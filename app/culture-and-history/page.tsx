import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, CircleIcon, Landmark, PenTool } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { kbCultureNotes, kbFoundations, kbSeo } from "../../lib/umwero-knowledge-base"

export const metadata: Metadata = {
  title: `${kbSeo.cultureTitle} - Uruziga`,
  description:
    "Explore how Umwero connects Kinyarwanda writing with Imana, Inka, Ingoma, circle symbolism, Inyambo symbolism, and the letter A.",
  openGraph: {
    title: `${kbSeo.cultureTitle} - Uruziga`,
    description:
      "Explore how Umwero connects Kinyarwanda writing with Imana, Inka, Ingoma, circle symbolism, Inyambo symbolism, and the letter A.",
  },
}

export default function CultureAndHistoryPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Badge variant="outline">Culture & History</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Umwero connects Kinyarwanda writing with Rwandan cultural foundations.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-black/70 sm:text-lg">
            In Rwanda, language has always carried history, identity, and community. Umwero draws from Imana, Inka, and Ingoma, then brings visual ideas like the circle and Inyambo horns into written form.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/learn">
                <BookOpen className="h-4 w-4" />
                Practice a Character
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {kbFoundations.map((foundation, index) => {
            const Icon = index === 0 ? CircleIcon : index === 1 ? PenTool : Landmark
            return (
              <Card key={foundation.name}>
                <CardHeader>
                  <Icon className="h-7 w-7 text-[#8B4513]" />
                  <CardTitle className="text-xl text-black">{foundation.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-[#8B4513]">{foundation.title}</p>
                  <p className="mt-3 text-base leading-7 text-black/70">{foundation.body}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-black">Symbols That Teach</h2>
            <p className="mt-1 text-base text-black/65">Each symbol gives learners another way to see how language, culture, and writing meet.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {kbCultureNotes.map((note) => (
              <Card key={note.title}>
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold text-black">{note.title}</h3>
                  <p className="mt-3 text-base leading-7 text-black/70">{note.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
