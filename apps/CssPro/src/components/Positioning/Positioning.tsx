import React from 'react';
import { Input } from '../ui/input';
import CustomSelect from '../ui/custom-select';

export type PositioningValues = {
  position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top: string; // e.g. '0', '10px', 'auto'
  right: string;
  bottom: string;
  left: string;
};

export type PositioningProps = {
  values: PositioningValues;
  onChange: (property: keyof PositioningValues, value: string) => void;
};

export default function Positioning({ values, onChange }: PositioningProps) {
  const positionOptions = [
    { value: 'static', label: 'static' },
    { value: 'relative', label: 'relative' },
    { value: 'absolute', label: 'absolute' },
    { value: 'fixed', label: 'fixed' },
    { value: 'sticky', label: 'sticky' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-gray-400  tracking-wide">Position</label>
        <CustomSelect
          value={values.position}
          onValueChange={(value) => onChange('position', value)}
          options={positionOptions}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['top','right','bottom','left'] as const).map(side => (
          <div key={side} className="space-y-2">
            <label className="text-xs text-gray-400  tracking-wide">{side}</label>
            <Input
              type="text"
              value={values[side]}
              onChange={(e) => onChange(side, e.target.value)}
              placeholder="auto | 0 | 10px | 5%"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}


