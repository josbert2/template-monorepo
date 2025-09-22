"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "px-2 py-1 w-full text-xs text-white bg-none rounded-lg border-2 transition-colors h-[36px] border-secondary-bg focus:border-pikend-bg/30 hover:border-pikend-bg/30 focus:outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
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