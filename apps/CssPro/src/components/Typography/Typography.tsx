'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Type } from 'lucide-react';
import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr/dist/pickr.es5.min';


interface TypographyValues {
  fontFamily: string;
  fontWeight: string;
  fontSize: { value: number; unit: string };
  color: string;
  lineHeight: string;
  textAlign: string;
  textDecoration: {
    underline: boolean;
    overline: boolean;
    lineThrough: boolean;
  };
  fontStyle: string;
  useBackgroundAsText: boolean;
}

interface TypographyProps {
  values: TypographyValues;
  onChange: (property: string, value: any) => void;
  onFontSizeChange: (value: number) => void;
  onFontSizeUnitChange: (unit: string) => void;
}

export default function Typography({ values, onChange, onFontSizeChange, onFontSizeUnitChange }: TypographyProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  console.log(Pickr)
  const commonColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF0066', '#FF3366', '#FF6699', '#66FF00', '#00FFFF', '#9900FF'
  ];

  const handleColorSelect = (color: string) => {
    onChange('color', color);
    setShowColorPicker(false);
  };

  const handleCustomColor = () => {
    const newColor = prompt('Enter color (hex, rgb, or name):', values.color);
    if (newColor) {
      onChange('color', newColor);
    }
    setShowColorPicker(false);
  };

  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Font Family</label>
        <select 
          value={values.fontFamily}
          onChange={(e) => onChange('fontFamily', e.target.value)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Courier New, monospace">Courier New</option>
          <option value="system-ui, sans-serif">System UI</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="Roboto, sans-serif">Roboto</option>
          <option value="Open Sans, sans-serif">Open Sans</option>
        </select>
      </div>

      {/* Font Weight and Size */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Weight</label>
          <select 
            value={values.fontWeight}
            onChange={(e) => onChange('fontWeight', e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="100">100 - Thin</option>
            <option value="200">200 - Extra Light</option>
            <option value="300">300 - Light</option>
            <option value="400">400 - Normal</option>
            <option value="500">500 - Medium</option>
            <option value="600">600 - Semi Bold</option>
            <option value="700">700 - Bold</option>
            <option value="800">800 - Extra Bold</option>
            <option value="900">900 - Black</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Size</label>
          <div className="flex">
            <input 
              type="number" 
              value={values.fontSize.value}
              onChange={(e) => onFontSizeChange(parseFloat(e.target.value) || 0)}
              className="w-16 bg-gray-700 text-white px-2 py-2 rounded-l text-sm border border-gray-600 border-r-0 focus:border-blue-500 focus:outline-none"
              min="0"
            />
            <select 
              value={values.fontSize.unit}
              onChange={(e) => onFontSizeUnitChange(e.target.value)}
              className="bg-gray-700 text-white px-2 py-2 rounded-r text-sm border border-gray-600 border-l-0 focus:border-blue-500 focus:outline-none"
            >
              <option value="px">px</option>
              <option value="em">em</option>
              <option value="rem">rem</option>
              <option value="%">%</option>
              <option value="pt">pt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color and Line Height */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 relative">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Color</label>
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full h-10 rounded border border-gray-600 flex items-center px-3 hover:border-gray-500 transition-colors relative"
            style={{ backgroundColor: values.color }}
          >
            <span className="text-white text-sm font-medium mix-blend-difference flex items-center gap-2">
              <Palette size={16} />
              {values.color}
            </span>
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 w-64">
              <div className="grid grid-cols-6 gap-2 mb-3">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-8 h-8 rounded border-2 border-gray-600 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomColor}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  Custom Color
                </button>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Line Height</label>
          <input 
            type="text" 
            value={values.lineHeight}
            onChange={(e) => onChange('lineHeight', e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="1.5, 24px, normal"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Text Align</label>
        <div className="flex rounded border border-gray-600 overflow-hidden">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
            { value: 'justify', icon: AlignJustify }
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onChange('textAlign', value)}
              className={`flex-1 p-2 flex items-center justify-center transition-colors ${
                values.textAlign === value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Text Decorations */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Decorations</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange('fontStyle', values.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`p-2 rounded transition-colors ${
              values.fontStyle === 'italic'
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => onChange('textDecoration', { 
              ...values.textDecoration, 
              underline: !values.textDecoration.underline 
            })}
            className={`p-2 rounded transition-colors ${
              values.textDecoration.underline
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Underline size={16} />
          </button>
          <button
            onClick={() => onChange('textDecoration', { 
              ...values.textDecoration, 
              lineThrough: !values.textDecoration.lineThrough 
            })}
            className={`p-2 rounded transition-colors ${
              values.textDecoration.lineThrough
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Type size={16} />
          </button>
        </div>
      </div>

      {/* Use Background as Text Color */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="useBackgroundAsText"
          checked={values.useBackgroundAsText}
          onChange={(e) => onChange('useBackgroundAsText', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="useBackgroundAsText" className="text-sm text-gray-300">
          Use background as text color
        </label>
      </div>
    </div>
  );
}