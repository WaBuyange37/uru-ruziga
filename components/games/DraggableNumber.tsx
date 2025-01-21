import { useDrag } from "react-dnd"
import { Button } from "../ui/button"

interface DraggableNumberProps {
  number: number
  isSelected: boolean
}

export function DraggableNumber({ number, isSelected }: DraggableNumberProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "number",
    item: { number },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Button variant={isSelected ? "secondary" : "outline"} className="w-full h-full" disabled={isSelected}>
        {number}
      </Button>
    </div>
  )
}

