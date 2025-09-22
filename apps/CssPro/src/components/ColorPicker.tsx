'use client';
import { useEffect, useRef } from 'react';

type Props = {
  value?: string;
  onChange?: (hex: string) => void;
  theme?: 'classic' | 'monolith' | 'nano';
  swatches?: string[];
  disabled?: boolean;
};

export default function ColorPicker({
  value = '#00AEEF',
  onChange,
  theme = 'classic',
  swatches,
  disabled = false,
}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const pickrRef = useRef<any>(null);

  // Carga CSS del tema sólo en cliente (opcional si ya lo pones en globals.css)
  useEffect(() => {
    import('@simonwep/pickr/dist/themes/classic.min.css');
  }, []);

  useEffect(() => {
    let pickr: any;
    let cancelled = false;

    (async () => {
      if (!btnRef.current) return;
      // Importa Pickr sólo en cliente
      const Pickr = (await import('@simonwep/pickr')).default;

      if (cancelled) return;
      pickr = Pickr.create({
        el: btnRef.current!,
        theme,
        default: value,
        swatches:
          swatches ?? [
            '#F44336','#E91E63','#9C27B0','#673AB7',
            '#3F51B5','#2196F3','#03A9F4','#00BCD4',
            '#009688','#4CAF50','#8BC34A','#CDDC39',
            '#FFC107','#FF9800','#FF5722','#795548'
          ],
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: { hex: true, rgba: true, hsla: true, hsva: true, input: true, clear: true, save: true },
        },
      });

      pickr
        .on('change', (c: any) => {
          const hex = c.toHEXA().toString();
          if (btnRef.current) {
            btnRef.current.style.backgroundColor = hex;
          }
          onChange?.(hex);
        })
        .on('save', (c: any) => {
          const hex = c ? c.toHEXA().toString() : value;
        
          if (btnRef.current) {
            btnRef.current.style.backgroundColor = hex;
          }
          onChange?.(hex);
          pickr.hide();
        });

      pickrRef.current = pickr;
      // Establecer el color inicial
      if (btnRef.current) {
        btnRef.current.style.backgroundColor = value;
      }
    })();

    return () => {
      cancelled = true;
      pickr?.destroy();
      pickrRef.current = null;
    };
  }, [theme]);

  // Sync externo → Pickr
  useEffect(() => {
    const p = pickrRef.current;
    if (p && value) {
      const current = p.getColor()?.toHEXA().toString();
      if (current !== value) {
        p.setColor(value);
      }
    }
    // Siempre actualizar el color del botón
    if (btnRef.current) {
      btnRef.current.style.backgroundColor = value;
    }
  }, [value]);

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={disabled}
      className="h-9 w-9 rounded-lg border-2 border-secondary-bg hover:border-pikend-bg/30 focus:border-pikend-bg/30 focus:outline-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: value }}
      aria-label="Selector de color"
    />
  );
}
