'use client';

import { useMemo, useState } from 'react';
import AdvancedColorPicker from '../ui/CustomPickColor';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CustomSelect } from '../ui/custom-select';

type LayerType = 'color' | 'image';

export type BackgroundLayer = {
  id: string;
  type: LayerType;
  enabled: boolean;
  // Color
  color?: string; // '#CE020201' | 'rgba(...)' | 'linear-gradient(...)' | 'radial-gradient(...)' | 'conic-gradient(...)'
  // Imagen
  imageUrl?: string; // sin url(''), solo la URL
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'round' | 'space';
  size?: 'auto' | 'cover' | 'contain' | '100% 100%';
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left' |
             'top left' | 'top right' | 'bottom left' | 'bottom right';
};

type BackgroundLayersProps = {
  value?: BackgroundLayer[];
  onChange?: (css: {
    background: string;                  // shorthand con todas las capas
    backgroundRepeat: string;            // listas separadas por coma
    backgroundSize: string;
    backgroundPosition: string;
  }, layers: BackgroundLayer[]) => void;
};

const newColorLayer = (): BackgroundLayer => ({
  id: crypto.randomUUID(),
  type: 'color',
  enabled: true,
  color: '#ffffff',
});

const newImageLayer = (): BackgroundLayer => ({
  id: crypto.randomUUID(),
  type: 'image',
  enabled: true,
  imageUrl: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
});

