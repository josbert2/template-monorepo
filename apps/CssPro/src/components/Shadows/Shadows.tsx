import React from 'react';
import { Button } from '../ui/button';
import { SliderWithInput } from '../ui/slider-with-input';
import ColorPicker from '../ColorPicker'; 
import { IconPlus, IconTrash } from '@tabler/icons-react';



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
      <div className='flex justify-end'>
        <Button 
          onClick={addLayer} 
          className='text-gray-400'
          variant="pikend" 
          size="xs"
        >
          <IconPlus stroke={2} size={21}/>
           Add text shadow
        </Button>
      </div>

      <div className="space-y-3">
        {values.layers.map((layer, idx) => (
          <div key={idx} className="p-4 py-4 bg-secondary-bg rounded-lg space-y-2 relative">
            <div className="grid grid-cols-3 gap-2">
              <SliderWithInput
                value={[layer.offsetX]}
                onValueChange={(v) => updateLayer(idx, { offsetX: v[0] })}
                min={-50}
                max={50}
                className="w-full"
                inputClassName="h-7 w-12"
                showTooltip={true}
                aria-label="Offset X"
                label="Offset X"
                suffix="px"
              />
              <SliderWithInput
                value={[layer.offsetY]}
                onValueChange={(v) => updateLayer(idx, { offsetY: v[0] })}
                min={-50}
                max={50}
                className="w-full"
                inputClassName="h-7 w-12"
                showTooltip={true}
                aria-label="Offset Y"
                label="Offset Y"
                suffix="px"
              />
              <SliderWithInput
                value={[layer.blur]}
                onValueChange={(v) => updateLayer(idx, { blur: v[0] })}
                min={0}
                max={100}
                className="w-full"
                inputClassName="h-7 w-12"
                showTooltip={true}
                aria-label="Blur"
                label="Blur"
                suffix="px"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <label className="text-xs text-gray-400">Color</label>
              <ColorPicker
                value={layer.color}
                onChange={(color) => updateLayer(idx, { color })}
                className="flex-1"
              />
              <input 
                type="text"
                value={layer.color}
                onChange={(e) => updateLayer(idx, { color: toHexIfPossible(e.target.value) })}
                className="w-16 h-7 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                style={{'backgroundColor': layer.color, }}
                placeholder="Color"
              />
              <div className="absolute  top-0 right-0">
                <Button 
                  onClick={() => removeLayer(idx)} 
                  variant="pikend" 
                  size="xs"
                  className="text-gray-400 bg-transparent"
                >
                 <IconTrash stroke={2} size={21}/>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide">Presets</div>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <Button 
              key={p.name} 
              onClick={() => applyPreset(p.layers)} 
              variant="pikend"
              size="sm"
              className="text-gray-200"
            >
              {p.name}
            </Button>
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


