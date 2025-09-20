import React from 'react';
import Range from '../ui/Range';

export type ShadowLayer = {
  offsetX: number; // px
  offsetY: number; // px
  blur: number;   // px
  color: string;  // rgba or hex
};

export type ShadowsValues = {
  layers: ShadowLayer[];
};

export type ShadowsProps = {
  values: ShadowsValues;
  onChange: (values: ShadowsValues) => void;
  onApplyPreset?: (layers: ShadowLayer[]) => void;
};

const PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  { name: 'Soft', layers: [{ offsetX: 1, offsetY: 2, blur: 3, color: 'rgba(0,0,0,0.35)' }] },
  { name: 'Heavy', layers: [{ offsetX: 2, offsetY: 4, blur: 6, color: 'rgba(0,0,0,0.6)' }] },
  { name: 'Glow', layers: [{ offsetX: 0, offsetY: 0, blur: 8, color: 'rgba(255,255,255,0.9)' }] },
];

export default function Shadows({ values, onChange, onApplyPreset }: ShadowsProps) {
  const updateLayer = (index: number, layer: Partial<ShadowLayer>) => {
    const next = values.layers.map((l, i) => (i === index ? { ...l, ...layer } : l));
    onChange({ layers: next });
  };

  const addLayer = () => {
    onChange({ layers: [...values.layers, { offsetX: 1, offsetY: 2, blur: 3, color: 'rgba(0,0,0,0.35)' }] });
  };

  const removeLayer = (index: number) => {
    const next = values.layers.filter((_, i) => i !== index);
    onChange({ layers: next });
  };

  const applyPreset = (layers: ShadowLayer[]) => {
    onChange({ layers });
    onApplyPreset?.(layers);
  };

  return (
    <div className="space-y-4">
      <button onClick={addLayer} className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded hover:bg-gray-600">+ Add text shadow</button>

      <div className="space-y-3">
        {values.layers.map((layer, idx) => (
          <div key={idx} className="p-2 border border-gray-700 rounded space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Range label="Offset X" min={-50} max={50} value={layer.offsetX} suffix="px" onChange={(v) => updateLayer(idx, { offsetX: v })} />
              <Range label="Offset Y" min={-50} max={50} value={layer.offsetY} suffix="px" onChange={(v) => updateLayer(idx, { offsetY: v })} />
              <Range label="Blur" min={0} max={100} value={layer.blur} suffix="px" onChange={(v) => updateLayer(idx, { blur: v })} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Color</label>
              <input type="color" value={toHexIfPossible(layer.color)} onChange={(e) => updateLayer(idx, { color: e.target.value })} className="h-7 w-10 bg-gray-700 border border-gray-600 rounded" />
              <input type="text" value={layer.color} onChange={(e) => updateLayer(idx, { color: e.target.value })} className="flex-1 bg-gray-700 text-white px-2 py-1 text-xs rounded border border-gray-600" />
              <button onClick={() => removeLayer(idx)} className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded hover:bg-gray-600">–</button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide">Presets</div>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => applyPreset(p.layers)} className="p-3 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-xs text-gray-200">
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function toHexIfPossible(input: string): string {
  // Accept hex or rgba; return hex for color input if hex-looking, else fallback to #000000
  const hexMatch = input.trim().match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (hexMatch) return input;
  return '#000000';
}