/** Intenta extraer un color/gradient válido desde un bloque CSS “full” del picker */
function extractColorOrGradient(input: string): string {
  if (!input) return '#ffffff';

  // Preferimos gradients
  const grad = input.match(/(?:linear|radial|conic)-gradient\([^;]*\)/i);
  if (grad) return grad[0];

  // rgba/hsla
  const rgba = input.match(/rgba?\(\s*[\d.\s,%]+\)/i);
  if (rgba) return rgba[0];
  const hsla = input.match(/hsla?\(\s*[\d.\s,%]+\)/i);
  if (hsla) return hsla[0];

  // HEX
  const hex = input.match(/#[0-9a-f]{3,8}/i);
  if (hex) return hex[0];

  return '#ffffff';
}

export default function BackgroundLayers({
  value = [newColorLayer()],
  onChange = () => {},
}: BackgroundLayersProps) {
  const [layers, setLayers] = useState<BackgroundLayer[]>(value);

  const PRESETS: string[] = [
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  // Construye el CSS a partir de las capas activas
  const cssComputed = useMemo(() => {
    const active = layers.filter(l => l.enabled);
  
    const images = active.map(l => {
      if (l.type === 'image' && l.imageUrl) return `url('${l.imageUrl}')`;
      if (l.type === 'color' && l.color)
        return l.color.includes('gradient(') ? l.color : `linear-gradient(${l.color}, ${l.color})`;
      return 'none';
    });
  
    const repeats   = active.map(l => (l.type === 'image' ? (l.repeat ?? 'no-repeat') : 'no-repeat'));
    const sizes     = active.map(l => (l.type === 'image' ? (l.size ?? 'auto') : 'auto'));
    const positions = active.map(l => (l.type === 'image' ? (l.position ?? 'center') : 'center'));
  
    return {
      backgroundImage: images.join(', '),
      backgroundRepeat: repeats.join(', '),
      backgroundSize: sizes.join(', '),
      backgroundPosition: positions.join(', '),
    };
  }, [layers]);

  const emit = (next: BackgroundLayer[]) => {
    setLayers(next);
    const active = next.filter(l => l.enabled);
  
    const images = active.map(l => {
      if (l.type === 'image' && l.imageUrl) return `url('${l.imageUrl}')`;
      if (l.type === 'color' && l.color)
        return l.color.includes('gradient(') ? l.color : `linear-gradient(${l.color}, ${l.color})`;
      return 'none';
    });
    const repeats   = active.map(l => (l.type === 'image' ? (l.repeat ?? 'no-repeat') : 'no-repeat'));
    const sizes     = active.map(l => (l.type === 'image' ? (l.size ?? 'auto') : 'auto'));
    const positions = active.map(l => (l.type === 'image' ? (l.position ?? 'center') : 'center'));
  
    onChange({
      // si tu prop onChange aún espera `background`, elimínalo y
      // actualiza su tipo a estos longhands
      background: images.join(', '), // <-- elimina esta línea si ya actualizaste el tipo
      backgroundRepeat: repeats.join(', '),
      backgroundSize: sizes.join(', '),
      backgroundPosition: positions.join(', '),
    }, next);
  };
  const updateLayer = (id: string, patch: Partial<BackgroundLayer>) => {
    const next = layers.map(l => (l.id === id ? { ...l, ...patch } : l));
    emit(next);
  };

  const removeLayer = (id: string) => emit(layers.filter(l => l.id !== id));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...layers];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    emit(next);
  };
  const moveDown = (idx: number) => {
    if (idx === layers.length - 1) return;
    const next = [...layers];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    emit(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Background</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => emit([newImageLayer(), ...layers])}
            className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
          >
            + Add image layer
          </button>
          <button
            type="button"
            onClick={() => emit([newColorLayer(), ...layers])}
            className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
          >
            + Add color layer
          </button>
        </div>
      </div>

      {layers.map((layer, idx) => (
        <div key={layer.id} className="rounded-lg border border-gray-700 bg-gray-850/60 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateLayer(layer.id, { enabled: !layer.enabled })}
                className={`w-8 h-8 rounded-lg border transition-colors flex items-center justify-center ${
                  layer.enabled 
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                }`}
                title={layer.enabled ? 'Hide layer' : 'Show layer'}
              >
                {layer.enabled ? '👁️' : '🚫'}
              </button>
              <span className="text-sm text-gray-300 flex-1">
                {layer.type === 'image'
                  ? `image(${layer.imageUrl || '—'})`
                  : `color(${layer.color})`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => moveUp(idx)} 
                className="w-7 h-7 rounded-md bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-colors flex items-center justify-center text-xs"
                title="Move layer up"
                disabled={idx === 0}
              >
                ↑
              </button>
              <button 
                onClick={() => moveDown(idx)} 
                className="w-7 h-7 rounded-md bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-colors flex items-center justify-center text-xs"
                title="Move layer down"
                disabled={idx === layers.length - 1}
              >
                ↓
              </button>
              <button 
                onClick={() => removeLayer(layer.id)} 
                className="w-7 h-7 rounded-md bg-red-900/20 border border-red-700/50 text-red-400 hover:bg-red-900/40 hover:border-red-600 transition-colors flex items-center justify-center text-xs"
                title="Remove layer"
              >
                ×
              </button>
            </div>
          </div>

          {/* Controles según tipo */}
          {layer.type === 'color' && (
            <div className="mt-3 flex items-center gap-3">
              {/* Bolita de color con tooltip que contiene el AdvancedColorPicker */}
              <Tooltip
               
              >
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-gray-400 transition-colors cursor-pointer shadow-sm flex-shrink-0"
                    style={{ backgroundColor: layer.color ?? '#ffffff' }}
                    title="Click to open color picker"
                  />
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  sideOffset={10}
                  className="p-0 border-none bg-transparent shadow-none z-[999999]"
                  align="start"
                >
                  <AdvancedColorPicker
                    value={layer.color ?? '#ffffff'}
                 
                    onChange={(css) => {
                      const extracted = extractColorOrGradient(css.backgroundImage || css.background || '');
                      if (extracted) {
                        updateLayer(layer.id, { color: extracted });
                      }
                    }}
                  />
                </TooltipContent>
              </Tooltip>
              
              {/* Texto del color actual */}
              <span className="text-sm text-gray-400 select-all font-mono">
                {(layer.color ?? '').toUpperCase()}
              </span>
            </div>
          )}

          {layer.type === 'image' && (
            <div className="mt-3 space-y-2">
              <Input
                type="text"
                placeholder="Image URL"
                value={layer.imageUrl ?? ''}
                onChange={(e) => updateLayer(layer.id, { imageUrl: e.target.value })}
              />

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Repeat</label>
                  <CustomSelect
                    value={layer.repeat ?? 'no-repeat'}
                    onValueChange={(value) => updateLayer(layer.id, { repeat: value as any })}
                    options={[
                      { value: 'no-repeat', label: 'No Repeat' },
                      { value: 'repeat', label: 'Repeat' },
                      { value: 'repeat-x', label: 'Repeat X' },
                      { value: 'repeat-y', label: 'Repeat Y' },
                      { value: 'round', label: 'Round' },
                      { value: 'space', label: 'Space' },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Size</label>
                  <CustomSelect
                    value={layer.size ?? 'cover'}
                    onValueChange={(value) => updateLayer(layer.id, { size: value as any })}
                    options={[
                      { value: 'auto', label: 'Auto' },
                      { value: 'cover', label: 'Cover' },
                      { value: 'contain', label: 'Contain' },
                      { value: '100% 100%', label: '100% 100%' },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Position</label>
                  <CustomSelect
                    value={layer.position ?? 'center'}
                    onValueChange={(value) => updateLayer(layer.id, { position: value as any })}
                    options={[
                      { value: 'center', label: 'Center' },
                      { value: 'top', label: 'Top' },
                      { value: 'right', label: 'Right' },
                      { value: 'bottom', label: 'Bottom' },
                      { value: 'left', label: 'Left' },
                      { value: 'top left', label: 'Top Left' },
                      { value: 'top right', label: 'Top Right' },
                      { value: 'bottom left', label: 'Bottom Left' },
                      { value: 'bottom right', label: 'Bottom Right' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Presets de colores comunes */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-300">Quick Colors</span>
        <div className="flex flex-wrap gap-2">
          {[
            '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
            '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
            '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080'
          ].map((color) => (
            <Button
              key={color}
              variant="pikend"
              size="xs"
              onClick={() => emit([{ ...newColorLayer(), color }, ...layers])}
              className="w-6 h-6 p-0 rounded-full border-2 border-gray-600 hover:border-gray-400 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Add ${color} layer`}
            />
          ))}
        </div>
      </div>

      {/* Vista previa de la capa de fondo */}
      {cssComputed.backgroundImage && cssComputed.backgroundImage !== 'none' && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-300">Preview</span>
          <div
            className="w-full h-20 rounded-lg border border-gray-700"
            style={{
              backgroundImage: cssComputed.backgroundImage,
              backgroundRepeat: cssComputed.backgroundRepeat,
              backgroundSize: cssComputed.backgroundSize,
              backgroundPosition: cssComputed.backgroundPosition,
            }}
          />
        </div>
      )}
    </div>
  );
}
