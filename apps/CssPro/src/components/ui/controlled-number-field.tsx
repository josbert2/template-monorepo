"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { Button, Group, Input, Label, NumberField } from "react-aria-components"

type ControlledNumberFieldProps = {
  label?: string
  value: number
  onChange: (value: number) => void
  minValue?: number
  maxValue?: number
  step?: number
  className?: string
}

export default function ControlledNumberField({
  label,
  value,
  onChange,
  minValue = 0,
  maxValue,
  step = 1,
  className = ""
}: ControlledNumberFieldProps) {
  return (
    <NumberField
      value={value}
      onChange={onChange}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      className={className}
    >
      <div className="*:not-first:mt-2">
        {label && (
          <Label className="text-xs text-gray-400 uppercase tracking-wide">
            {label}
          </Label>
        )}
        <Group className="bg-none border-secondary-bg border-2 focus-within:border-pikend-bg/30 hover:border-pikend-bg/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg text-xs whitespace-nowrap transition-colors outline-none">
          <Button
            slot="decrement"
            className="bg-none text-white hover:bg-pikend-bg/20 -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg text-xs transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MinusIcon size={14} aria-hidden="true" />
          </Button>
          <Input className="bg-none text-white w-full grow px-2 py-1 text-center tabular-nums text-xs focus:outline-none" />
          <Button
            slot="increment"
            className="bg-none text-white hover:bg-pikend-bg/20 -me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg text-xs transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon size={14} aria-hidden="true" />
          </Button>
        </Group>
      </div>
    </NumberField>
  )
}