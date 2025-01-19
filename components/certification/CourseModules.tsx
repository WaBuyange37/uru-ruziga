import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { CheckCircle2, Lock } from 'lucide-react'

const modules = [
  {
    id: 1,
    title: "Introduction to Umwero",
    description: "Learn the basics of Umwero alphabet",
    lessons: 5,
    completed: true,
  },
  {
    id: 2,
    title: "Basic Characters",
    description: "Master the fundamental Umwero characters",
    lessons: 7,
    completed: true,
  },
  {
    id: 3,
    title: "Forming Words",
    description: "Learn to combine characters to form words",
    lessons: 6,
    completed: false,
  },
  {
    id: 4,
    title: "Simple Sentences",
    description: "Construct basic sentences using Umwero",
    lessons: 8,
    completed: false,
  },
  {
    id: 5,
    title: "Cultural Context",
    description: "Understand the cultural significance of Umwero",
    lessons: 5,
    completed: false,
  },
]

export function CourseModules() {
  const [activeModule, setActiveModule] = useState<number | null>(null)

  const toggleModule = (moduleId: number) => {
    setActiveModule(activeModule === moduleId ? null : moduleId)
  }

  const completedModules = modules.filter(module => module.completed).length
  const totalModules = modules.length
  const progress = (completedModules / totalModules) * 100

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#8B4513]">Course Modules</h2>
      <div className="flex items-center gap-4 mb-4">
        <Progress value={progress} className="w-full" />
        <span className="text-[#8B4513] font-semibold">{progress.toFixed(0)}% Complete</span>
      </div>
      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module.id} className={`bg-[#F3E5AB] border-[#8B4513] ${module.completed ? 'opacity-100' : 'opacity-70'}`}>
            <CardHeader className="cursor-pointer" onClick={() => toggleModule(module.id)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#8B4513] flex items-center gap-2">
                  {module.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-[#8B4513]" />
                  )}
                  {module.title}
                </CardTitle>
                <span className="text-[#D2691E]">{module.lessons} lessons</span>
              </div>
              <CardDescription className="text-[#8B4513]">{module.description}</CardDescription>
            </CardHeader>
            {activeModule === module.id && (
              <CardContent>
                <ul className="list-disc list-inside text-[#8B4513] space-y-2">
                  {Array.from({ length: module.lessons }).map((_, index) => (
                    <li key={index}>Lesson {index + 1}</li>
                  ))}
                </ul>
                {module.completed ? (
                  <Button className="mt-4 w-full">Review Module</Button>
                ) : (
                  <Button className="mt-4 w-full" disabled={!modules[module.id - 2]?.completed}>
                    {modules[module.id - 2]?.completed ? 'Start Module' : 'Locked'}
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

