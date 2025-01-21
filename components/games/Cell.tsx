import type React from "react"
import { useDrag, useDrop } from "react-dnd"
import { Button } from "../ui/button"

interface CellProps {
  number: number
  index: number
  moveCell: (dragIndex: number, hoverIndex: number) => void
  fontLoaded: boolean
}

export const Cell: React.FC<CellProps> = ({ number, index, moveCell, fontLoaded }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "cell",
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [, drop] = useDrop(() => ({
    accept: "cell",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCell(item.index, index)
        item.index = index
      }
    },
  }))

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Button variant="outline" className={`w-16 h-16 text-2xl font-bold ${fontLoaded ? "font-umwero" : ""}`}>
        {number}
      </Button>
    </div>
  )
}

