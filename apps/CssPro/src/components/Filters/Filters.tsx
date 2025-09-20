


import React from 'react';
import Range from '../ui/Range';

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
                <Range
                    id="css-pro-filters-blur-0"
                    name="css-pro-filters-blur"
                    label="Blur"
                    min={0}
                    max={50}
                    value={values.blur}
                    onChange={(v) => onChange('blur', v)}
                    suffix="px"
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'blur',
                        'data-initial-value': '13px',
                    } as any}
                />
                <Range
                    id="css-pro-filters-contrast-0"
                    name="css-pro-filters-contrast"
                    label="Contrast"
                    min={0}
                    max={5}
                    step={0.1}
                    value={values.contrast}
                    onChange={(v) => onChange('contrast', v)}
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'contrast',
                        'data-initial-value': '3.6',
                    } as any}
                />
                <Range
                    id="css-pro-filters-brightness-0"
                    name="css-pro-filters-brightness"
                    label="Brightness"
                    min={0}
                    max={5}
                    step={0.1}
                    value={values.brightness}
                    onChange={(v) => onChange('brightness', v)}
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'brightness',
                    } as any}
                />
                <Range
                    id="css-pro-filters-saturate-0"
                    name="css-pro-filters-saturate"
                    label="Saturate"
                    min={0}
                    max={5}
                    step={0.1}
                    value={values.saturate}
                    onChange={(v) => onChange('saturate', v)}
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'saturate',
                    } as any}
                />
                <Range
                    id="css-pro-filters-invert-0"
                    name="css-pro-filters-invert"
                    label="Invert"
                    min={0}
                    max={100}
                    step={1}
                    value={values.invert}
                    onChange={(v) => onChange('invert', v)}
                    suffix="%"
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'invert',
                    } as any}
                />
                <Range
                    id="css-pro-filters-grayscale-0"
                    name="css-pro-filters-grayscale"
                    label="Grayscale"
                    min={0}
                    max={100}
                    step={1}
                    value={values.grayscale}
                    onChange={(v) => onChange('grayscale', v)}
                    suffix="%"
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'grayscale',
                    } as any}
                />
                <Range
                    id="css-pro-filters-sepia-0"
                    name="css-pro-filters-sepia"
                    label="Sepia"
                    min={0}
                    max={100}
                    step={1}
                    value={values.sepia}
                    onChange={(v) => onChange('sepia', v)}
                    suffix="%"
                    labelProps={{
                        'data-css-pro-visual-range-input': '',
                        'data-css-pro-edit-rule': 'sepia',
                    } as any}
                />
            </div>

        </>
    )
}