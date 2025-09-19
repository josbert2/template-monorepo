"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/** —— Helpers color —— */
type HSVA = { h: number; s: number; v: number; a: number };
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const BLEND_MODES = [
  "normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"
];

function hexToRgba(hex: string) {
  const m = hex.trim().replace(/^#/, "");
  if (![3,4,6,8].includes(m.length)) return null;
  const to255 = (s: string) => parseInt(s.length === 1 ? s+s : s, 16);
  const r = to255(m.length <= 4 ? m[0] : m.slice(0,2));
  const g = to255(m.length <= 4 ? m[1] : m.slice(2,4));
  const b = to255(m.length <= 4 ? m[2] : m.slice(4,6));
  const a = m.length === 4 ? to255(m[3]) / 255 : m.length === 8 ? to255(m.slice(6,8)) / 255 : 1;
  return { r, g, b, a };
}
function rgbaToHexa(r: number, g: number, b: number, a = 1) {
  const toHex = (n: number) => n.toString(16).padStart(2,"0");
  return ("#" + toHex(r) + toHex(g) + toHex(b) + Math.round(a*255).toString(16).padStart(2,"0")).toUpperCase();
}
function rgbaToHsva(r: number, g: number, b: number, a = 1): HSVA {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h=0;
  if (d!==0){
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h*=60;
  }
  const s=max===0?0:d/max, v=max;
  return { h, s, v, a };
}
/** Conserva hue previo cuando s=0 (gris) */
function rgbaToHsvaSafe(
  r: number, g: number, b: number, a = 1, prevHue?: number
): HSVA {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h: number;
  if (d===0) {
    h = typeof prevHue === "number" ? prevHue : 0;
  } else {
    if (max===r) h=((g-b)/d + (g<b?6:0))*60;
    else if (max===g) h=((b-r)/d + 2)*60;
    else h=((r-g)/d + 4)*60;
  }
  const s=max===0?0:d/max, v=max;
  return { h, s, v, a };
}

function hsvaToRgba(h: number, s: number, v: number, a=1){
  const c=v*s, x=c*(1-Math.abs(((h/60)%2)-1)), m=v-c;
  let r=0,g=0,b=0;
  if (0<=h && h<60){ r=c; g=x; }
  else if (60<=h && h<120){ r=x; g=c; }
  else if (120<=h && h<180){ g=c; b=x; }
  else if (180<=h && h<240){ g=x; b=c; }
  else if (240<=h && h<300){ r=x; b=c; }
  else { r=c; b=x; }
  return { r: Math.round((r+m)*255), g: Math.round((g+m)*255), b: Math.round((b+m)*255), a };
}
const rgbaString = (r:number,g:number,b:number,a=1)=>`rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
function hslaStringFromHsva(h:number,s:number,v:number,a:number){
  const l=v-(v*s)/2;
  const sl=l===0||l===1?0:(v-l)/Math.min(l,1-l);
  return `hsla(${Math.round(h)}, ${Math.round(sl*100)}%, ${Math.round(l*100)}%, ${+a.toFixed(3)})`;
}

/** —— Types —— */
type TabKey =
  | "solid"
  | "linear-gradient"
  | "radial-gradient"
  | "conic-gradient"
  | "image"
  | "pattern"
  | "noise";

export type GradientStop = { id: string; color: string; position: number };

export type AdvancedColorPickerProps = {
  value?: string;
  onChange?: (
    css: {
      backgroundImage: string;
      backgroundRepeat: string;
      backgroundBlendMode: string;
      backgroundSize?: string;
      backgroundPosition?: string;
    },
    clipboardCss: string
  ) => void;
  defaultSwatches?: string[];
  className?: string;
};

export default function AdvancedColorPicker({
  value,
  onChange,
  defaultSwatches = [
    "#ff4d4f","#f759ab","#9254de","#597ef7","#40a9ff","#36cfc9","#73d13d","#bae637",
    "#ffd666","#ffa940","#ff7a45","#8c8c8c","#009688","#FFD439"
  ],
  className
}: AdvancedColorPickerProps){
  const isExternalSetRef = useRef(false);
  const prevCssRef = useRef<string>('');
  /** Modelo color + formato IO */
  const [hsva, setHsva] = useState<HSVA>({ h: 180, s: 0.5, v: 0.7, a: 1 });
  const [format, setFormat] = useState<"HEXA"|"RGBA"|"HSLA">("HEXA");

  /** Tabs y parámetros */
  const [tab, setTab] = useState<TabKey>("solid");
  const [angle, setAngle] = useState(90);

  /** —— GLOBALS: blend + repeat para TODO —— */
  const [blend, setBlend] = useState<string>("multiply");
  const [repeat, setRepeat] = useState<boolean>(false);

  /** Stops para gradientes */
  const [stops, setStops] = useState<GradientStop[]>([
    { id: "s1", color: "#FFD439", position: 0 },
    { id: "s2", color: "#FF7A00", position: 100 }
  ]);

  /** Image/pattern/noise */
  const [imageUrl, setImageUrl] = useState("https://picsum.photos/800/600?blur=0");
  const [patternSize, setPatternSize] = useState(10);
  const [noiseUrl, setNoiseUrl] = useState("https://upload.wikimedia.org/wikipedia/commons/5/5f/Noise512x512.png");
  const [noiseOpacity, setNoiseOpacity] = useState(0.35);

  /** Parse inicial */
  useEffect(() => {
  if (!value) return;

  // Detecta tipo
  const hex = (value.match(/#([0-9a-f]{3,8})\b/i) || [])[0];
  if (hex) {
    const rgba = hexToRgba(hex);
    if (rgba) {
      const next = rgbaToHsvaSafe(rgba.r, rgba.g, rgba.b, rgba.a, hsva.h);
      const same =
        Math.round(next.h) === Math.round(hsva.h) &&
        Math.round(next.s * 1000) === Math.round(hsva.s * 1000) &&
        Math.round(next.v * 1000) === Math.round(hsva.v * 1000) &&
        Math.round(next.a * 1000) === Math.round(hsva.a * 1000);

      if (!same) {
        isExternalSetRef.current = true;   // <- marcar que viene de props
        setHsva(next);
      }
    }
    setTab("solid");
    return;
  }

  if (/linear-gradient\(/i.test(value)) setTab("linear-gradient");
  else if (/radial-gradient\(/i.test(value)) setTab("radial-gradient");
  else if (/conic-gradient\(/i.test(value)) setTab("conic-gradient");
  else if (/url\(/i.test(value)) setTab("image");
}, [value]); // <- no incluyas hsva aquí

  const rgba = useMemo(()=>hsvaToRgba(hsva.h, hsva.s, hsva.v, hsva.a),[hsva]);
  const hexa = useMemo(()=>rgbaToHexa(rgba.r, rgba.g, rgba.b, rgba.a),[rgba]);
  const rgbaStr = useMemo(()=>rgbaString(rgba.r, rgba.g, rgba.b, rgba.a),[rgba]);
  const hslaStr = useMemo(()=>hslaStringFromHsva(hsva.h, hsva.s, hsva.v, hsva.a),[hsva]);

  /** Lista de stops -> string */
  const gradientList = useMemo(
    () => stops.slice().sort((a,b)=>a.position-b.position).map(s=>`${s.color} ${s.position}%`).join(", "),
    [stops]
  );

  /** —— Generación de CSS (longhands) —— */
  const { cssObj, clipboardCss } = useMemo(()=>{
    // 1) layers de background-image
    let layers: string[] = [];
    let bgSize: string | undefined;
    let bgPosition: string | undefined;
    if (tab === "solid"){
      layers = [format==="HEXA" ? hexa : format==="RGBA" ? rgbaStr : hslaStr];
    } else if (tab === "linear-gradient"){
      layers = [`linear-gradient(${angle}deg, ${gradientList})`];
    } else if (tab === "radial-gradient"){
      layers = [`radial-gradient(circle, ${gradientList})`];
    } else if (tab === "conic-gradient"){
      layers = [`conic-gradient(from ${angle}deg at 50% 50%, ${gradientList})`];
    } else if (tab === "image"){
      layers = [`url("${imageUrl}")`];
    } else if (tab === "pattern"){
      const s = Math.max(2, Math.min(128, patternSize));
      layers = [
        `linear-gradient(135deg, ${hexa} 25%, transparent 25%)`,
        `linear-gradient(225deg, ${hexa} 25%, transparent 25%)`,
        `linear-gradient(45deg, ${hexa} 25%, transparent 25%)`,
        `linear-gradient(315deg, ${hexa} 25%, transparent 25%)`
      ];
      bgPosition = `${s/2}px 0, ${s/2}px 0, 0 0, 0 0`;
      bgSize = `${s}px ${s}px`;
    } else { // noise
      layers = [
        `linear-gradient(${rgbaStr}, ${rgbaStr})`,
        `url("${noiseUrl}")`
      ];
    }

    // 2) repeat global
    const backgroundRepeat = repeat ? "repeat" : "no-repeat";

    // 3) blend global
    const backgroundBlendMode = Array(layers.length).fill(blend).join(", ");

    // 4) longhands (objeto para React style)
    const cssObj = {
      backgroundImage: layers.join(", "),
      backgroundRepeat,
      backgroundBlendMode,
      ...(bgSize ? { backgroundSize: bgSize } : {}),
      ...(bgPosition ? { backgroundPosition: bgPosition } : {}),
    };

    // 5) bloque copiable (solo informativo)
    const clipLines = [
      `background-image: ${cssObj.backgroundImage};`,
      `background-repeat: ${cssObj.backgroundRepeat};`,
      `background-blend-mode: ${cssObj.backgroundBlendMode};`,
    ];
    if (bgSize) clipLines.push(`background-size: ${bgSize};`);
    if (bgPosition) clipLines.push(`background-position: ${bgPosition};`);
    if (tab === "noise") {
      clipLines.push(`/* Para ruido, puedes aplicar opacity: ${noiseOpacity}; en el contenedor */`);
    }
    return { cssObj, clipboardCss: clipLines.join("\n") };
  },[tab, format, hexa, rgbaStr, hslaStr, gradientList, angle, imageUrl, patternSize, noiseUrl, noiseOpacity, blend, repeat]);

  useEffect(() => {
    const currentCss = JSON.stringify(cssObj);
    if (currentCss === prevCssRef.current) return;
    prevCssRef.current = currentCss;

    // si el último set vino de props, no emitir este tick
    if (isExternalSetRef.current) {
      isExternalSetRef.current = false;
      return;
    }
    onChange?.(cssObj, clipboardCss);
  }, [cssObj, clipboardCss, onChange]);

  /** —— UI: SV panel —— */
  const svRef = useRef<HTMLDivElement>(null);
  const [svPointer, setSvPointer] = useState({ x: 0.5, y: 0.3 });
  useEffect(()=>{ setSvPointer({ x: hsva.s, y: 1-hsva.v }); },[hsva.s, hsva.v]);
  function onSvDown(e: React.MouseEvent){
    const el = svRef.current!; const rect = el.getBoundingClientRect();
    const move=(cx:number,cy:number)=>{
      const x=clamp((cx-rect.left)/rect.width);
      const y=clamp((cy-rect.top)/rect.height);
      setSvPointer({x,y}); setHsva(p=>({...p,s:x,v:1-y}));
    };
    move(e.clientX,e.clientY);
    const onMove=(ev:MouseEvent)=>move(ev.clientX,ev.clientY);
    const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp);
  }

  /** —— Slider robusto —— */
  function Slider({ value, onChange, gradient }: { value:number; onChange:(n:number)=>void; gradient:string }){
    const track = useRef<HTMLDivElement>(null);
    const posToValue = (clientX: number) => {
      const rect = track.current!.getBoundingClientRect();
      return clamp((clientX - rect.left) / rect.width);
    };
    return (
      <div
        ref={track}
        className="relative h-3 w-full rounded-md overflow-hidden cursor-pointer"
        style={{ background: gradient }}
        onMouseDown={(e)=>{
          onChange(posToValue(e.clientX));
          const move=(ev:MouseEvent)=>onChange(posToValue(ev.clientX));
          const up=()=>{window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up);};
          window.addEventListener("mousemove",move); window.addEventListener("mouseup",up);
        }}
      >
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${value*100}%` }}>
          <div className="h-4 w-4 rounded-full border border-white shadow bg-white/90 -translate-x-1/2" />
        </div>
      </div>
    );
  }

  /** —— Stops editor (solo para gradientes) —— */
  function StopsEditor(){
    const barRef = useRef<HTMLDivElement>(null);
    const gradientBg = useMemo(()=>`linear-gradient(90deg, ${gradientList})`,[gradientList]);

    const startDrag=(id:string,e:React.MouseEvent)=>{
      e.stopPropagation();
      const rect=barRef.current!.getBoundingClientRect();
      const move=(cx:number)=>{
        const pos=Math.round(clamp((cx-rect.left)/rect.width)*100);
        setStops(arr=>arr.map(s=>s.id===id?{...s,position:pos}:s));
      };
      move(e.clientX);
      const onMove=(ev:MouseEvent)=>move(ev.clientX);
      const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
      window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp);
    };

    const addStop=(e:React.MouseEvent)=>{
      const rect=barRef.current!.getBoundingClientRect();
      const pos=Math.round(clamp((e.clientX-rect.left)/rect.width)*100);
      setStops(arr=>[...arr,{ id: Math.random().toString(36).slice(2), color: hexa, position: pos }]);
    };
    const removeStop=(id:string)=>setStops(arr=>arr.length>2?arr.filter(s=>s.id!==id):arr);

    return (
      <div className="space-y-3">
        <div
          ref={barRef}
          className="relative h-6 rounded-md cursor-crosshair border border-white/10 overflow-visible"
          style={{ background: gradientBg }}
          onDoubleClick={addStop}
        >
          {stops.map(s=>(
            <div key={s.id} className="absolute -top-2" style={{ left: `calc(${s.position}% - 8px)` }} onMouseDown={(e)=>startDrag(s.id,e)}>
              <div className="h-5 w-5 rounded-md border border-white shadow-sm" style={{ background: s.color }} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {stops.map((s,i)=>(
            <div key={s.id} className="flex items-center gap-2">
              <input type="color" value={s.color}
                onChange={(e)=>setStops(arr=>arr.map(x=>x.id===s.id?{...x,color:e.target.value}:x))}
                className="h-8 w-10 rounded" />
              <input type="number" value={s.position} min={0} max={100}
                onChange={(e)=>setStops(arr=>arr.map(x=>x.id===s.id?{...x,position:clamp(Number(e.target.value),0,100)}:x))}
                className="w-16 bg-transparent border border-white/10 rounded px-2 py-1 text-sm" />
              <button onClick={()=>removeStop(s.id)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Remove</button>
              {i<stops.length-1 && <span className="opacity-30">|</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /** —— UI —— */
  const tabItems: Array<{key:TabKey; title:string; preview:React.CSSProperties}> = [
    { key:"solid", title:"Solid", preview:{ background: hexa } },
    { key:"linear-gradient", title:"Linear", preview:{ background:`linear-gradient(135deg, ${hexa}, ${rgbaStr})` } },
    { key:"radial-gradient", title:"Radial", preview:{ background:`radial-gradient(circle, ${hexa}, ${rgbaStr})` } },
    { key:"conic-gradient", title:"Conic", preview:{ background:`conic-gradient(from 0deg at 50% 50%, ${hexa}, ${rgbaStr})` } },
    { key:"image", title:"Image", preview:{} },
    { key:"pattern", title:"Pattern", preview:{
      backgroundImage:
        `linear-gradient(135deg, ${hexa} 25%, transparent 25%),
         linear-gradient(225deg, ${hexa} 25%, transparent 25%),
         linear-gradient(45deg,  ${hexa} 25%, transparent 25%),
         linear-gradient(315deg, ${hexa} 25%, transparent 25%)`,
      backgroundPosition: "5px 0, 5px 0, 0 0, 0 0",
      backgroundSize: "10px 10px",
      backgroundRepeat: "repeat"
    }},
    { key:"noise", title:"Noise", preview:{
      backgroundImage:`linear-gradient(${rgbaStr}, ${rgbaStr}), url(${noiseUrl})`,
      backgroundSize:"30px",
      backgroundBlendMode:"overlay,normal"
    }},
  ];

  return (
    <div className={"max-w-xl w-full rounded-xl p-4 bg-neutral-900 text-white shadow-2xl border border-white/10 "+(className??"")}
         style={{ fontFamily: "ui-sans-serif, system-ui" }}>

      {/* Tabs */}
      <ul className="flex items-center gap-2 rounded-lg p-1 bg-black/30 w-fit mb-3">
        {tabItems.map(t=>{
          const current = tab===t.key;
          return (
            <li key={t.key} title={t.title}>
              <button
                onClick={()=>setTab(t.key)}
                className={`h-8 w-8 rounded-md border border-white/10 ${current?"ring-2 ring-emerald-400":"opacity-80 hover:opacity-100"}`}
              >
                <span className="block h-full w-full rounded-sm" style={t.preview}/>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-12 gap-4">
        {/* SV Panel */}
        <div className="col-span-8">
          <div
            className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-crosshair"
            ref={svRef}
            onMouseDown={onSvDown}
            style={{ background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hsva.h} 100% 50%))` }}
          >
            <div className="absolute h-4 w-4 rounded-full border-2 border-white shadow"
                 style={{ left:`calc(${svPointer.x*100}% - 8px)`, top:`calc(${svPointer.y*100}% - 8px)` }}/>
          </div>

          {/* Hue */}
          <div className="mt-3">
            <Slider
              value={hsva.h/360}
              onChange={(v)=>setHsva(p=>({...p, h: Math.max(0, Math.min(359.999, v*360)) }))}
              gradient={`linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)`}
            />
          </div>

          {/* Alpha */}
          <div className="mt-3">
            <div className="bg-[linear-gradient(45deg,#0000_25%,#000_25%_50%,#0000_50%_75%,#000_75%_100%),linear-gradient(45deg,#000_25%,#0000_25%_50%,#000_50%_75%,#0000_75%_100%)] bg-[length:12px_12px] bg-[position:0_0,6px_6px] rounded-md">
              <Slider
                value={hsva.a}
                onChange={(v)=>setHsva(p=>({...p,a:v}))}
                gradient={`linear-gradient(90deg, rgba(${rgba.r},${rgba.g},${rgba.b},0), rgba(${rgba.r},${rgba.g},${rgba.b},1))`}
              />
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="col-span-4 flex flex-col gap-3">
          {/* Swatches */}
          <div className="grid grid-cols-6 gap-2">
            {defaultSwatches.map(c=>(
              <button key={c} className="h-6 w-full rounded shadow border border-white/10"
                style={{ background:c }}
                onClick={()=>{
                  const r = hexToRgba(c) ?? { r:0,g:0,b:0,a:1 };
                  setHsva(h => rgbaToHsvaSafe(r.r, r.g, r.b, r.a, h.h));
                }}
              />
            ))}
          </div>

          {/* Formato + Copy */}
          <div className="flex items-center gap-2">
            {(["HEXA","RGBA","HSLA"] as const).map(f=>(
              <button key={f} onClick={()=>setFormat(f)}
                className={`px-2 py-1 text-xs rounded ${format===f?"bg-emerald-500 text-black":"bg-white/10"}`}>
                {f}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button
                className="px-2 py-1 text-xs rounded bg-blue-500 text-black"
                onClick={()=>navigator.clipboard.writeText(clipboardCss)}
              >
                Copy CSS
              </button>
            </div>
          </div>

          {/* IO (solo lectura/edición rápida del bloque copiable) */}
          <textarea
            className="w-full text-xs px-2 py-1 rounded bg-black/40 border border-white/10 font-mono min-h-[76px]"
            value={clipboardCss}
            onChange={(e)=>{
              const val=e.target.value;
              const hex=(val.match(/#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i)||[])[0];
              if (hex){
                const r=hexToRgba(hex);
                if (r) setHsva(h => rgbaToHsvaSafe(r.r, r.g, r.b, r.a, h.h));
                setTab("solid");
              }
            }}
          />

          {/* —— Controles GLOBALES —— */}
          <div className="flex items-center gap-2">
            <label className="text-xs opacity-70 w-16">Blend</label>
            <select value={blend} onChange={(e)=>setBlend(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm">
              {BLEND_MODES.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs opacity-90">
            <input type="checkbox" checked={repeat} onChange={e=>setRepeat(e.target.checked)} />
            Repeat
          </label>

          {/* Específicos por tipo */}
          {["linear-gradient","conic-gradient"].includes(tab) && (
            <div className="flex items-center gap-2">
              <label className="text-xs opacity-70 w-16">Angle</label>
              <input type="range" min={0} max={360} value={angle}
                     onChange={(e)=>setAngle(parseInt(e.target.value))} className="w-full"/>
              <div className="w-10 text-right text-xs opacity-70">{angle}°</div>
            </div>
          )}

          {["linear-gradient","radial-gradient","conic-gradient"].includes(tab) && <StopsEditor />}

          {tab==="image" && (
            <div className="space-y-2">
              <label className="text-xs opacity-70">Image URL</label>
              <input className="w-full text-sm px-2 py-1 rounded bg-black/40 border border-white/10"
                     value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}

          {tab==="pattern" && (
            <div className="flex items-center gap-2">
              <label className="text-xs opacity-70 w-24">Pattern size</label>
              <input type="range" min={4} max={64} value={patternSize}
                     onChange={(e)=>setPatternSize(parseInt(e.target.value))} className="w-full" />
              <div className="w-10 text-right text-xs opacity-70">{patternSize}px</div>
            </div>
          )}

          {tab==="noise" && (
            <div className="space-y-2">
              <label className="text-xs opacity-70">Noise URL</label>
              <input className="w-full text-sm px-2 py-1 rounded bg-black/40 border border-white/10"
                     value={noiseUrl} onChange={(e)=>setNoiseUrl(e.target.value)} />
              <div className="flex items-center gap-2">
                <label className="text-xs opacity-70 w-16">Opacity</label>
                <input type="range" min={0} max={1} step={0.01}
                       value={noiseOpacity} onChange={(e)=>setNoiseOpacity(parseFloat(e.target.value))}
                       className="w-full" />
                <div className="w-12 text-right text-xs opacity-70">{Math.round(noiseOpacity*100)}%</div>
              </div>
              <div className="text-[10px] opacity-70">
                * Para opacidad global del fondo (incluido el ruido), usa <code>opacity: {noiseOpacity}</code> en el contenedor.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
