'use client';

import { useMemo, useState } from 'react';
// ⬇️ usa la ruta real donde guardaste el AdvancedColorPicker
import AdvancedColorPicker from '../ui/CustomPickColor';

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
                className="text-gray-300"
                title={layer.enabled ? 'Hide layer' : 'Show layer'}
              >
                {layer.enabled ? '👁️' : '🚫'}
              </button>
              <span className="text-sm text-gray-300">
                {layer.type === 'image'
                  ? `image(${layer.imageUrl || '—'})`
                  : `color(${layer.color})`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => moveUp(idx)} className="text-xs text-gray-300">↑</button>
              <button onClick={() => moveDown(idx)} className="text-xs text-gray-300">↓</button>
              <button onClick={() => removeLayer(layer.id)} className="text-xs text-red-400">—</button>
            </div>
          </div>

          {/* Controles según tipo */}
          {layer.type === 'color' && (
            <div className="mt-3 flex items-start gap-3">
              {/* AdvancedColorPicker adaptado a capas de color/gradiente */}
              <div className="min-w-[260px] max-w-[480px] flex-1">
              <AdvancedColorPicker
                value={layer.color ?? '#ffffff'}
                onChange={(css/*, clipboardCss*/) => {
                  const m = css.backgroundImage.match(
                    /(linear-gradient\([^)]*\)|radial-gradient\([^)]*\)|conic-gradient\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8})/
                  );
                  if (m) updateLayer(layer.id, { color: m[1] });
                }}
              />
              </div>
              <span className="text-sm text-gray-400 mt-1 select-all">
                {(layer.color ?? '').toUpperCase()}
              </span>
            </div>
          )}

          {layer.type === 'image' && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Image URL"
                value={layer.imageUrl ?? ''}
                onChange={(e) => updateLayer(layer.id, { imageUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Repeat</label>
                  <select
                    value={layer.repeat ?? 'no-repeat'}
                    onChange={(e) => updateLayer(layer.id, { repeat: e.target.value as any })}
                    className="w-full px-2 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                    <option value="round">Round</option>
                    <option value="space">Space</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Size</label>
                  <select
                    value={layer.size ?? 'cover'}
                    onChange={(e) => updateLayer(layer.id, { size: e.target.value as any })}
                    className="w-full px-2 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                  >
                    <option value="auto">Auto</option>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="100% 100%">Stretch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Position</label>
                  <select
                    value={layer.position ?? 'center'}
                    onChange={(e) => updateLayer(layer.id, { position: e.target.value as any })}
                    className="w-full px-2 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="right">Right</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="top left">Top Left</option>
                    <option value="top right">Top Right</option>
                    <option value="bottom left">Bottom Left</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Presets */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-300">Presets</span>
        </div>
        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 rounded bg-gray-900/40 border border-gray-800">
          {PRESETS.map((bg, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emit([{ id: crypto.randomUUID(), type: 'color', enabled: true, color: bg }])}
              className="h-8 w-8 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              style={{ background: bg }}
              title={`Preset #${i+1}`}
            />
          ))}
        </div>
      </div>

      {/* Vista previa opcional */}
      <div className="mt-2 rounded border border-gray-700">
        <div
          className="h-24 w-full rounded"
          style={{
            backgroundImage:  cssComputed.backgroundImage,
            backgroundRepeat: cssComputed.backgroundRepeat,
            backgroundSize:   cssComputed.backgroundSize,
            backgroundPosition: cssComputed.backgroundPosition,
          }}
        />
      </div>
    </div>
  );
}
