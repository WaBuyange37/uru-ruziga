import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ReactNode } from 'react'

interface CardSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function CardSection({ title, description, children }: CardSectionProps) {
  return (
    <Card className="bg-[#F3E5AB] border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-[#8B4513]">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

