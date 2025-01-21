import { useDrop } from "react-dnd"
import { Button } from "../ui/button"

interface DroppableCellProps {
  onDrop: (number: number) => void
  number: number | null
}

export function DroppableCell({ onDrop, number }: DroppableCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "number",
    drop: (item: { number: number }) => onDrop(item.number),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`w-16 h-16 border-2 ${isOver ? "border-blue-500" : "border-gray-300"} flex items-center justify-center`}
    >
      {number !== null && (
        <Button variant="secondary" className="w-full h-full">
          {number}
        </Button>
      )}
    </div>
  )
}

