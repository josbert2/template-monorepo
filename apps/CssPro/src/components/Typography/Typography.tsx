'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Type } from 'lucide-react';
import dynamic from 'next/dynamic';
import CustomSelect from '../ui/custom-select';
import ControlledNumberField from '../ui/controlled-number-field';
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"


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
const ColorPicker = dynamic(() => import('../ColorPicker'), { ssr: false });
export default function Typography({ values, onChange, onFontSizeChange, onFontSizeUnitChange }: TypographyProps) {
  const commonColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF0066', '#FF3366', '#FF6699', '#66FF00', '#00FFFF', '#9900FF'
  ];

  const fontFamilyOptions = [
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Helvetica, sans-serif", label: "Helvetica" },
    { value: "Times New Roman, serif", label: "Times New Roman" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Verdana, sans-serif", label: "Verdana" },
    { value: "Courier New, monospace", label: "Courier New" },
    { value: "system-ui, sans-serif", label: "System UI" },
    { value: "Inter, sans-serif", label: "Inter" },
    { value: "Roboto, sans-serif", label: "Roboto" },
    { value: "Open Sans, sans-serif", label: "Open Sans" }
  ];

  const fontWeightOptions = [
    { value: "100", label: "100 - Thin" },
    { value: "200", label: "200 - Extra Light" },
    { value: "300", label: "300 - Light" },
    { value: "400", label: "400 - Normal" },
    { value: "500", label: "500 - Medium" },
    { value: "600", label: "600 - Semi Bold" },
    { value: "700", label: "700 - Bold" },
    { value: "800", label: "800 - Extra Bold" },
    { value: "900", label: "900 - Black" }
  ];

  const fontSizeUnitOptions = [
    { value: "px", label: "px" },
    { value: "em", label: "em" },
    { value: "rem", label: "rem" },
    { value: "%", label: "%" },
    { value: "pt", label: "pt" }
  ];

  const handleColorChange = (color: string) => {
    onChange('color', color);
  };

  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 tracking-wide">Font Family</label>
        <CustomSelect
          value={values.fontFamily}
          onValueChange={(value) => onChange('fontFamily', value)}
          options={fontFamilyOptions}
          placeholder="Seleccionar fuente"
        />
      </div>

      {/* Font Weight and Size */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 tracking-wide">Weight</label>
          <CustomSelect
            value={values.fontWeight}
            onValueChange={(value) => onChange('fontWeight', value)}
            options={fontWeightOptions}
            placeholder="Peso"
            variant="weight-gradient"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-400  tracking-wide">Size</label>
          <div className="flex">
            <ControlledNumberField
              value={values.fontSize.value}
              onChange={onFontSizeChange}
              minValue={0}
              maxValue={999}
              step={1}
              className="flex-1"
            />
            <CustomSelect
              value={values.fontSize.unit}
              onValueChange={(value) => onFontSizeUnitChange(value)}
              options={fontSizeUnitOptions}
              className=" ml-1"
            />
          </div>
        </div>
      </div>

      {/* Color and Line Height */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-gray-400  tracking-wide">Color</label>
          <div className="flex items-center gap-2">
            <ColorPicker 
              value={values.color} 
              onChange={handleColorChange}
              swatches={commonColors}
              theme="classic"
            />
            <div 
              className="text-xs text-gray-300 px-3 py-1.5 rounded border border-secondary-bg"
              style={{ color: values.color }}
            >
              {values.color}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-400  tracking-wide">Line Height</label>
          <Input
            type="text" 
            value={values.lineHeight}
            onChange={(e) => onChange('lineHeight', e.target.value)}
            placeholder="1.5, 24px, normal"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400  tracking-wide">Text Align</label>
        <div className="flex rounded-lg border border-secondary-bg overflow-hidden hover:border-pikend-bg/20">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
            { value: 'justify', icon: AlignJustify }
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onChange('textAlign', value)}
              className={`flex-1 p-2 flex cursor-pointer items-center justify-center transition-colors  ${
                values.textAlign === value 
                  ? 'bg-secondary-bg text-white' 
                  : 'bg-primary-700 text-gray-300 hover:bg-pikend-bg/20'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Text Decorations */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400  tracking-wide">Decorations</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange('fontStyle', values.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`p-2 rounded-lg transition-colors ${
              values.fontStyle === 'italic'
                ? 'bg-pikend-bg text-white border border-pikend-bg' 
                : 'bg-primary-bg text-gray-300 hover:bg-pikend-bg/20 '
            }`}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => onChange('textDecoration', { 
              ...values.textDecoration, 
              underline: !values.textDecoration.underline 
            })}
            className={`p-2 rounded-lg transition-colors ${
              values.textDecoration.underline
                ? 'bg-pikend-bg text-white border border-pikend-bg' 
                : 'bg-primary-bg text-gray-300 hover:bg-pikend-bg/20 '
            }`}
          >
            <Underline size={16} />
          </button>
          <button
            onClick={() => onChange('textDecoration', { 
              ...values.textDecoration, 
              lineThrough: !values.textDecoration.lineThrough 
            })}
            className={`p-2 rounded-lg transition-colors ${
              values.textDecoration.lineThrough
                ? 'bg-pikend-bg text-white border border-pikend-bg' 
                : 'bg-primary-bg text-gray-300 hover:bg-pikend-bg/20 '
            }`}
          >
            <Type size={16} />
          </button>
        </div>
      </div>

      {/* Use Background as Text Color */}
      <div className="flex items-center space-x-3">
        <Checkbox
          id="useBackgroundAsText"
          checked={values.useBackgroundAsText}
          onChange={(checked) => onChange('useBackgroundAsText', checked)}
          label="Use background as text color"
        />
      </div>
    </div>
  );
}