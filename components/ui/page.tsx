import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PageContainer({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn("min-h-screen bg-white text-black", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-sm font-semibold text-[#8B4513]">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-normal text-black sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-base leading-7 text-black/70">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-8 text-center">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        {description && <p className="mx-auto mt-2 max-w-md text-base text-black/65">{description}</p>}
        {actionLabel && onAction && (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
