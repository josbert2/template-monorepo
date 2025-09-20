import React, { useMemo, useState } from 'react';

export type RangeProps = {
  id?: string;
  name?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  formatValue?: (value: number) => string;
  showValue?: boolean;
  suffix?: string; // e.g. 'px', '%'
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  disabled?: boolean;
};

export default function Range({
  id,
  name,
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  formatValue,
  showValue = true,
  suffix,
  className,
  inputClassName,
  labelClassName,
  labelProps,
  disabled,
}: RangeProps) {
  const isControlled = typeof value === 'number';
  const [internal, setInternal] = useState<number>(
    typeof defaultValue === 'number' ? defaultValue : (typeof value === 'number' ? value : min)
  );

  const current = isControlled ? (value as number) : internal;

  const percent = useMemo(() => {
    if (max === min) return 0;
    return Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100));
  }, [current, min, max]);

  const display = useMemo(() => {
    const base = typeof formatValue === 'function' ? formatValue(current) : String(current);
    return suffix ? `${base}${suffix}` : base;
  }, [current, formatValue, suffix]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value === '' ? min : Number(e.target.value);
    if (!isControlled) setInternal(next);
    onChange?.(next, e);
    // Re-dispatch a native 'input' event for external listeners (e.g., cssPro)
    // Only when triggered by a trusted user action to avoid loops
    const isUser = (e.nativeEvent as any)?.isTrusted === true;
    if (isUser) {
      const target = e.target as HTMLInputElement;
      try {
        const InputEvt = (window as any).InputEvent || Event;
        const evt = new InputEvt('input', { bubbles: true });
        target.dispatchEvent(evt);
      } catch {
        const evt = document.createEvent('Event');
        evt.initEvent('input', true, false);
        target.dispatchEvent(evt);
      }
    }
  };

  return (
    <label
      {...labelProps}
      className={[
        'flex flex-col gap-1 text-sm text-gray-300',
        labelClassName,
        labelProps?.className,
      ].filter(Boolean).join(' ')}
    >
      {label && (
        <span className="flex items-center justify-between">
          <span>{label}</span>
          {showValue && <span className="text-gray-400 tabular-nums">{display}</span>}
        </span>
      )}
      <input
        type="range"
        id={id}
        name={name}
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={handleChange}
        disabled={disabled}
        className={[
          'w-full cursor-pointer appearance-none',
          // Basic track/thumb styling fallbacks; can be extended via global CSS
          'h-2 rounded bg-gray-700',
          inputClassName,
        ].filter(Boolean).join(' ')}
        style={{
          // Consumers can style via this CSS variable to show progress coloring
          // Example (in CSS): input[type="range"] { background: linear-gradient(to right, #60a5fa var(--range-progress), #374151 var(--range-progress)); }
          // Tailwind users can use arbitrary values or custom classes
          // @ts-expect-error custom CSS var
          '--range-progress': `${percent}%`,
        }}
      />
    </label>
  );
}
