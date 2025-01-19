import { Progress } from "./ui/progress"

interface FundingProgressProps {
  currentAmount: number
  goalAmount: number
}

export function FundingProgress({ currentAmount, goalAmount }: FundingProgressProps) {
  const percentage = (currentAmount / goalAmount) * 100

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Funding Progress</h2>
      <Progress value={percentage} className="h-4 mb-2" />
      <div className="flex justify-between text-sm">
        <span>${currentAmount.toLocaleString()} raised</span>
        <span>${goalAmount.toLocaleString()} goal</span>
      </div>
    </div>
  )
}

