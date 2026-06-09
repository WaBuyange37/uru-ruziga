import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { kbDefinitions, kbFoundations } from "../../lib/umwero-knowledge-base"

export const metadata: Metadata = {
  title: "FAQ - Uruziga",
  description: "Answers about Umwero, Uruziga, Kinyarwanda, and the cultural foundations behind the writing system.",
  openGraph: {
    title: "FAQ - Uruziga",
    description: "Answers about Umwero, Uruziga, Kinyarwanda, and the cultural foundations behind the writing system.",
  },
}

const faqs = [
  {
    question: "What is Umwero?",
    answer: kbDefinitions.umwero,
  },
  {
    question: "What is Uruziga?",
    answer: kbDefinitions.uruziga,
  },
  {
    question: "Who created Umwero?",
    answer: kbDefinitions.creator,
  },
  {
    question: "Why was Umwero created?",
    answer: kbDefinitions.purpose,
  },
  {
    question: "What cultural foundations help explain Umwero?",
    answer: `Umwero is connected to ${kbFoundations.map((item) => item.name).join(", ")}: cultural roots that help learners understand how writing, identity, and heritage meet.`,
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge variant="outline">FAQ</Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Umwero and Uruziga questions</h1>
          <p className="mt-5 text-base leading-7 text-black/70">
            New to Umwero? Start here. These answers explain the writing system, the learning platform, and why the work matters.
          </p>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold text-black">{faq.question}</h2>
                <p className="mt-3 text-base leading-7 text-black/70">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/learn">Start Learning</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/culture-and-history">Culture & History</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
