"use client"

import * as React from "react"
import { cn } from "@clarity/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-none text-white w-full h-[36px] px-2 py-1 rounded-lg text-xs border-secondary-bg border-2 focus:border-pikend-bg/30 hover:border-pikend-bg/30 focus:outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }