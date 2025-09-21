"use client"

import * as React from "react"
import { Slider } from "./slider"
import { Input } from "./input"
import { cn } from "@clarity/utils/cn"

export interface SliderWithInputProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
  inputClassName?: string
  sliderClassName?: string
  showTooltip?: boolean
  disabled?: boolean
  "aria-label"?: string
  label?: string
  suffix?: string
}

const SliderWithInput = React.forwardRef<HTMLDivElement, SliderWithInputProps>(
  ({ 
    value, 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1,
    className,
    inputClassName,
    sliderClassName,
    showTooltip = false,
    disabled = false,
    "aria-label": ariaLabel,
    label,
    ...props 
  }, ref) => {
    const [inputValues, setInputValues] = React.useState<string[]>(
      value.map(v => v.toString())
    )

    // Sincronizar input values cuando cambia el valor del slider
    React.useEffect(() => {
      setInputValues(value.map(v => v.toString()))
    }, [value])

    const handleSliderChange = (newValue: number[]) => {
      onValueChange(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newInputValues = [...inputValues]
      newInputValues[index] = e.target.value
      setInputValues(newInputValues)
    }

    const validateAndUpdateValue = (inputValue: string, index: number) => {
      const numValue = parseFloat(inputValue)
      
      if (isNaN(numValue)) {
        // Si no es un número válido, revertir al valor actual
        setInputValues(prev => {
          const newValues = [...prev]
          newValues[index] = value[index].toString()
          return newValues
        })
        return
      }

      // Clamp el valor entre min y max
      const clampedValue = Math.max(min, Math.min(max, numValue))
      
      // Actualizar el valor del slider
      const newValue = [...value]
      newValue[index] = clampedValue
      onValueChange(newValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Enter") {
        validateAndUpdateValue(inputValues[index], index)
        e.currentTarget.blur()
      }
    }

    return (
      <div 
        ref={ref}
        className={cn("flex flex-col", className)} 
        {...props}
      >
        {label && <label className="text-gray-400">{label}</label>}
       <div className="flex items-center gap-2">
            <Slider
                className={cn("grow", sliderClassName)}
                value={value}
                onValueChange={handleSliderChange}
                min={min}
                max={max}
                step={step}
                showTooltip={showTooltip}
                disabled={disabled}
                aria-label={ariaLabel || "Slider with input"}
            />
            {value.map((val, index) => (
                <Input
                    key={index}
                    className={cn("h-8 w-12 px-2 py-1 text-center", inputClassName)}
                    type="text"
                    inputMode="decimal"
                    value={inputValues[index]}
                    onChange={(e) => handleInputChange(e, index)}
                    onBlur={() => validateAndUpdateValue(inputValues[index], index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={disabled}
                    aria-label={`Enter value ${index + 1}`}
                />
            ))}
        </div>
      </div>
    )
  }
)

SliderWithInput.displayName = "SliderWithInput"

export { SliderWithInput }