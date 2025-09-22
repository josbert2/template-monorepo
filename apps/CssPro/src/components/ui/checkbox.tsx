"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/utils/cn"

export interface CheckboxProps {
  id?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, checked = false, onChange, label, disabled = false, className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <label
            htmlFor={id}
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded border-2 cursor-pointer transition-all duration-200",
              "border-secondary-bg bg-none",
              "hover:border-pikend-bg/30 focus-within:border-pikend-bg/30",
              checked && "bg-pikend-bg border-pikend-bg",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {checked && (
              <CheckIcon 
                size={12} 
                className="text-black stroke-[3]" 
              />
            )}
          </label>
        </div>
        {label && (
          <label 
            htmlFor={id} 
            className={cn(
              "text-sm text-gray-300 cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }