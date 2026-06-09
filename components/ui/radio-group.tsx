import React from 'react'
import { cn } from "../../lib/utils"

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div className={cn("flex space-x-4", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioGroupItemProps>(child)) {
          const childValue = String(child.props.value)
          return React.cloneElement(child, {
            checked: childValue === value,
            onChange: () => onValueChange(childValue),
          })
        }
        return child
      })}
    </div>
  )
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
}

export function RadioGroupItem({ label, icon, ...props }: RadioGroupItemProps) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        className="form-radio text-[#8B4513] border-[#8B4513] focus:ring-[#8B4513]"
        {...props}
      />
      <span className="flex items-center space-x-1">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </span>
    </label>
  )
}

