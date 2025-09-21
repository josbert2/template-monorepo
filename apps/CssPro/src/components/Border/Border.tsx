import React from 'react';
import { Input } from '../ui/input';
import CustomSelect from '../ui/custom-select';
import  ColorPicker  from '../ColorPicker';

export type BorderValues = {
  color: string;
  width: number;
  unit: 'px' | 'em' | 'rem' | '%';
  style: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
};

export type BorderProps = {
  values: BorderValues;
  onChange: (property: keyof BorderValues, value: any) => void;
};

export default function Border({ values, onChange }: BorderProps) {
  const unitOptions = [
    { value: 'px', label: 'px' },
    { value: 'em', label: 'em' },
    { value: 'rem', label: 'rem' },
    { value: '%', label: '%' }
  ];

  const styleOptions = [
    { value: 'none', label: 'none' },
    { value: 'solid', label: 'solid' },
    { value: 'dashed', label: 'dashed' },
    { value: 'dotted', label: 'dotted' },
    { value: 'double', label: 'double' },
    { value: 'groove', label: 'groove' },
    { value: 'ridge', label: 'ridge' },
    { value: 'inset', label: 'inset' },
    { value: 'outset', label: 'outset' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Color</label>
        <ColorPicker
          value={values.color}
          onChange={(color) => onChange('color', color)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Width</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={values.width.toString()}
            min={0}
            onChange={(e) => onChange('width', Number(e.target.value) || 0)}
            className="flex-1"
          />
          <CustomSelect
            value={values.unit}
            onValueChange={(value) => onChange('unit', value as BorderValues['unit'])}
            options={unitOptions}
            className="w-20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Style</label>
        <CustomSelect
          value={values.style}
          onValueChange={(value) => onChange('style', value as BorderValues['style'])}
          options={styleOptions}
          className="w-full"
        />
      </div>
    </div>
  );
}


