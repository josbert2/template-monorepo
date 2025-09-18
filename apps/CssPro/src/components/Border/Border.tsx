import React from 'react';

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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={values.color}
          onChange={(e) => onChange('color', e.target.value)}
          className="h-8 w-10 bg-gray-700 border border-gray-600 rounded"
        />
        <span className="text-sm text-gray-300">{values.color}</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={values.width}
          min={0}
          onChange={(e) => onChange('width', Number(e.target.value) || 0)}
          className="w-20 bg-gray-700 text-white px-2 py-2 rounded-l text-sm border border-gray-600 border-r-0 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={values.unit}
          onChange={(e) => onChange('unit', e.target.value as BorderValues['unit'])}
          className="bg-gray-700 text-white px-2 py-2 rounded-r text-sm border border-gray-600 border-l-0 focus:border-blue-500 focus:outline-none"
        >
          <option value="px">px</option>
          <option value="em">em</option>
          <option value="rem">rem</option>
          <option value="%">%</option>
        </select>
        <select
          value={values.style}
          onChange={(e) => onChange('style', e.target.value as BorderValues['style'])}
          className="ml-3 bg-gray-700 text-white px-2 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          {['none','solid','dashed','dotted','double','groove','ridge','inset','outset'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}


