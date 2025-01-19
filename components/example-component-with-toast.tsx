"use client"

import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"

export function ExampleComponentWithToast() {
  const { toast } = useToast()

  const handleClick = () => {
    toast({
      title: "Scheduled: Catch up",
      description: "Friday, February 10, 2023 at 5:57 PM",
    })
  }

  return (
    <Button onClick={handleClick}>Show Toast</Button>
  )
}

