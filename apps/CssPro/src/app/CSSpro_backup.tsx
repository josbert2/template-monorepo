import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, Eye, Copy, X, Target, Code, Palette, Settings, Trash2 } from 'lucide-react';
import styles from "../components/Csspro.module.css";
import  "../components/Csspro.css";


interface CSSProperty {
  name: string;
  value: string;
  isDefault?: boolean;
}

interface PropertySection {
  title: string;
  properties: CSSProperty[];
  expanded: boolean;
}

const CSS_CATEGORIES = {
  spacing: [
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left'
  ],
  typography: [
    'font-family', 'font-size', 'font-weight', 'line-height', 'color',
    'text-align', 'letter-spacing', 'text-decoration', 'text-transform',
    'text-shadow', 'font-style'
  ],
  background: [
    'background-color', 'background-image', 'background-position',
    'background-size', 'background-repeat', 'background-attachment'
  ],
  border: [
    'border-width', 'border-style', 'border-color', 'border-radius',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'
  ],
  display: [
    'display', 'position', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'overflow', 'overflow-x', 'overflow-y', 'visibility', 'opacity', 'z-index'
  ],
  flexbox: [
    'flex-direction', 'justify-content', 'align-items', 'align-content',
    'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-self'
  ],
  effects: [
    'box-shadow', 'filter', 'transform', 'transition', 'animation',
    'backdrop-filter', 'clip-path'
  ]
};

