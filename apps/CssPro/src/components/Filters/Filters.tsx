


import React from 'react';
import { SliderWithInput } from "../ui/slider-with-input"

export type FiltersValues = {
    blur: number;
    contrast: number;
    brightness: number;
    saturate: number;
    invert: number; // percentage 0-100
    grayscale: number; // percentage 0-100
    sepia: number; // percentage 0-100
};

export type FiltersProps = {
    values: FiltersValues;
    onChange: (property: keyof FiltersValues, value: number) => void;
};

export default function Filters({ values, onChange }: FiltersProps) {
    return (
        <>
            <div className="css-pro-visual-accordion-content" style={{pointerEvents: 'initial'}}>
                <SliderWithInput
                    value={[values.blur]}
                    onValueChange={(v) => onChange('blur', v[0])}
                    min={0}
                    max={50}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Blur filter"
                    label="Blur"
                    suffix="px"
                />

                <SliderWithInput
                    value={[values.contrast]}
                    onValueChange={(v) => onChange('contrast', v[0])}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Contrast filter"
                    label="Contrast"
                />

                <SliderWithInput
                    value={[values.brightness]}
                    onValueChange={(v) => onChange('brightness', v[0])}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Brightness filter"
                    label="Brightness"
                />

                <SliderWithInput
                    value={[values.saturate]}
                    onValueChange={(v) => onChange('saturate', v[0])}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Saturate filter"
                    label="Saturate"
                />

                <SliderWithInput
                    value={[values.invert]}
                    onValueChange={(v) => onChange('invert', v[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Invert filter"
                    label="Invert"
                    suffix="%"
                />

                <SliderWithInput
                    value={[values.grayscale]}
                    onValueChange={(v) => onChange('grayscale', v[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Grayscale filter"
                    label="Grayscale"
                    suffix="%"
                />

                <SliderWithInput
                    value={[values.sepia]}
                    onValueChange={(v) => onChange('sepia', v[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    inputClassName="h-8 w-12"
                    showTooltip={true}
                    aria-label="Sepia filter"
                    label="Sepia"
                    suffix="%"
                />
            </div>
        </>
    )
}