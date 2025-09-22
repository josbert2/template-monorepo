import React from 'react';
import CustomSelect from '../ui/custom-select';
import { SliderWithInput } from '../ui/slider-with-input';

export type DisplayValues = {
  display: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'contents' | 'none';
  opacity: number; // 0-100 percentage
};

export type DisplayProps = {
  values: DisplayValues;
  onChange: (property: keyof DisplayValues, value: any) => void;
};

export default function Display({ values, onChange }: DisplayProps) {
  const displayOptions = [
    { value: 'block', label: 'block' },
    { value: 'inline', label: 'inline' },
    { value: 'inline-block', label: 'inline-block' },
    { value: 'flex', label: 'flex' },
    { value: 'inline-flex', label: 'inline-flex' },
    { value: 'grid', label: 'grid' },
    { value: 'inline-grid', label: 'inline-grid' },
    { value: 'contents', label: 'contents' },
    { value: 'none', label: 'none' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-gray-400  tracking-wide">Display</label>
        <CustomSelect
          value={values.display}
          onValueChange={(value) => onChange('display', value as DisplayValues['display'])}
          options={displayOptions}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400  tracking-wide">Opacity</label>
        <SliderWithInput
          value={[values.opacity]}
          onValueChange={(v) => onChange('opacity', v[0])}
          min={0}
          max={100}
          step={1}
          className="w-full"
          inputClassName="h-7 w-12"
          showTooltip={true}
          aria-label="Opacity"
          suffix="%"
        />
      </div>
    </div>
  );
}


