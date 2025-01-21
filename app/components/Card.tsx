import type React from "react"

interface CardProps {
  character: string
  flipped: boolean
  matched: boolean
  onClick: () => void
}

export const Card: React.FC<CardProps> = ({ character, flipped, matched, onClick }) => {
  return (
    <div
      className={`w-24 h-24 flex items-center justify-center text-4xl font-bold cursor-pointer transition-transform duration-300 ${
        flipped ? "bg-white text-black" : "bg-blue-500 text-white"
      } ${matched ? "bg-green-300" : ""}`}
      onClick={onClick}
      style={{ fontFamily: "UMWEROalpha, sans-serif" }}
    >
      {flipped || matched ? character : "?"}
    </div>
  )
}

