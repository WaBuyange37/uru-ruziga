"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { MagicSquareGame } from "../../components/games/MagicSquareGame"
import { 
  Gamepad2, 
  Brain, 
  Trophy, 
  Target, 
  Sparkles, 
  Play, 
  Heart,
  Globe,
  BookOpen,
  Lightbulb,
  Star,
  Zap
} from 'lucide-react'

const games = [
  { 
    id: 1, 
    name: "Umwero Memory Match", 
    description: "Match pairs of Umwero characters and test your visual memory",
    difficulty: "Beginner",
    icon: "🧠",
    color: "from-blue-50 to-blue-100 border-blue-200"
  },
  { 
    id: 2, 
    name: "Spelling Challenge", 
    description: "Spell words using authentic Umwero characters",
    difficulty: "Intermediate",
    icon: "✍️",
    color: "from-green-50 to-green-100 border-green-200"
  },
  { 
    id: 3, 
    name: "Magic Square of Numerology", 
    description: "Explore the sacred mathematical properties of Umwero",
    difficulty: "Advanced",
    icon: "🔢",
    color: "from-purple-50 to-purple-100 border-purple-200"
  },
  { 
    id: 4, 
    name: "Umwero Hangman", 
    description: "Guess the Umwero word and preserve cultural knowledge",
    difficulty: "Intermediate",
    icon: "🎯",
    color: "from-amber-50 to-amber-100 border-amber-200"
  },
  { 
    id: 5, 
    name: "Character Tracing", 
    description: "Master the art of writing Umwero with digital precision",
    difficulty: "Beginner",
    icon: "✏️",
    color: "from-pink-50 to-pink-100 border-pink-200"
  },
]

const quizzes = [
  { 
    id: 1, 
    name: "Beginner Umwero Quiz", 
    description: "Test your foundational knowledge of Umwero characters",
    difficulty: "Beginner",
    icon: "📚",
    color: "from-emerald-50 to-emerald-100 border-emerald-200"
  },
  { 
    id: 2, 
    name: "Advanced Umwero Quiz", 
    description: "Challenge yourself with complex ligatures and compounds",
    difficulty: "Advanced",
    icon: "🎓",
    color: "from-indigo-50 to-indigo-100 border-indigo-200"
  },
  { 
    id: 3, 
    name: "Umwero to Latin Transliteration", 
    description: "Master the art of accurate script conversion",
    difficulty: "Intermediate",
    icon: "🔄",
    color: "from-cyan-50 to-cyan-100 border-cyan-200"
  },
  { 
    id: 4, 
    name: "Cultural Context Quiz", 
    description: "Explore the deep cultural significance of Umwero heritage",
    difficulty: "Intermediate",
    icon: "🏛️",
    color: "from-orange-50 to-orange-100 border-orange-200"
  },
]

export default function GamesAndQuizzesPage() {
  const [activeTab, setActiveTab] = useState("games")
  const [selectedGame, setSelectedGame] = useState<number | null>(null)

  const renderGameContent = (gameId: number) => {
    switch (gameId) {
      case 3:
        return <MagicSquareGame />
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-[#8B4513] mb-2">Coming Soon!</h3>
            <p className="text-[#D2691E]">This exciting game is under development. Stay tuned for updates!</p>
          </div>
        )
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Cultural Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Gamepad2 className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Interactive Learning</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Cognitive Enhancement</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Achievement Based</span>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-[#8B4513]">
            Games & Quizzes
          </h1>
          <p className="text-lg md:text-xl text-[#D2691E] mb-8 max-w-3xl mx-auto">
            Master Umwero through engaging games and challenging quizzes. Learn while having fun and track your progress as you preserve Rwandan cultural heritage through interactive experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => setActiveTab('games')}
            >
              <Play className="h-5 w-5" />
              Start Playing
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
              onClick={() => setActiveTab('quizzes')}
            >
              <Target className="h-5 w-5" />
              Take Quiz
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 gap-2 mb-8 h-auto bg-white/80 backdrop-blur p-2">
              <TabsTrigger 
                value="games" 
                className="gap-2 text-sm md:text-base data-[state=active]:bg-[#8B4513] data-[state=active]:text-white py-3"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Interactive Games</span>
                <Badge variant="outline" className="ml-2 text-xs">{games.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="quizzes" 
                className="gap-2 text-sm md:text-base data-[state=active]:bg-[#8B4513] data-[state=active]:text-white py-3"
              >
                <Brain className="h-4 w-4" />
                <span>Knowledge Quizzes</span>
                <Badge variant="outline" className="ml-2 text-xs">{quizzes.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-8">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎮</div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">
                        Interactive Umwero Games
                      </h3>
                      <p className="text-blue-700">
                        Learn through play with engaging games designed to reinforce Umwero character recognition, writing skills, and cultural understanding.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <Card key={game.id} className={`bg-gradient-to-br ${game.color} hover:shadow-xl transition-all group`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-3xl">{game.icon}</div>
                        <Badge className={getDifficultyColor(game.difficulty)}>
                          {game.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-[#8B4513] transition-colors">
                        {game.name}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                        className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        {selectedGame === game.id ? (
                          <>
                            <Zap className="h-4 w-4" />
                            Hide Game
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Play Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedGame && (
                <Card className="bg-white/90 backdrop-blur border-[#8B4513] shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-[#F3E5AB] to-[#FAEBD7] border-b border-[#8B4513]">
                    <CardTitle className="text-2xl text-[#8B4513] flex items-center gap-2">
                      <Sparkles className="h-6 w-6" />
                      {games.find(g => g.id === selectedGame)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {renderGameContent(selectedGame)}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Quizzes Tab */}
            <TabsContent value="quizzes" className="space-y-8">
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🧠</div>
                    <div>
                      <h3 className="text-xl font-semibold text-amber-800 mb-2">
                        Knowledge Assessment Quizzes
                      </h3>
                      <p className="text-amber-700">
                        Test your understanding of Umwero characters, cultural context, and translation skills with comprehensive quizzes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className={`bg-gradient-to-br ${quiz.color} hover:shadow-xl transition-all group`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-3xl">{quiz.icon}</div>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-[#8B4513] transition-colors">
                        {quiz.name}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {quiz.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        disabled
                      >
                        <Star className="h-4 w-4" />
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Learning Tips Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl md:text-3xl text-green-800 flex items-center justify-center gap-2">
                <Lightbulb className="h-8 w-8" />
                Learning Tips & Strategies
              </CardTitle>
              <CardDescription className="text-green-600 text-lg mt-2">
                Maximize your Umwero learning journey with these proven techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Spaced Repetition</h4>
                      <p className="text-green-700 text-sm">Review Umwero characters at increasing intervals to strengthen long-term memory retention.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📖</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Story Association</h4>
                      <p className="text-green-700 text-sm">Create meaningful stories or mnemonics that connect each character to its cultural significance.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✍️</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Daily Practice</h4>
                      <p className="text-green-700 text-sm">Dedicate just 10-15 minutes daily to writing practice for consistent improvement.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📚</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Immersive Reading</h4>
                      <p className="text-green-700 text-sm">Engage with Umwero content regularly to improve character recognition and cultural understanding.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Active Recall</h4>
                      <p className="text-green-700 text-sm">Use flashcards and self-testing to actively retrieve information from memory.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">👥</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Teach Others</h4>
                      <p className="text-green-700 text-sm">Explaining Umwero concepts to others reinforces your own understanding and mastery.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

