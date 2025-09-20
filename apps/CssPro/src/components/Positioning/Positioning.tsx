import React from 'react';

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
  const positions: PositioningValues['position'][] = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
  const handleInput = (prop: keyof PositioningValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(prop, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Position</label>
        <select
          value={values.position}
          onChange={handleInput('position')}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          {positions.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['top','right','bottom','left'] as const).map(side => (
          <div key={side} className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">{side}</label>
            <input
              type="text"
              value={values[side]}
              onChange={handleInput(side)}
              placeholder="auto | 0 | 10px | 5%"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}


