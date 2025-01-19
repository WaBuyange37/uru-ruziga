import React, { useState } from 'react'
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { ScrollArea } from "../ui/scroll-area"

const lessonSteps = [
  {
    title: "Understanding Basic Shapes",
    content: "Umwero script is composed of five basic shapes: circle, square, triangle, line, and dot. These shapes form the foundation of all characters in the Umwero alphabet.",
    exercise: "Can you identify these shapes in the following Umwero character?",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    title: "Combining Shapes",
    content: "Umwero characters are created by combining these basic shapes. The position and orientation of these shapes relative to each other give each character its unique meaning.",
    exercise: "Try to break down this Umwero character into its basic shapes:",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    title: "Writing Direction",
    content: "Umwero is written from left to right and top to bottom, similar to English. However, individual characters are often constructed starting from the center and moving outward.",
    exercise: "Follow the arrows to write this Umwero character:",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    title: "Character Variations",
    content: "Some Umwero characters have slight variations depending on their position in a word. These variations often involve extending or connecting certain lines to create a flowing script.",
    exercise: "Can you spot the differences between these two variations of the same character?",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Practice Time",
    content: "Now that you've learned the basics, it's time to practice writing some simple Umwero characters. Remember to start from the center and pay attention to the relative positions of the shapes.",
    exercise: "Try to write these three basic Umwero characters:",
    image: "/placeholder.svg?height=200&width=300",
  }
]

export function IntroductionToUmwero() {
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(lessonSteps.length).fill(''))

  const handleNext = () => {
    if (currentStep < lessonSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentStep] = e.target.value
    setUserAnswers(newAnswers)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-[#F3E5AB] border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#8B4513]">Introduction to Umwero Characters</CardTitle>
        <CardDescription className="text-[#D2691E]">
          Learn the basic shapes and principles of Umwero script
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={(currentStep + 1) / lessonSteps.length * 100} className="mb-4" />
        <ScrollArea className="h-[400px] rounded-md border p-4 bg-white">
          <h3 className="text-xl font-bold mb-2 text-[#8B4513]">{lessonSteps[currentStep].title}</h3>
          <p className="mb-4 text-[#D2691E]">{lessonSteps[currentStep].content}</p>
          <div className="mb-4">
            <img 
              src={lessonSteps[currentStep].image} 
              alt={`Illustration for ${lessonSteps[currentStep].title}`} 
              className="mx-auto rounded-md"
            />
          </div>
          <div className="mb-4">
            <h4 className="font-bold text-[#8B4513]">Exercise:</h4>
            <p className="text-[#D2691E]">{lessonSteps[currentStep].exercise}</p>
          </div>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Type your answer here..."
            value={userAnswers[currentStep]}
            onChange={handleAnswerChange}
          ></textarea>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentStep === 0}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentStep === lessonSteps.length - 1}>
          {currentStep === lessonSteps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  )
}