export default function CSSProEditor() {
  // Función auxiliar para parsear valores de spacing
  const parseSpacingValue = (value: string) => {
    const match = value.match(/^(-?\d*\.?\d+)(.*)$/);
    return match ? { value: parseFloat(match[1]), unit: match[2] || 'px' } : { value: 0, unit: 'px' };
  };

  // Estados
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [sections, setSections] = useState<PropertySection[]>([]);
  const [elementInfo, setElementInfo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'html' | 'chat'>('design');
  const [selectedMedia, setSelectedMedia] = useState('Auto - screen and (min-width: 1024px)');
  const [selectedState, setSelectedState] = useState('None');
  const [editableValues, setEditableValues] = useState({
    width: 'auto',
    height: 'auto',
    borderRadius: '0px'
  });
  const [spacingValues, setSpacingValues] = useState({
    marginTop: { value: 0, unit: 'px' },
    marginRight: { value: 0, unit: 'px' }, 
    marginBottom: { value: 0, unit: 'px' },
    marginLeft: { value: 0, unit: 'px' },
    paddingTop: { value: 0, unit: 'px' },
    paddingRight: { value: 0, unit: 'px' },
    paddingBottom: { value: 0, unit: 'px' },
    paddingLeft: { value: 0, unit: 'px' }
  });
  const [typographyValues, setTypographyValues] = useState({
    fontFamily: 'CerebriSans, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '400',
    fontSize: { value: 22, unit: 'px' },
    color: '#C0D0D7',
    lineHeight: '1.5',
    textAlign: 'left',
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    useBackgroundAsTextColor: false
  });
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, value: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Crear overlay para resaltar elemento seleccionado
  const createOverlay = useCallback(() => {
    if (overlayRef.current) return overlayRef.current;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 2px solid #4AEDFF;
      background: rgba(74, 237, 255, 0.1);
      z-index: 9998;
      transition: all 0.1s ease;
      display: none;
    `;
    document.body.appendChild(overlay);
    overlayRef.current = overlay;
    return overlay;
  }, []);

  // Actualizar posición del overlay
  const updateOverlay = useCallback((element: HTMLElement | null, isSelected: boolean = false) => {
    const overlay = createOverlay();
    if (!element) {
      overlay.style.display = 'none';
      return;
    }

    const rect = element.getBoundingClientRect();
    
    // Diferentes estilos para hover vs seleccionado
    const borderColor = isSelected ? '#4AEDFF' : '#4AEDFF';
    const backgroundColor = isSelected ? 'rgba(74, 237, 255, 0.15)' : 'rgba(74, 237, 255, 0.1)';
    const borderWidth = isSelected ? '2px' : '2px';
    
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: ${borderWidth} solid ${borderColor};
      background: ${backgroundColor};
      z-index: 9998;
      transition: all 0.1s ease;
      display: block;
      top: ${rect.top + window.scrollY}px;
      left: ${rect.left + window.scrollX}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      ${isSelected ? 'box-shadow: 0 0 0 1px rgba(74, 237, 255, 0.3);' : ''}
    `;
  }, [createOverlay]);

  // Obtener información del elemento
  const getElementInfo = useCallback((element: HTMLElement): string => {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    return `${tagName}${id}${classes}`;
  }, []);

  // Leer estilos computados y agrupar por categorías
  const readComputedStyles = useCallback((element: HTMLElement) => {
    const computedStyles = window.getComputedStyle(element);
    const newSections: PropertySection[] = [];

    Object.entries(CSS_CATEGORIES).forEach(([categoryKey, properties]) => {
      const categoryProperties: CSSProperty[] = [];
      
      properties.forEach(propName => {
        const value = computedStyles.getPropertyValue(propName);
        if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
          categoryProperties.push({
            name: propName,
            value: value,
            isDefault: false
          });
        }
      });

      if (categoryProperties.length > 0) {
        newSections.push({
          title: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
          properties: categoryProperties,
          expanded: categoryKey === 'spacing' || categoryKey === 'typography'
        });
      }
    });

    setSections(newSections);
  }, []);

  // Manejar click en elementos
  const handleElementClick = useCallback((event: MouseEvent) => {
    if (!isInspectorMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    
    // Ignorar clicks en el panel
    if (panelRef.current?.contains(target)) {
      return;
    }

    setSelectedElement(target);
    setElementInfo(getElementInfo(target));
    updateOverlay(target, true); // Marcar como seleccionado
    readComputedStyles(target);
    
    // Inicializar valores editables con los valores computados actuales
    const computedStyles = window.getComputedStyle(target);
    setEditableValues({
      width: computedStyles.width,
      height: computedStyles.height,
      borderRadius: computedStyles.borderRadius
    });
    
    // Inicializar valores de spacing
    setSpacingValues({
      marginTop: computedStyles.marginTop,
      marginRight: computedStyles.marginRight,
      marginBottom: computedStyles.marginBottom,
      marginLeft: computedStyles.marginLeft,
      paddingTop: computedStyles.paddingTop,
      paddingRight: computedStyles.paddingRight,
      paddingBottom: computedStyles.paddingBottom,
      paddingLeft: computedStyles.paddingLeft
    });
    
    // Desactivar el modo inspector después de seleccionar un elemento
    setIsInspectorMode(false);
    document.body.style.cursor = 'default';
  }, [isInspectorMode, getElementInfo, updateOverlay, readComputedStyles]);

  // Manejar hover en modo inspector
  const handleElementHover = useCallback((event: MouseEvent) => {
    if (!isInspectorMode) return;
    
    const target = event.target as HTMLElement;
    
    // Ignorar hover en el panel
    if (panelRef.current?.contains(target)) {
      return;
    }

    updateOverlay(target);
  }, [isInspectorMode, updateOverlay]);

  // Toggle modo inspector
  const toggleInspectorMode = useCallback(() => {
    setIsInspectorMode(prev => {
      const newMode = !prev;
      if (!newMode) {
        updateOverlay(null);
        setSelectedElement(null);
        setElementInfo('');
        setSections([]);
      }
      return newMode;
    });
  }, [updateOverlay]);

  // Toggle sección expandida/colapsada
  const toggleSection = useCallback((index: number) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, expanded: !section.expanded } : section
    ));
  }, []);

  // Aplicar cambio de propiedad
  const handlePropertyChange = useCallback((sectionIndex: number, propIndex: number, newValue: string) => {
    if (!selectedElement) return;
    
    const property = sections[sectionIndex].properties[propIndex];
    (selectedElement.style as any)[property.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = newValue;
    
    // Actualizar el estado
    setSections(prev => prev.map((section, sIndex) => 
      sIndex === sectionIndex ? {
        ...section,
        properties: section.properties.map((prop, pIndex) => 
          pIndex === propIndex ? { ...prop, value: newValue } : prop
        )
      } : section
    ));
  }, [selectedElement, sections]);

  // Funciones para manejar el arrastre de spacing
  const handleSpacingMouseDown = useCallback((property: string, event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(property);
    
    const currentValue = spacingValues[property as keyof typeof spacingValues]?.value || 0;
    setDragStart({ x: event.clientX, value: currentValue });
    
    document.body.style.cursor = 'ew-resize';
  }, [spacingValues]);

  const handleSpacingMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const deltaX = event.clientX - dragStart.x;
    const newValue = Math.max(0, dragStart.value + deltaX);
    const currentSpacing = spacingValues[isDragging as keyof typeof spacingValues];
    const unit = currentSpacing?.unit || 'px';
    const newValueWithUnit = `${newValue}${unit}`;
    
    // Actualizar el estado
    setSpacingValues(prev => ({
      ...prev,
      [isDragging]: { value: newValue, unit }
    }));
    
    // Aplicar al elemento
    (selectedElement.style as any)[isDragging] = newValueWithUnit;
  }, [isDragging, dragStart, selectedElement, spacingValues]);

  const handleSpacingMouseUp = useCallback(() => {
    setIsDragging(null);
    document.body.style.cursor = 'default';
  }, []);

  // Funciones para manejar cambios en spacing
  const handleSpacingValueChange = useCallback((property: string, newValue: number) => {
    if (!selectedElement) return;
    
    const currentSpacing = spacingValues[property as keyof typeof spacingValues];
    const unit = currentSpacing?.unit || 'px';
    const valueWithUnit = `${newValue}${unit}`;
    
    // Actualizar estado
    setSpacingValues(prev => ({
      ...prev,
      [property]: { value: newValue, unit }
    }));
    
    // Aplicar al elemento
    (selectedElement.style as any)[property] = valueWithUnit;
  }, [selectedElement, spacingValues]);

  const handleSpacingUnitChange = useCallback((property: string, newUnit: string) => {
    if (!selectedElement) return;
    
    const currentSpacing = spacingValues[property as keyof typeof spacingValues];
    const value = currentSpacing?.value || 0;
    const valueWithUnit = `${value}${newUnit}`;
    
    // Actualizar estado
    setSpacingValues(prev => ({
      ...prev,
      [property]: { value, unit: newUnit }
    }));
    
    // Aplicar al elemento
    (selectedElement.style as any)[property] = valueWithUnit;
  }, [selectedElement, spacingValues]);

  // Funciones para manejar cambios en tipografía
  const handleTypographyChange = useCallback((property: string, value: any) => {
    if (!selectedElement) return;
    
    // Actualizar estado
    setTypographyValues(prev => ({
      ...prev,
      [property]: value
    }));
    
    // Aplicar al elemento según el tipo de propiedad
    switch (property) {
      case 'fontFamily':
        selectedElement.style.fontFamily = value;
        break;
      case 'fontWeight':
        selectedElement.style.fontWeight = value;
        break;
      case 'fontSize':
        selectedElement.style.fontSize = typeof value === 'object' ? `${value.value}${value.unit}` : value;
        break;
      case 'color':
        selectedElement.style.color = value;
        break;
      case 'lineHeight':
        selectedElement.style.lineHeight = value;
        break;
      case 'textAlign':
        selectedElement.style.textAlign = value;
        break;
      case 'fontStyle':
        selectedElement.style.fontStyle = value;
        break;
      case 'textDecoration':
        selectedElement.style.textDecoration = value;
        break;
      case 'textTransform':
        selectedElement.style.textTransform = value;
        break;
      case 'letterSpacing':
        selectedElement.style.letterSpacing = value;
        break;
    }
  }, [selectedElement]);

  const handleFontSizeChange = useCallback((newValue: number) => {
    if (!selectedElement) return;
    
    const unit = typographyValues.fontSize.unit;
    const fontSize = { value: newValue, unit };
    
    setTypographyValues(prev => ({
      ...prev,
      fontSize
    }));
    
    selectedElement.style.fontSize = `${newValue}${unit}`;
  }, [selectedElement, typographyValues.fontSize.unit]);

  const handleFontSizeUnitChange = useCallback((newUnit: string) => {
    if (!selectedElement) return;
    
    const value = typographyValues.fontSize.value;
    const fontSize = { value, unit: newUnit };
    
    setTypographyValues(prev => ({
      ...prev,
      fontSize
    }));
    
    selectedElement.style.fontSize = `${value}${newUnit}`;
  }, [selectedElement, typographyValues.fontSize.value]);

  // Manejar Ctrl+Click para selección rápida cuando hay elemento seleccionado
  const handleQuickSelect = useCallback((event: MouseEvent) => {
    // Solo funciona si hay un elemento ya seleccionado y se presiona Ctrl/Cmd
    if (!selectedElement || (!event.ctrlKey && !event.metaKey)) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    
    // Ignorar clicks en el panel
    if (panelRef.current?.contains(target)) {
      return;
    }

    // Seleccionar nuevo elemento
    setSelectedElement(target);
    setElementInfo(getElementInfo(target));
    updateOverlay(target, true);
    readComputedStyles(target);
    
    // Inicializar valores editables con los valores computados actuales
    const computedStyles = window.getComputedStyle(target);
    setEditableValues({
      width: computedStyles.width,
      height: computedStyles.height,
      borderRadius: computedStyles.borderRadius
    });
    
    // Inicializar valores de spacing
    setSpacingValues({
      marginTop: computedStyles.marginTop,
      marginRight: computedStyles.marginRight,
      marginBottom: computedStyles.marginBottom,
      marginLeft: computedStyles.marginLeft,
      paddingTop: computedStyles.paddingTop,
      paddingRight: computedStyles.paddingRight,
      paddingBottom: computedStyles.paddingBottom,
      paddingLeft: computedStyles.paddingLeft
    });
  }, [selectedElement, getElementInfo, updateOverlay, readComputedStyles]);

  // Efectos
  useEffect(() => {
    if (isInspectorMode) {
      document.addEventListener('click', handleElementClick, true);
      document.addEventListener('mouseover', handleElementHover, true);
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('click', handleElementClick, true);
      document.removeEventListener('mouseover', handleElementHover, true);
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('click', handleElementClick, true);
      document.removeEventListener('mouseover', handleElementHover, true);
      document.body.style.cursor = 'default';
    };
  }, [isInspectorMode, handleElementClick, handleElementHover]);

  // Efecto para Ctrl+Click cuando hay elemento seleccionado
  useEffect(() => {
    if (selectedElement) {
      document.addEventListener('click', handleQuickSelect, true);
      return () => {
        document.removeEventListener('click', handleQuickSelect, true);
      };
    }
  }, [selectedElement, handleQuickSelect]);

  // Efectos para el arrastre de spacing
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleSpacingMouseMove);
      document.addEventListener('mouseup', handleSpacingMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleSpacingMouseMove);
        document.removeEventListener('mouseup', handleSpacingMouseUp);
      };
    }
  }, [isDragging, handleSpacingMouseMove, handleSpacingMouseUp]);

  // Mantener el overlay actualizado para el elemento seleccionado
  useEffect(() => {
    if (!selectedElement) return;

    const updateSelectedOverlay = () => {
      updateOverlay(selectedElement, true);
    };

    // Actualizar overlay cuando cambie el tamaño de la ventana
    window.addEventListener('resize', updateSelectedOverlay);
    window.addEventListener('scroll', updateSelectedOverlay);

    // Observer para cambios en el elemento
    const resizeObserver = new ResizeObserver(updateSelectedOverlay);
    resizeObserver.observe(selectedElement);

    // Actualizar overlay inicialmente
    updateSelectedOverlay();

    return () => {
      window.removeEventListener('resize', updateSelectedOverlay);
      window.removeEventListener('scroll', updateSelectedOverlay);
      resizeObserver.disconnect();
    };
  }, [selectedElement, updateOverlay]);

  // Cleanup overlay al desmontar
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
      }
    };
  }, []);

  // Generar CSS code
  const generateCSS = useCallback(() => {
    if (!selectedElement || sections.length === 0) return '';
    
    const selector = elementInfo || 'element';
    let css = `${selector} {\n`;
    
    sections.forEach(section => {
      if (section.expanded && section.properties.length > 0) {
        css += `  /* ${section.title} */\n`;
        section.properties.forEach(prop => {
          css += `  ${prop.name}: ${prop.value};\n`;
        });
        css += `\n`;
      }
    });
    
    css += '}';
    return css;
  }, [selectedElement, sections, elementInfo]);

  return (
    <>
      {/* Panel lateral */}
      <div 
        ref={panelRef}
        className="fixed top-0 right-0 w-96 h-full bg-gray-800 border-l border-gray-700 text-white font-sans z-[9999] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          {selectedElement ? (
            <>
              {/* Element Header with actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {selectedElement.tagName.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Copy element"
                  >
                    <Copy size={14} className="text-gray-400" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Expand element"
                  >
                    <Eye size={14} className="text-gray-400" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Delete element"
                  >
                    <Trash2 size={14} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedElement(null);
                      setElementInfo('');
                      setSections([]);
                      updateOverlay(null);
                    }}
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Close inspector"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Element dimensions */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-gray-400">
                  <div className="w-3 h-3 border border-gray-500"></div>
                  <span className="text-xs">
                    {Math.round(selectedElement.getBoundingClientRect().width)}×{Math.round(selectedElement.getBoundingClientRect().height)}
                  </span>
                </div>
              </div>

              {/* Font info */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="text-xs">A</span>
                  <span className="text-xs underline">
                    {window.getComputedStyle(selectedElement).fontFamily.split(',')[0].replace(/['"]/g, '')} {window.getComputedStyle(selectedElement).fontSize}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                {[
                  { key: 'design', label: 'Design' },
                  { key: 'code', label: 'Code' },
                  { key: 'html', label: 'HTML' },
                  { key: 'chat', label: 'Chat', isNew: true }
                ].map(({ key, label, isNew }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`px-3 py-1 text-xs rounded-t transition-colors relative ${
                      activeTab === key 
                        ? 'bg-gray-700 text-white border-b-2 border-blue-500' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {label}
                    {isNew && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">
                        NEW
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Default header when no element selected */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">CSS Pro Inspector</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={toggleInspectorMode}
                    className={`p-2 rounded transition-colors ${
                      isInspectorMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                    title="Toggle Inspector Mode"
                  >
                    <Target size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedElement ? (
            <div className="p-4 text-center text-gray-400">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-2">Click the inspector button and select any element to view its CSS properties.</p>
              <p className="text-xs">Inspector mode: {isInspectorMode ? 'ON' : 'OFF'}</p>
            </div>
          ) : (
            <div className="p-4">
              {activeTab === 'design' ? (
                <div className="space-y-4">
                  {/* Media Queries Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500"></div>
                      </div>
                      <span className="text-xs">Media:</span>
                    </div>
                    <select 
                      value={selectedMedia}
                      onChange={(e) => setSelectedMedia(e.target.value)}
                      className="w-full bg-gray-700 text-pink-400 px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Auto - screen and (min-width: 1024px)">Auto - screen and (min-width: 1024px)</option>
                      <option value="Mobile - screen and (max-width: 768px)">Mobile - screen and (max-width: 768px)</option>
                      <option value="Tablet - screen and (max-width: 1024px)">Tablet - screen and (max-width: 1024px)</option>
                      <option value="Desktop - screen and (min-width: 1200px)">Desktop - screen and (min-width: 1200px)</option>
                    </select>
                  </div>

                  {/* State/Pseudo Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                      <span className="text-xs">State or pseudo</span>
                    </div>
                    <select 
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-gray-700 text-green-400 px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="None">None</option>
                      <option value="hover">:hover</option>
                      <option value="active">:active</option>
                      <option value="focus">:focus</option>
                      <option value="visited">:visited</option>
                      <option value="first-child">:first-child</option>
                      <option value="last-child">:last-child</option>
                      <option value="before">::before</option>
                      <option value="after">::after</option>
                    </select>
                  </div>

                  {/* Position and Transform Controls */}
                  <div className="space-y-3 bg-gray-750 p-3 rounded border border-gray-600">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {/* Position X */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">X</span>
                          <span className="text-gray-500">{selectedElement ? Math.round(selectedElement.getBoundingClientRect().left) : 0}</span>
                        </div>
                      </div>
                      
                      {/* Position Y */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Y</span>
                          <span className="text-gray-500">{selectedElement ? Math.round(selectedElement.getBoundingClientRect().top) : 0}</span>
                        </div>
                      </div>

                      {/* Rotation */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">↻</span>
                          <span className="text-gray-500">
                            {selectedElement ? 
                              (window.getComputedStyle(selectedElement).transform !== 'none' ? 
                                window.getComputedStyle(selectedElement).transform : '0°') 
                              : '0°'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Width, Height, Border-radius */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {/* Width */}
                      <div className="space-y-1">
                        <label className="text-gray-400">W</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={editableValues.width}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditableValues(prev => ({ ...prev, width: newValue }));
                              if (selectedElement) {
                                selectedElement.style.width = newValue;
                              }
                            }}
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:border-green-500 focus:outline-none"
                            placeholder="auto"
                          />
                        </div>
                      </div>

                      {/* Height */}
                      <div className="space-y-1">
                        <label className="text-gray-400">H</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={editableValues.height}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditableValues(prev => ({ ...prev, height: newValue }));
                              if (selectedElement) {
                                selectedElement.style.height = newValue;
                              }
                            }}
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:border-green-500 focus:outline-none"
                            placeholder="auto"
                          />
                        </div>
                      </div>

                      {/* Border Radius */}
                      <div className="space-y-1">
                        <label className="text-gray-400">⟲</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={editableValues.borderRadius}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditableValues(prev => ({ ...prev, borderRadius: newValue }));
                              if (selectedElement) {
                                selectedElement.style.borderRadius = newValue;
                              }
                            }}
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:border-green-500 focus:outline-none"
                            placeholder="0px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CSS Pro Style Spacing Visualizer */}
                  <div className={`${styles.cssProVisualSpacingBox} ${styles.cssProVisualAccordionContent} css-pro-visual-spacing-box`}>
                    {/* Margin container */}
                    <div className="css-pro-visual-spacing-placeholder horizontal top"></div>
                    <div className="css-pro-visual-spacing-placeholder horizontal bottom"></div>
                    <div className='css-pro-visual-spacing-placeholder vertical left'></div>
                    <div className='css-pro-visual-spacing-placeholder vertical right'></div>
                    <div className="bg-gray-900 p-6 rounded ">
                      
                      {/* Margin Top */}
                      <label data-css-pro-edit-rule="margin-top" onMouseDown={(e) => handleSpacingMouseDown('marginTop', e)} data-css-pro-input className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center">
                        <span 
                          className="cursor-ns-resize text-gray-400 hover:text-white mr-1 text-xs"
                          
                          title="Click and drag to change margin-top"
                        >
                          ⇕
                        </span>
                        <input
                          type="number"
                          value={spacingValues.marginTop?.value || 0}
                          onChange={(e) => handleSpacingValueChange('marginTop', parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                          style={{ width: `${Math.max(2, String(spacingValues.marginTop?.value || 0).length)}ch` }}
                        />
                        <select
                          value={spacingValues.marginTop?.unit || 'px'}
                          onChange={(e) => handleSpacingUnitChange('marginTop', e.target.value)}
                          className="bg-gray-700 text-white text-xs border-none outline-none ml-1"
                        >
                          <option value="auto">auto</option>
                          <option value="px">px</option>
                          <option value="%">%</option>
                          <option value="em">em</option>
                          <option value="rem">rem</option>
                          <option value="vw">vw</option>
                          <option value="vh">vh</option>
                        </select>
                      </label>

                      {/* Margin Bottom */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center">
                        <span 
                          className="cursor-ns-resize text-gray-400 hover:text-white mr-1 text-xs"
                          onMouseDown={(e) => handleSpacingMouseDown('marginBottom', e)}
                          title="Click and drag to change margin-bottom"
                        >
                          ⇕
                        </span>
                        <input
                          type="number"
                          value={spacingValues.marginBottom?.value || 0}
                          onChange={(e) => handleSpacingValueChange('marginBottom', parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                          style={{ width: `${Math.max(2, String(spacingValues.marginBottom?.value || 0).length)}ch` }}
                        />
                        <select
                          value={spacingValues.marginBottom?.unit || 'px'}
                          onChange={(e) => handleSpacingUnitChange('marginBottom', e.target.value)}
                          className="bg-gray-700 text-white text-xs border-none outline-none ml-1"
                        >
                          <option value="auto">auto</option>
                          <option value="px">px</option>
                          <option value="%">%</option>
                          <option value="em">em</option>
                          <option value="rem">rem</option>
                          <option value="vw">vw</option>
                          <option value="vh">vh</option>
                        </select>
                      </div>

                      {/* Margin Left */}
                      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 -rotate-90 origin-center">
                        <div className="flex items-center">
                          <span 
                            className="cursor-ew-resize text-gray-400 hover:text-white mr-1 text-xs"
                            onMouseDown={(e) => handleSpacingMouseDown('marginLeft', e)}
                            title="Click and drag to change margin-left"
                          >
                            ⇔
                          </span>
                          <input
                            type="number"
                            value={spacingValues.marginLeft?.value || 0}
                            onChange={(e) => handleSpacingValueChange('marginLeft', parseFloat(e.target.value) || 0)}
                            className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                            style={{ width: `${Math.max(2, String(spacingValues.marginLeft?.value || 0).length)}ch` }}
                          />
                          <select
                            value={spacingValues.marginLeft?.unit || 'px'}
                            onChange={(e) => handleSpacingUnitChange('marginLeft', e.target.value)}
                            className="bg-gray-700 text-white text-xs border-none outline-none ml-1"
                          >
                            <option value="auto">auto</option>
                            <option value="px">px</option>
                            <option value="%">%</option>
                            <option value="em">em</option>
                            <option value="rem">rem</option>
                            <option value="vw">vw</option>
                            <option value="vh">vh</option>
                          </select>
                        </div>
                      </div>

                      {/* Margin Right */}
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 rotate-90 origin-center">
                        <div className="flex items-center">
                          <span 
                            className="cursor-ew-resize text-gray-400 hover:text-white mr-1 text-xs"
                            onMouseDown={(e) => handleSpacingMouseDown('marginRight', e)}
                            title="Click and drag to change margin-right"
                          >
                            ⇔
                          </span>
                          <input
                            type="number"
                            value={spacingValues.marginRight?.value || 0}
                            onChange={(e) => handleSpacingValueChange('marginRight', parseFloat(e.target.value) || 0)}
                            className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                            style={{ width: `${Math.max(2, String(spacingValues.marginRight?.value || 0).length)}ch` }}
                          />
                          <select
                            value={spacingValues.marginRight?.unit || 'px'}
                            onChange={(e) => handleSpacingUnitChange('marginRight', e.target.value)}
                            className="bg-gray-700 text-white text-xs border-none outline-none ml-1"
                          >
                            <option value="auto">auto</option>
                            <option value="px">px</option>
                            <option value="%">%</option>
                            <option value="em">em</option>
                            <option value="rem">rem</option>
                            <option value="vw">vw</option>
                            <option value="vh">vh</option>
                          </select>
                        </div>
                      </div>

                      {/* Padding container */}
                      <div className="bg-gray-700 p-6 m-8 rounded relative border border-gray-600">
                        
                        {/* Padding Top */}
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center">
                          <span 
                            className="cursor-ns-resize text-gray-400 hover:text-white mr-1 text-xs"
                            onMouseDown={(e) => handleSpacingMouseDown('paddingTop', e)}
                            title="Click and drag to change padding-top"
                          >
                            ⇕
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={spacingValues.paddingTop?.value || 0}
                            onChange={(e) => handleSpacingValueChange('paddingTop', parseFloat(e.target.value) || 0)}
                            className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                            style={{ width: `${Math.max(2, String(spacingValues.paddingTop?.value || 0).length)}ch` }}
                          />
                          <select
                            value={spacingValues.paddingTop?.unit || 'px'}
                            onChange={(e) => handleSpacingUnitChange('paddingTop', e.target.value)}
                            className="bg-gray-600 text-white text-xs border-none outline-none ml-1"
                          >
                            <option value="px">px</option>
                            <option value="%">%</option>
                            <option value="em">em</option>
                            <option value="rem">rem</option>
                            <option value="vw">vw</option>
                            <option value="vh">vh</option>
                          </select>
                        </div>

                        {/* Padding Bottom */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center">
                          <span 
                            className="cursor-ns-resize text-gray-400 hover:text-white mr-1 text-xs"
                            onMouseDown={(e) => handleSpacingMouseDown('paddingBottom', e)}
                            title="Click and drag to change padding-bottom"
                          >
                            ⇕
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={spacingValues.paddingBottom?.value || 0}
                            onChange={(e) => handleSpacingValueChange('paddingBottom', parseFloat(e.target.value) || 0)}
                            className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                            style={{ width: `${Math.max(2, String(spacingValues.paddingBottom?.value || 0).length)}ch` }}
                          />
                          <select
                            value={spacingValues.paddingBottom?.unit || 'px'}
                            onChange={(e) => handleSpacingUnitChange('paddingBottom', e.target.value)}
                            className="bg-gray-600 text-white text-xs border-none outline-none ml-1"
                          >
                            <option value="px">px</option>
                            <option value="%">%</option>
                            <option value="em">em</option>
                            <option value="rem">rem</option>
                            <option value="vw">vw</option>
                            <option value="vh">vh</option>
                          </select>
                        </div>

                        {/* Padding Left */}
                        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 -rotate-90 origin-center">
                          <div className="flex items-center">
                            <span 
                              className="cursor-ew-resize text-gray-400 hover:text-white mr-1 text-xs"
                              onMouseDown={(e) => handleSpacingMouseDown('paddingLeft', e)}
                              title="Click and drag to change padding-left"
                            >
                              ⇔
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={spacingValues.paddingLeft?.value || 0}
                              onChange={(e) => handleSpacingValueChange('paddingLeft', parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                              style={{ width: `${Math.max(2, String(spacingValues.paddingLeft?.value || 0).length)}ch` }}
                            />
                            <select
                              value={spacingValues.paddingLeft?.unit || 'px'}
                              onChange={(e) => handleSpacingUnitChange('paddingLeft', e.target.value)}
                              className="bg-gray-600 text-white text-xs border-none outline-none ml-1"
                            >
                              <option value="px">px</option>
                              <option value="%">%</option>
                              <option value="em">em</option>
                              <option value="rem">rem</option>
                              <option value="vw">vw</option>
                              <option value="vh">vh</option>
                            </select>
                          </div>
                        </div>

                        {/* Padding Right */}
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 rotate-90 origin-center">
                          <div className="flex items-center">
                            <span 
                              className="cursor-ew-resize text-gray-400 hover:text-white mr-1 text-xs"
                              onMouseDown={(e) => handleSpacingMouseDown('paddingRight', e)}
                              title="Click and drag to change padding-right"
                            >
                              ⇔
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={spacingValues.paddingRight?.value || 0}
                              onChange={(e) => handleSpacingValueChange('paddingRight', parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-white text-xs w-8 text-center border-none outline-none"
                              style={{ width: `${Math.max(2, String(spacingValues.paddingRight?.value || 0).length)}ch` }}
                            />
                            <select
                              value={spacingValues.paddingRight?.unit || 'px'}
                              onChange={(e) => handleSpacingUnitChange('paddingRight', e.target.value)}
                              className="bg-gray-600 text-white text-xs border-none outline-none ml-1"
                            >
                              <option value="px">px</option>
                              <option value="%">%</option>
                              <option value="em">em</option>
                              <option value="rem">rem</option>
                              <option value="vw">vw</option>
                              <option value="vh">vh</option>
                            </select>
                          </div>
                        </div>

                        {/* Element center */}
                        <div className="bg-gray-600 p-8 rounded text-center border border-gray-500 min-h-[80px] flex flex-col justify-center">
                          <div className="text-xs text-gray-300 mb-1 font-medium">
                            {selectedElement?.tagName.toLowerCase() || 'element'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {editableValues.width} × {editableValues.height}
                          </div>
                        </div>

                        {/* Padding label */}
                        <span className="absolute top-1 left-2 text-xs text-gray-400 font-medium">Padding</span>
                        {/* Margin label */}
                        <span className="absolute top-1 left-2 text-xs text-gray-400 font-medium">Margin</span>
                      </div>
                    </div>
                  ) : section.title === 'Typography' ? (
                    /* CSS Pro Style Typography Panel */
                    <div className="space-y-4">
                      {/* Font Family Selector */}
                      <div className="space-y-2">
                        <select
                          value={typographyValues.fontFamily}
                          onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="CerebriSans, -apple-system, BlinkMacSystemFont, sans-serif">CerebriSans, -apple-system, Blink...</option>
                          <option value="Cambria, serif">Cambria</option>
                          <option value="Cambria Math, serif">Cambria Math</option>
                          <option value="Candara, sans-serif">Candara</option>
                          <option value="CerebriSans, sans-serif">CerebriSans</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Helvetica, sans-serif">Helvetica</option>
                          <option value="Times New Roman, serif">Times New Roman</option>
                          <option value="Courier New, monospace">Courier New</option>
                          <option value="Verdana, sans-serif">Verdana</option>
                        </select>
                      </div>

                      {/* Font Weight and Size Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Font Weight */}
                        <div className="space-y-1">
                          <select
                            value={typographyValues.fontWeight}
                            onChange={(e) => handleTypographyChange('fontWeight', e.target.value)}
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

                        {/* Font Size */}
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">Aa</span>
                          <input
                            type="number"
                            value={typographyValues.fontSize.value}
                            onChange={(e) => handleFontSizeChange(parseFloat(e.target.value) || 0)}
                            className="flex-1 bg-gray-700 text-white px-2 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none text-center"
                            min="1"
                          />
                          <select
                            value={typographyValues.fontSize.unit}
                            onChange={(e) => handleFontSizeUnitChange(e.target.value)}
                            className="bg-gray-700 text-white px-2 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="px">px</option>
                            <option value="em">em</option>
                            <option value="rem">rem</option>
                            <option value="%">%</option>
                            <option value="pt">pt</option>
                          </select>
                        </div>
                      </div>

                      {/* Color and Line Height Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Color Picker */}
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-600 cursor-pointer flex items-center justify-center"
                            style={{ backgroundColor: typographyValues.color }}
                            onClick={() => {
                              // Color picker functionality would go here
                              const newColor = prompt('Enter color (hex, rgb, etc.):', typographyValues.color);
                              if (newColor) handleTypographyChange('color', newColor);
                            }}
                          >
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: typographyValues.color }}></div>
                          </div>
                          <input
                            type="text"
                            value={typographyValues.color}
                            onChange={(e) => handleTypographyChange('color', e.target.value)}
                            className="flex-1 bg-gray-700 text-white px-2 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="#C0D0D7"
                          />
                        </div>

                        {/* Line Height */}
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">|A|</span>
                          <input
                            type="number"
                            value={parseFloat(typographyValues.lineHeight)}
                            onChange={(e) => handleTypographyChange('lineHeight', e.target.value)}
                            className="flex-1 bg-gray-700 text-white px-2 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none text-center"
                            min="0.5"
                            max="3"
                            step="0.1"
                          />
                          <span className="text-gray-400 text-sm">-</span>
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTypographyChange('textAlign', 'left')}
                          className={`p-2 rounded text-sm border ${typographyValues.textAlign === 'left' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          <span className="block w-4 h-3 bg-current opacity-75" style={{clipPath: 'polygon(0 0, 70% 0, 70% 33%, 0 33%, 0 66%, 100% 66%, 100% 100%, 0 100%)'}}></span>
                        </button>
                        <button
                          onClick={() => handleTypographyChange('textAlign', 'center')}
                          className={`p-2 rounded text-sm border ${typographyValues.textAlign === 'center' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          <span className="block w-4 h-3 bg-current opacity-75" style={{clipPath: 'polygon(15% 0, 85% 0, 85% 33%, 15% 33%, 15% 66%, 85% 66%, 85% 100%, 15% 100%)'}}></span>
                        </button>
                        <button
                          onClick={() => handleTypographyChange('textAlign', 'right')}
                          className={`p-2 rounded text-sm border ${typographyValues.textAlign === 'right' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          <span className="block w-4 h-3 bg-current opacity-75" style={{clipPath: 'polygon(30% 0, 100% 0, 100% 33%, 30% 33%, 30% 66%, 100% 66%, 100% 100%, 0 100%, 0 66%, 30% 66%)'}}></span>
                        </button>
                        <button
                          onClick={() => handleTypographyChange('textAlign', 'justify')}
                          className={`p-2 rounded text-sm border ${typographyValues.textAlign === 'justify' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          <span className="block w-4 h-3 bg-current opacity-75" style={{clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%, 0 66%, 100% 66%, 100% 100%, 0 100%)'}}></span>
                        </button>
                        
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">|A|</span>
                          <span className="text-white text-sm">normal</span>
                        </div>
                      </div>

                      {/* Text Decorations */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTypographyChange('fontWeight', typographyValues.fontWeight === '700' ? '400' : '700')}
                          className={`p-2 rounded text-sm border font-bold ${typographyValues.fontWeight === '700' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          B
                        </button>
                        <button
                          onClick={() => handleTypographyChange('fontStyle', typographyValues.fontStyle === 'italic' ? 'normal' : 'italic')}
                          className={`p-2 rounded text-sm border italic ${typographyValues.fontStyle === 'italic' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          I
                        </button>
                        <button
                          onClick={() => handleTypographyChange('textDecoration', typographyValues.textDecoration === 'underline' ? 'none' : 'underline')}
                          className={`p-2 rounded text-sm border underline ${typographyValues.textDecoration === 'underline' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          U
                        </button>
                        <button
                          onClick={() => handleTypographyChange('textDecoration', typographyValues.textDecoration === 'line-through' ? 'none' : 'line-through')}
                          className={`p-2 rounded text-sm border line-through ${typographyValues.textDecoration === 'line-through' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                        >
                          S
                        </button>
                      </div>

                      {/* Use background as text color */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="useBackgroundAsTextColor"
                          checked={typographyValues.useBackgroundAsTextColor}
                          onChange={(e) => handleTypographyChange('useBackgroundAsTextColor', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="useBackgroundAsTextColor" className="text-sm text-gray-300">
                          Use background as text color
                        </label>
                      </div>
                    </div>
                  ) : (
                    // Default property rendering for other sections
                    <div className="space-y-2">
                      {section.properties.map((property) => (
                        <div key={property.name} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{property.name}</span>
                          <input
                            type="text"
                            value={editableValues[property.name as keyof typeof editableValues] || property.value}
                            onChange={(e) => handleValueChange(property.name, e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded text-sm w-24 border border-gray-600 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Tab */}
              {activeTab === 'code' && (
                <div className="p-4">
                  <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-auto max-h-96">
                    <code>{generateCSS()}</code>
                  </pre>
                </div>
              )}

              {/* HTML Tab */}
              {activeTab === 'html' && (
                <div className="p-4">
                  <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-auto max-h-96">
                    <code>{selectedElement?.outerHTML}</code>
                  </pre>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="p-4">
                  <div className="text-center text-gray-400">
                    AI Chat feature coming soon...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inspector mode cursor and overlay */}
      {(isInspectorMode || selectedElement) && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            cursor: isInspectorMode ? 'crosshair' : 'default'
          }}
        />
      )}
    </div>
  );
};
                        <Copy size={12} className="text-gray-400" />
                      </button>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                      {generateCSS()}
                    </pre>
                  </div>
                </div>
              ) : activeTab === 'html' ? (
                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-400">HTML Structure</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedElement?.outerHTML || '')}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Copy HTML"
                      >
                        <Copy size={12} className="text-gray-400" />
                      </button>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                      {selectedElement?.outerHTML}
                    </pre>
                  </div>
                </div>
              ) : activeTab === 'chat' ? (
                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-400">AI Chat</span>
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">NEW</span>
                    </div>
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-2xl mb-2">🤖</div>
                      <p className="text-sm">AI Chat feature coming soon!</p>
                      <p className="text-xs mt-2">Ask questions about this element's styling</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      {/* Instrucciones flotantes */}
      {isInspectorMode && !selectedElement && (
        <div className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9997] text-sm">
          🎯 Inspector Mode: Click any element to inspect its CSS
        </div>
      )}
      
      {/* Indicador de Ctrl+Click cuando hay elemento seleccionado */}
      {selectedElement && !isInspectorMode && (
        <div className="fixed top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9997] text-sm">
          💡 Hold <kbd className="bg-green-700 px-1 rounded">Ctrl</kbd> + Click to select another element
        </div>
      )}
    </>
  );
};