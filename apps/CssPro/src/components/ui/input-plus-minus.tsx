"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { Button, Group, Input, Label, NumberField } from "react-aria-components"

type ReusableNumberFieldProps = {
  label?: string
  defaultValue?: number
  minValue?: number
  maxValue?: number
  step?: number
  description?: string
}

export default function ReusableNumberField({
  label = "Number input",
  defaultValue = 0,
  minValue = 0,
  maxValue,
  step = 1,
  description,
}: ReusableNumberFieldProps) {
  return (
    <NumberField
      defaultValue={defaultValue}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
    >
      <div className="*:not-first:mt-2">
        {label && (
          <Label className="text-foreground text-sm font-medium">
            {label}
          </Label>
        )}
        <Group className="border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:opacity-50 data-focus-within:ring-[3px]">
          <Button
            slot="decrement"
            className="border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MinusIcon size={16} aria-hidden="true" />
          </Button>
          <Input className="bg-background text-foreground w-full grow px-3 py-2 text-center tabular-nums" />
          <Button
            slot="increment"
            className="border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon size={16} aria-hidden="true" />
          </Button>
        </Group>
      </div>
      {description && (
        <p
          className="text-muted-foreground mt-2 text-xs"
          role="region"
          aria-live="polite"
        >
          {description}
        </p>
      )}
    </NumberField>
  )
}
