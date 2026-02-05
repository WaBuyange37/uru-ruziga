"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { MagicSquareGame } from "../../components/games/MagicSquareGame"

const games = [
  { id: 1, name: "Umwero Memory Match", description: "Match pairs of Umwero characters" },
  { id: 2, name: "Spelling Challenge", description: "Spell words using Umwero characters" },
  { id: 3, name: "Magic Square of Numerology", description: "Verify the magic square properties" },
  { id: 4, name: "Umwero Hangman", description: "Guess the Umwero word before the stick figure is complete" },
  { id: 5, name: "Character Tracing", description: "Practice writing Umwero characters with digital ink" },
]

const quizzes = [
  { id: 1, name: "Beginner Umwero Quiz", description: "Test your basic Umwero knowledge" },
  { id: 2, name: "Advanced Umwero Quiz", description: "Challenge yourself with advanced Umwero concepts" },
  { id: 3, name: "Umwero to Latin Transliteration", description: "Convert Umwero text to Latin alphabet" },
  { id: 4, name: "Cultural Context Quiz", description: "Test your knowledge of Umwero's cultural significance" },
]

export default function GamesAndQuizzesPage() {
  const [activeTab, setActiveTab] = useState("games")
  const [selectedGame, setSelectedGame] = useState<number | null>(null)

  const renderGameContent = (gameId: number) => {
    switch (gameId) {
      case 3:
        return <MagicSquareGame />
      default:
        return <p>Game content coming soon!</p>
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#8B4513]">Games & Quizzes</h1>
        
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="games" onClick={() => setActiveTab('games')}>Games</TabsTrigger>
            <TabsTrigger value="quizzes" onClick={() => setActiveTab('quizzes')}>Quizzes</TabsTrigger>
          </TabsList>
          <TabsContent value="games">
            <div className="grid gap-4 md:grid-cols-2">
              {games.map((game) => (
                <Card key={game.id}>
                  <CardHeader>
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setSelectedGame(game.id)}>
                      {selectedGame === game.id ? "Hide Game" : "Play Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedGame && (
              <Card className="mt-8">
                <CardContent>
                  {renderGameContent(selectedGame)}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="quizzes">
            <div className="grid gap-4 md:grid-cols-2">
              {quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle>{quiz.name}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Start Quiz</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-[#8B4513]">Learning Tips</h2>
          <Card>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="list-disc pl-5 mt-4">
                <li>Use spaced repetition techniques to review Umwero characters regularly.</li>
                <li>Create mnemonics or stories to associate with each Umwero character.</li>
                <li>Practice writing Umwero characters daily, even if just for a few minutes.</li>
                <li>Engage with Umwero content, such as short stories or articles, to improve recognition.</li>
                <li>Use flashcards (physical or digital) to quiz yourself on Umwero characters.</li>
                <li>Try teaching Umwero to others, as explaining concepts can reinforce your own understanding.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

