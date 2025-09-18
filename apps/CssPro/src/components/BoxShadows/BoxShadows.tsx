import React from 'react';

export type BoxShadowsProps = {
  value: string; // full CSS box-shadow string or 'none'
  onChange: (css: string) => void;
};

// Simple demo presets (expand as needed)
const PRESETS: string[] = [
  'none',
  '0 1px 2px rgba(0,0,0,0.15)',
  '0 2px 4px rgba(0,0,0,0.2)',
  '0 4px 8px rgba(0,0,0,0.25)',
  '0 8px 16px rgba(0,0,0,0.3)',
  '0 12px 24px rgba(0,0,0,0.35)',
  'inset 0 2px 4px rgba(0,0,0,0.25)',
  '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.12)',
  '0 0 0 1px rgba(0,0,0,0.2)',
  '0 10px 15px rgba(0,0,0,0.35)',
  '0 24px 48px rgba(0,0,0,0.45)',
  'inset 0 0 0 2px rgba(255,255,255,0.15), 0 8px 30px rgba(0,0,0,0.35)'
];

export default function BoxShadows({ value, onChange }: BoxShadowsProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide">Box shadow</div>
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((css, idx) => {
          const isNone = css === 'none';
          const selected = value === css || (isNone && (value === '' || value === 'none'));
          return (
            <button
              key={idx}
              onClick={() => onChange(isNone ? 'none' : css)}
              className={[
                'relative h-16 rounded border text-xs',
                selected ? 'border-emerald-400' : 'border-gray-700',
                'bg-gray-800 hover:bg-gray-700'
              ].join(' ')}
              style={{
                // a miniature card to visualize the shadow
                boxShadow: isNone ? 'none' : css
              }}
              aria-pressed={selected}
            >
              <span className="absolute top-1 left-1 text-[10px] text-gray-300">
                {isNone ? '×' : `#${idx - 1}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


