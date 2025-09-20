import React from 'react';
import Range from '../ui/Range';

export type DisplayValues = {
  display: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'contents' | 'none';
  opacity: number; // 0-100 percentage
};

export type DisplayProps = {
  values: DisplayValues;
  onChange: (property: keyof DisplayValues, value: any) => void;
};

export default function Display({ values, onChange }: DisplayProps) {
  const displays: DisplayValues['display'][] = ['block','inline','inline-block','flex','inline-flex','grid','inline-grid','contents','none'];
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Display</label>
        <select
          value={values.display}
          onChange={(e) => onChange('display', e.target.value as DisplayValues['display'])}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          {displays.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Opacity</label>
        <Range
          label=""
          min={0}
          max={100}
          step={1}
          value={values.opacity}
          suffix="%"
          onChange={(v) => onChange('opacity', v)}
        />
      </div>
    </div>
  );
}


