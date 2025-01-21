import type React from "react"

interface ScoreProps {
  moves: number
  score: number
}

export const Score: React.FC<ScoreProps> = ({ moves, score }) => {
  return (
    <div className="flex justify-between mb-4">
      <div>Moves: {moves}</div>
      <div>Score: {score}</div>
    </div>
  )
}

