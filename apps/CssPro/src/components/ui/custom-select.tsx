"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

interface CustomSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  variant?: 'default' | 'weight-gradient'
}

export function CustomSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Seleccionar...",
  className = "",
  variant = 'default'
}: CustomSelectProps) {
  
  // Función para obtener el color de fondo basado en el peso
  const getWeightBackgroundColor = (weightValue: string) => {
    const weightMap: { [key: string]: string } = {
      '100': 'bg-gray-100 text-gray-900',
      '200': 'bg-gray-200 text-gray-900', 
      '300': 'bg-gray-300 text-gray-900',
      '400': 'bg-gray-400 text-gray-900',
      '500': 'bg-gray-500 text-white',
      '600': 'bg-gray-600 text-white',
      '700': 'bg-gray-700 text-white',
      '800': 'bg-gray-800 text-white',
      '900': 'bg-gray-900 text-white'
    }
    return weightMap[weightValue] || 'bg-gray-500 text-white'
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`bg-none text-white px-2 py-1 rounded-lg text-xs border-secondary-bg border-2 focus:border-pikend-bg/30 hover:border-pikend-bg/30 focus:outline-none transition-colors ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-primary-bg border-secondary-bg">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={variant === 'weight-gradient' ? 
              `${getWeightBackgroundColor(option.value)} rounded-none focus:opacity-80 transition-opacity` : 
              ''
            }
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default CustomSelect