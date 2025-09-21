import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, Eye, Copy, X, Target, Code, Palette, Settings, Trash2, Plus as PlusIcon, Minus as MinusIcon } from 'lucide-react';

import { IconBackground, IconBorderSides, IconCarouselVertical, IconTiltShift, IconBoxPadding, IconWashDryShade,IconStackFront, IconSquareRounded, IconMaximize, IconReplace } from '@tabler/icons-react';


import svgLogo from '../assets/logo.svg';
import LogoApp from '../components/LogoApp';

import styles from "../components/Csspro.module.css";
import  "../components/Csspro.css";
import {  
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import ReusableNumberField from '../components/ui/input-plus-minus';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';

import Typography from '../components/Typography/Typography';
import Background, { BackgroundLayer } from '../components/Background/Background';
import Filters, { FiltersValues } from '../components/Filters/Filters';
import Shadows, { ShadowsValues } from '../components/Shadows/Shadows';
import BoxShadows from '../components/BoxShadows/BoxShadows';
import Positioning, { PositioningValues } from '../components/Positioning/Positioning';
import Border, { BorderValues } from '../components/Border/Border';
import Display, { DisplayValues } from '../components/Display/Display';
import CustomPickColor from '../components/ui/CustomPickColor';
import Dock from '../components/Dock/Dock';
import { DotPattern } from '../components/dot-parttern';
import { cn } from "@clarity/utils/cn"
// ... (rest of the code remains the same)



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
    width: { value: 'auto', unit: 'px' },
    height: { value: 'auto', unit: 'px' },
    borderRadius: { value: '0', unit: 'px' },
    rotate: { value: '0', unit: 'deg' }
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
    fontFamily: 'Arial, sans-serif',
    fontWeight: '400',
    fontSize: { value: 16, unit: 'px' },
    color: '#000000',
    lineHeight: '1.5',
    textAlign: 'left',
    textDecoration: {
      underline: false,
      overline: false,
      lineThrough: false
    },
    fontStyle: 'normal',
    useBackgroundAsText: false
  });
  const [backgroundValues, setBackgroundValues] = useState<BackgroundLayer[]>([]);
  const [filtersValues, setFiltersValues] = useState<FiltersValues>({
    blur: 0,
    contrast: 1,
    brightness: 1,
    saturate: 1,
    invert: 0,
    grayscale: 0,
    sepia: 0,
  });

  const applyFiltersToSelected = useCallback((vals: FiltersValues) => {
    if (!selectedElement) return;
    const parts: string[] = [];
    parts.push(`blur(${vals.blur}px)`);
    parts.push(`contrast(${vals.contrast})`);
    parts.push(`brightness(${vals.brightness})`);
    parts.push(`saturate(${vals.saturate})`);
    parts.push(`invert(${vals.invert}%)`);
    parts.push(`grayscale(${vals.grayscale}%)`);
    parts.push(`sepia(${vals.sepia}%)`);
    const filterValue = parts.join(' ');
    selectedElement.style.setProperty('filter', filterValue, 'important');
  }, [selectedElement]);

  const handleFiltersChange = useCallback((property: keyof FiltersValues, value: number) => {
    setFiltersValues(prev => {
      const next = { ...prev, [property]: value } as FiltersValues;
      applyFiltersToSelected(next);
      return next;
    });
  }, [applyFiltersToSelected]);
  const [shadowsValues, setShadowsValues] = useState<{ layers: { offsetX: number; offsetY: number; blur: number; color: string; }[] }>({
    layers: [{ offsetX: 1, offsetY: 2, blur: 3, color: 'rgba(0,0,0,0.35)' }],
  });
  const applyTextShadowsToSelected = useCallback((vals: { layers: { offsetX: number; offsetY: number; blur: number; color: string; }[] }) => {
    if (!selectedElement) return;
    const css = vals.layers.map(l => `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.color}`).join(', ');
    selectedElement.style.setProperty('text-shadow', css || 'none', 'important');
  }, [selectedElement]);
  const handleShadowsChange = useCallback((next: { layers: { offsetX: number; offsetY: number; blur: number; color: string; }[] }) => {
    setShadowsValues(next);
    applyTextShadowsToSelected(next);
  }, [applyTextShadowsToSelected]);

  const [boxShadow, setBoxShadow] = useState<string>('none');
  const handleBoxShadowChange = useCallback((css: string) => {
    setBoxShadow(css);
    if (selectedElement) {
      selectedElement.style.setProperty('box-shadow', css, 'important');
    }
  }, [selectedElement]);

  const [positioning, setPositioning] = useState<PositioningValues>({
    position: 'static',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
  });
  const handlePositioningChange = useCallback((prop: keyof PositioningValues, value: string) => {
    setPositioning(prev => ({ ...prev, [prop]: value }));
    if (!selectedElement) return;
    if (prop === 'position') {
      selectedElement.style.setProperty('position', value, 'important');
    } else {
      selectedElement.style.setProperty(prop, value, 'important');
    }
  }, [selectedElement]);

  const [borderValues, setBorderValues] = useState<BorderValues>({
    color: '#c0d0d7',
    width: 1,
    unit: 'px',
    style: 'solid',
  });
  const handleBorderChange = useCallback((prop: keyof BorderValues, value: any) => {
    setBorderValues(prev => {
      const next = { ...prev, [prop]: value };
      if (selectedElement) {
        const css = `${next.width}${next.unit} ${next.style} ${next.color}`;
        selectedElement.style.setProperty('border', css, 'important');
      }
      return next;
    });
  }, [selectedElement]);

  const [displayValues, setDisplayValues] = useState<DisplayValues>({ display: 'block', opacity: 100 });
  const handleDisplayChange = useCallback((prop: keyof DisplayValues, value: any) => {
    setDisplayValues(prev => {
      const next = { ...prev, [prop]: value };
      if (selectedElement) {
        if (prop === 'display') {
          selectedElement.style.setProperty('display', next.display, 'important');
        } else if (prop === 'opacity') {
          selectedElement.style.setProperty('opacity', String(next.opacity / 100), 'important');
        }
      }
      return next;
    });
  }, [selectedElement]);
  const [panelPosition, setPanelPosition] = useState(() => {
    // Para top-left siempre debe ser 20px, 20px
    return { x: 20, y: 20 };
  });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [panelDragOffset, setPanelDragOffset] = useState({ x: 0, y: 0 });
  const dragPositionRef = useRef({ x: 0, y: 0 }); // Para posición en tiempo real sin re-renders
  const [panelSize, setPanelSize] = useState({ 
    width: 384, 
    height: typeof window !== 'undefined' ? window.innerHeight - 32 : 600 
  });
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, value: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Estado para la herramienta activa del dock
  const [activeDockTool, setActiveDockTool] = useState('inspector');
  
  // Estado para minimizar/expandir el panel
  const [isMinimized, setIsMinimized] = useState(true);
  
  // Estado para la posición del panel minimizado (4 esquinas)
  const [minimizedCorner, setMinimizedCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-left');

  // Función para obtener la posición según la esquina seleccionada (solo para el botón de cambio manual)
  const getMinimizedPosition = useCallback(() => {
    const margin = 60; // Margen para otras esquinas
    const topLeftMargin = 20; // Margen específico para top-left: SIEMPRE 20px
    const panelWidth = 128;
    const panelHeight = 32;

    switch (minimizedCorner) {
      case 'top-left':
        return { x: topLeftMargin, y: topLeftMargin }; // SIEMPRE left: 20px, top: 20px
      case 'top-right':
        return { x: window.innerWidth - panelWidth - margin, y: margin };
      case 'bottom-left':
        return { x: margin, y: window.innerHeight - panelHeight - margin };
      case 'bottom-right':
        return { x: window.innerWidth - panelWidth - margin, y: window.innerHeight - panelHeight - margin };
      default:
        return { x: topLeftMargin, y: topLeftMargin }; // Default también 20px
    }
  }, [minimizedCorner]);

  // Función para obtener la posición de expansión según la esquina
  const getExpandedPosition = useCallback(() => {
    const expandedWidth = 384;
    const expandedHeight = window.innerHeight - 32;
    const margin = 20;
    
    switch (minimizedCorner) {
      case 'top-left':
        // Expandir hacia abajo y derecha desde top-left
        return { x: margin, y: margin };
      case 'top-right':
        // Expandir hacia abajo y izquierda desde top-right
        return { x: window.innerWidth - expandedWidth - margin, y: margin };
      case 'bottom-left':
        // Expandir hacia arriba y derecha desde bottom-left
        return { x: margin, y: margin };
      case 'bottom-right':
        // Expandir hacia arriba y izquierda desde bottom-right
        return { x: window.innerWidth - expandedWidth - margin, y: margin };
      default:
        return { x: margin, y: margin };
    }
  }, [minimizedCorner]);

  // Función para cambiar a la siguiente esquina
  const cycleToNextCorner = useCallback(() => {
    const corners: Array<'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'> = 
      ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    const currentIndex = corners.indexOf(minimizedCorner);
    const nextIndex = (currentIndex + 1) % corners.length;
    setMinimizedCorner(corners[nextIndex]);
  }, [minimizedCorner]);

  // Actualizar el tamaño del panel después del montaje del componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPanelSize(prev => ({ ...prev, height: window.innerHeight - 32 }));
    }
  }, []);

  // Actualizar posición cuando cambia el estado de minimizado
  useEffect(() => {
    if (!isMinimized) {
      // Cuando se expande, ajustar posición según la esquina
      const newPosition = getExpandedPosition();
      setPanelPosition(newPosition);
    } else {
      // Cuando se minimiza, usar la posición de la esquina
      const newPosition = getMinimizedPosition();
      setPanelPosition(newPosition);
    }
  }, [isMinimized, minimizedCorner, getMinimizedPosition, getExpandedPosition]);

  // Listener para redimensionar ventana y actualizar posición
  useEffect(() => {
    const handleResize = () => {
      if (isMinimized) {
        const newPosition = getMinimizedPosition();
        setPanelPosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMinimized, getMinimizedPosition]);

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
    const parseValue = (cssValue: string) => {
      const match = cssValue.match(/^(\d*\.?\d+)(.*)$/);
      return match ? { value: match[1], unit: match[2] || 'px' } : { value: cssValue, unit: 'px' };
    };
    
    setEditableValues({
      width: parseValue(computedStyles.width),
      height: parseValue(computedStyles.height),
      borderRadius: parseValue(computedStyles.borderRadius),
      rotate: { value: '0', unit: 'deg' }
    });
    
    // Inicializar valores de spacing
    setSpacingValues({
      marginTop: parseSpacingValue(computedStyles.marginTop),
      marginRight: parseSpacingValue(computedStyles.marginRight),
      marginBottom: parseSpacingValue(computedStyles.marginBottom),
      marginLeft: parseSpacingValue(computedStyles.marginLeft),
      paddingTop: parseSpacingValue(computedStyles.paddingTop),
      paddingRight: parseSpacingValue(computedStyles.paddingRight),
      paddingBottom: parseSpacingValue(computedStyles.paddingBottom),
      paddingLeft: parseSpacingValue(computedStyles.paddingLeft)
    });
    
    // Inicializar valores de tipografía
    const fontSizeParsed = parseSpacingValue(computedStyles.fontSize);
    setTypographyValues({
      fontFamily: computedStyles.fontFamily,
      fontWeight: computedStyles.fontWeight,
      fontSize: fontSizeParsed,
      color: computedStyles.color,
      lineHeight: computedStyles.lineHeight,
      textAlign: computedStyles.textAlign,
      textDecoration: {
        underline: computedStyles.textDecoration.includes('underline'),
        overline: computedStyles.textDecoration.includes('overline'),
        lineThrough: computedStyles.textDecoration.includes('line-through')
      },
      fontStyle: computedStyles.fontStyle,
      useBackgroundAsText: computedStyles.backgroundClip === 'text'
    });
    
    // Inicializar valores de fondo (capas)
    const layers: BackgroundLayer[] = [];
    const bgImage = computedStyles.backgroundImage;
    const bgColor = computedStyles.backgroundColor;
    if (bgImage && bgImage !== 'none') {
      // extraer url("...") si existe
      const match = bgImage.match(/url\(["']?(.*?)["']?\)/);
      const url = match ? match[1] : '';
      layers.push({
        id: 'img-0',
        type: 'image',
        enabled: true,
        imageUrl: url,
        repeat: (computedStyles.backgroundRepeat as any) || 'no-repeat',
        size: (computedStyles.backgroundSize as any) || 'auto',
        position: (computedStyles.backgroundPosition as any) || 'center',
      });
    }
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      layers.push({ id: 'color-0', type: 'color', enabled: true, color: bgColor });
    }
    setBackgroundValues(layers);
    
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

  // Función para manejar el inicio del drag del panel
  const handlePanelDragStart = useCallback((e: React.MouseEvent) => {
    // Solo permitir drag desde el header o el drag handle, o cuando esté minimizado
    const target = e.target as HTMLElement;
    const isHeader = target.closest('.panel-header') || target.classList.contains('drag-handle');
    const isMinimizedPanel = target.closest('.minimized-panel');
    
    if (isHeader || isMinimizedPanel) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDraggingPanel(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        setPanelDragOffset({ x: offsetX, y: offsetY });
        dragPositionRef.current = { x: rect.left, y: rect.top };
      }
      
      // Optimizaciones para drag fluido
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      if (panelRef.current) {
        panelRef.current.style.pointerEvents = 'auto';
        panelRef.current.style.zIndex = '10000';
      }
    }
  }, []);

  // Función optimizada para manejar el movimiento del drag del panel
  const handlePanelDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingPanel || !panelRef.current) return;
    
    e.preventDefault();
    
    const newX = e.clientX - panelDragOffset.x;
    const newY = e.clientY - panelDragOffset.y;
    
    // Límites de la ventana según el estado del panel
    const panelWidth = isMinimized ? 128 : 400;
    const panelHeight = isMinimized ? 32 : 600;
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    // Actualizar posición directamente en el DOM para máxima fluidez
    dragPositionRef.current = { x: constrainedX, y: constrainedY };
    
    // CORREGIR: Usar left/top directamente en lugar de transform
    panelRef.current.style.left = `${constrainedX}px`;
    panelRef.current.style.top = `${constrainedY}px`;
    
  }, [isDraggingPanel, panelDragOffset, isMinimized]);

  // Función para terminar el drag del panel
  const handlePanelDragEnd = useCallback(() => {
    if (!isDraggingPanel) return;
    
    const finalX = dragPositionRef.current.x;
    const finalY = dragPositionRef.current.y;
    
    // Restaurar estilos del body
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
    document.body.style.pointerEvents = 'auto';
    
    if (panelRef.current) {
      panelRef.current.style.pointerEvents = 'auto';
      panelRef.current.style.zIndex = '9999';
      // CORREGIR: No necesitamos resetear transform ya que no lo usamos
    }
    
    // Si está minimizado, hacer snap a la esquina más cercana
    if (isMinimized) {
      const panelWidth = 128;
      const panelHeight = 32;
      const centerX = finalX + panelWidth / 2;
      const centerY = finalY + panelHeight / 2;
      const windowCenterX = window.innerWidth / 2;
      const windowCenterY = window.innerHeight / 2;
      
      const margin = 60; // Margen para otras esquinas
      const topLeftMargin = 20; // Margen específico para top-left
      let snapPosition = { x: finalX, y: finalY };
      let newCorner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = minimizedCorner;
      
      // Determinar cuadrante y posición de snap
      if (centerX < windowCenterX && centerY < windowCenterY) {
        snapPosition = { x: topLeftMargin, y: topLeftMargin };
        newCorner = 'top-left';
      } else if (centerX >= windowCenterX && centerY < windowCenterY) {
        snapPosition = { x: window.innerWidth - panelWidth - margin, y: margin };
        newCorner = 'top-right';
      } else if (centerX < windowCenterX && centerY >= windowCenterY) {
        snapPosition = { x: margin, y: window.innerHeight - panelHeight - margin };
        newCorner = 'bottom-left';
      } else {
        snapPosition = { x: window.innerWidth - panelWidth - margin, y: window.innerHeight - panelHeight - margin };
        newCorner = 'bottom-right';
      }
      
      // Actualizar estados finales
      setPanelPosition(snapPosition);
      setMinimizedCorner(newCorner);
    } else {
      // Para panel expandido, solo actualizar la posición final
      setPanelPosition({ x: finalX, y: finalY });
    }
    
    setIsDraggingPanel(false);
  }, [isDraggingPanel, isMinimized, minimizedCorner]);

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

  // Funciones para manejar tipografía
  const handleTypographyChange = useCallback((property: string, value: any) => {
    if (!selectedElement) return;
    
    setTypographyValues(prev => ({
      ...prev,
      [property]: value
    }));
    
    // Aplicar al elemento
    if (property === 'textDecoration') {
      const decorations = [];
      if (value.underline) decorations.push('underline');
      if (value.overline) decorations.push('overline');
      if (value.lineThrough) decorations.push('line-through');
      selectedElement.style.textDecoration = decorations.length > 0 ? decorations.join(' ') : 'none';
    } else if (property === 'fontSize') {
      selectedElement.style.fontSize = `${value.value}${value.unit}`;
    } else if (property === 'useBackgroundAsText') {
      if (value) {
        selectedElement.style.backgroundClip = 'text';
        selectedElement.style.webkitBackgroundClip = 'text';
        selectedElement.style.color = 'transparent';
      } else {
        selectedElement.style.backgroundClip = 'unset';
        selectedElement.style.webkitBackgroundClip = 'unset';
        selectedElement.style.color = typographyValues.color;
      }
    } else {
      (selectedElement.style as any)[property] = value;
    }
  }, [selectedElement, typographyValues.color]);

  const handleFontSizeChange = useCallback((value: number) => {
    if (!selectedElement) return;
    
    const newFontSize = { ...typographyValues.fontSize, value };
    setTypographyValues(prev => ({
      ...prev,
      fontSize: newFontSize
    }));
    
    selectedElement.style.fontSize = `${value}${newFontSize.unit}`;
  }, [selectedElement, typographyValues.fontSize]);

  const handleFontSizeUnitChange = useCallback((unit: string) => {
    if (!selectedElement) return;
    
    const newFontSize = { ...typographyValues.fontSize, unit };
    setTypographyValues(prev => ({
      ...prev,
      fontSize: newFontSize
    }));
    
    selectedElement.style.fontSize = `${newFontSize.value}${unit}`;
  }, [selectedElement, typographyValues.fontSize]);

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
      borderRadius: computedStyles.borderRadius,
      rotate: { value: '0', unit: 'deg' }
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

  // Efectos para el drag del panel
  useEffect(() => {
    if (isDraggingPanel) {
      document.addEventListener('mousemove', handlePanelDragMove);
      document.addEventListener('mouseup', handlePanelDragEnd);
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handlePanelDragMove);
        document.removeEventListener('mouseup', handlePanelDragEnd);
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDraggingPanel, handlePanelDragMove, handlePanelDragEnd]);

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

  const handleDockToolSelect = (toolId: string) => {
    setActiveDockTool(toolId);
    // Aquí puedes agregar lógica específica para cada herramienta
    console.log(`Herramienta seleccionada: ${toolId}`);
  };

  const handleInspectorToggle = () => {
    setIsInspectorMode(!isInspectorMode);
  };

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

  // Handle background changes from component (shorthand and lists)
  const handleBackgroundChange = useCallback((css: { background: string; backgroundRepeat: string; backgroundSize: string; backgroundPosition: string; }, layers: BackgroundLayer[]) => {
    setBackgroundValues(layers);
    if (selectedElement) {
      selectedElement.style.setProperty('background', css.background, 'important');
      selectedElement.style.setProperty('background-repeat', css.backgroundRepeat, 'important');
      selectedElement.style.setProperty('background-size', css.backgroundSize, 'important');
      selectedElement.style.setProperty('background-position', css.backgroundPosition, 'important');
    }
  }, [selectedElement]);

  return (
    <>
      {/* Dock Flotante - Solo mostrar cuando el panel NO esté minimizado */}
      {!isMinimized && (
        <Dock 
          onToolSelect={handleDockToolSelect}
          activeTool={activeDockTool}
          inspectorMode={isInspectorMode}
          onInspectorToggle={handleInspectorToggle}
          selectedElement={selectedElement}
        />
      )}

      {/* Panel lateral arrastrable */}
      <div 
        ref={panelRef}
        className={`fixed bg-primary-bg border border-secondary-bg text-white font-sans z-[9999] flex flex-col shadow-2xl rounded-lg overflow-hidden z-50 ${
          isDraggingPanel ? 'transition-none scale-105 shadow-3xl' : 'transition-all duration-300 hover:shadow-3xl'
        } ${
          isMinimized 
            ? 'h-11' 
            : 'w-96 h-[calc(100vh-2rem)]'
        }`}
        style={{
          left: `${panelPosition.x}px`,
          top: `${panelPosition.y}px`,
          resize: isMinimized ? 'none' : 'both',
          minWidth: isMinimized ? '300px' : '320px',
          minHeight: isMinimized ? '44px' : '400px',
          maxWidth: isMinimized ? '128px' : '90vw',
          maxHeight: isMinimized ? '32px' : '90vh',
          willChange: isDraggingPanel ? 'transform' : 'auto'
        }}
      >
        {/* Vista minimizada */}
        {isMinimized ? (
          <div 
            className="flex justify-between items-center px-3 w-full h-full rounded border backdrop-blur-md transition-colors select-none minimized-panel cursor-grab active:cursor-grabbing bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border-secondary-bg group hover:bg-primary-bg/90"
           
            onMouseDown={handlePanelDragStart}
          >
            <div className="flex gap-2 items-center">
              <div>
                <LogoApp variant="white" size={42} className="w-[60px] h-[60px]" />
              </div>
              {/* Ícono de inspector */}
              <div className={`w-3 h-3 rounded-full border  ${isInspectorMode ? 'border-none bg-pikend-bg' : 'bg-secondary-bg border-pikend-bg/10'}`} />
              
              {/* Ícono de notificación */}
              <div className={`w-3 h-3 rounded-full border ${selectedElement ? 'border-none bg-pikend-bg' : 'bg-secondary-bg border-pikend-bg/10'}`} />
              
             
            </div>
            
            <div className="flex gap-1 items-center">
              {/* Botón de expandir (icono de open) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                  // La posición se ajustará automáticamente por el useEffect
                }}
                className="flex justify-center items-center w-7 h-7 text-white rounded shadow-sm transition-colors duration-200 cursor-pointer bg-secondary-bg hover:bg-pikend-bg/20"
                title="Expand panel"
              >
                <IconMaximize size={12} />
              </button>
              
              {/* Botón para cambiar posición (visible en hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cycleToNextCorner();
                }}
                className="flex justify-center items-center w-7 h-7 text-xs text-gray-300 rounded duration-200 cursor-pointer group-hover:opacity-100 bg-secondary-bg hover:bg-pikend-bg/20"
                title={`Move to ${minimizedCorner === 'top-left' ? 'top-right' : 
                  minimizedCorner === 'top-right' ? 'bottom-right' : 
                  minimizedCorner === 'bottom-right' ? 'bottom-left' : 'top-left'}`}
              >
                <IconReplace size={12} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Drag handle visible */}
            <div 
              className="absolute top-2 left-1/2 z-10 w-8 h-1 bg-gray-600 rounded-full transition-colors transform -translate-x-1/2 drag-handle cursor-grab hover:bg-gray-500"
              onMouseDown={handlePanelDragStart}
            />
            
            {/* Botón para minimizar */}
            <button
              onClick={() => setIsMinimized(true)}
              className="flex absolute top-2 right-2 z-10 justify-center items-center w-7 h-7 text-gray-300 rounded transition-colors cursor-pointer bg-secondary-bg hover:bg-pikend-bg/20 hover:text-white"
              title="Minimize panel"
            >
              <MinusIcon size={12} />
            </button>
            
           
        <div 
          className="pt-6 border-b panel-header border-secondary-bg bg-primary-bg cursor-grab"
          onMouseDown={handlePanelDragStart}
        >
          {selectedElement ? (
            <>
              {/* Element Header with actions */}
              <div className="flex justify-between items-center px-3 mb-3">
                <div className="flex gap-2 items-center">
                  <span className="text-lg font-bold text-white">
                    {selectedElement.tagName.toLowerCase()}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <button 
                    className="p-2 rounded cursor-pointer hover:bg-secondary-bg"
                    title="Copy element"
                  >
                    <Copy size={20} className="text-gray-400" />
                  </button>
                  <button 
                    className="p-2 rounded cursor-pointer hover:bg-secondary-bg"
                    title="Expand element"
                  >
                    <Eye size={20} className="text-gray-400" />
                  </button>
                  <button 
                    className="p-2 rounded cursor-pointer hover:bg-secondary-bg"
                    title="Delete element"
                  >
                    <Trash2 size={20} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedElement(null);
                      setElementInfo('');
                      setSections([]);
                      updateOverlay(null);
                    }}
                    className="p-2 rounded cursor-pointer hover:bg-secondary-bg"
                    title="Close inspector"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Element dimensions */}
              <div className="flex gap-2 items-center mb-3">
                <div className="flex gap-1 items-center text-gray-400">
                  <div className="w-3 h-3 border border-gray-500"></div>
                  <span className="text-xs">
                    {Math.round(selectedElement.getBoundingClientRect().width)}×{Math.round(selectedElement.getBoundingClientRect().height)}
                  </span>
                </div>
              </div>

              {/* Font info */}
              <div className="flex gap-2 items-center mb-4">
                <div className="flex gap-1 items-center text-gray-400">
                  <span className="text-xs">A</span>
                  <span className="text-xs underline">
                    {window.getComputedStyle(selectedElement).fontFamily.split(',')[0].replace(/['"]/g, '')} {window.getComputedStyle(selectedElement).fontSize}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-3">
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
                        ? 'bg-secondary-bg text-[#dadada] border-b-2 border-blue-500' 
                        : 'text-gray-400 hover:text-white hover:bg-secondary-bg'
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
              <div className="flex justify-between items-center pl-3 mb-3">
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold">Stylo</span>
                </div>
                
              </div>
            </>
          )}
        </div>

        {/* Content */}
            <ScrollArea className="flex-1 h-[200px] w-full relative">
       
            {!selectedElement ? (
              <>
                 <div className="flex overflow-hidden absolute inset-0 flex-col justify-center items-center w-full h-full">
                    <DotPattern
                      glow={true}
                      useParentDimensions={true}
                      areaCircle={20}
                      className={cn(
                        "[mask-image:radial-gradient(circle_at_center,white_0%,rgba(255,255,255,0.8)_30%,rgba(255,255,255,0.4)_60%,transparent_100%)]",
                      )}
                    />
                 </div>
                <div className="relative z-10 p-4 text-center text-gray-400">
                
                  <div className="flex justify-center w-full">
                    <LogoApp  variant="white" size={42} className="w-[260px] h-[260px]"/>
                  </div>
                  <p className="mb-2 text-sm">Click the inspector button and select any element to view its CSS properties.</p>
                  <p className="text-xs">Inspector mode: {isInspectorMode ? 'ON' : 'OFF'}</p>
                  <div className="flex justify-center mt-11">
                    <button 
                      onClick={() => setIsInspectorMode(!isInspectorMode)}
                      className={cn(
                        "group relative cursor-pointer inline-flex items-center justify-center px-8 py-3 text-sm font-medium transition-all duration-300 ease-out",
                        "bg-secondary-bg",
                        "text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/25",
                        "transform hover:scale-105 active:scale-95",
                        "border border-white/20 hover:border-white/30",
                        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0",
                        isInspectorMode && "ring-2 ring-pikend ring-offset-2 ring-offset-gray-900"
                      )}
                    >
                      <Target className="mr-2 w-4 h-4 transition-transform group-hover:rotate-12" />
                      <span className="relative z-10">
                        {isInspectorMode ? 'Desactivar Inspector' : 'Activar Inspector'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r rounded-full opacity-0 blur-xl transition-opacity duration-300 from-purple-400/20 via-pink-400/20 to-red-400/20 group-hover:opacity-100 -z-10" />
                    </button>
                  </div>
                </div>
               </>
            ) : (
              <div className="p-4">
                {activeTab === 'design' ? (
                  <div className="space-y-4">
                    {/* Media Queries Selector */}
                    <div className="space-y-3  bg-[#ff80bf0f] rounded-lg">
                      <div className="flex gap-2 items-center px-3 pt-3 text-gray-400">
                          <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-devices-pc"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5h6v14h-6z" /><path d="M12 9h10v7h-10z" /><path d="M14 19h6" /><path d="M17 16v3" /><path d="M6 13v.01" /><path d="M6 16v.01" /></svg>
                        <span className="text-xs">Media:</span>
                      </div>
                      <select 
                        value={selectedMedia}
                        onChange={(e) => setSelectedMedia(e.target.value)}
                        className="px-3 py-2 w-full text-sm text-pink-400 rounded border-none focus:border-none focus:outline-none"
                      >
                        <option value="Auto - screen and (min-width: 1024px)">Auto - screen and (min-width: 1024px)</option>
                        <option value="Mobile - screen and (max-width: 768px)">Mobile - screen and (max-width: 768px)</option>
                        <option value="Tablet - screen and (max-width: 1024px)">Tablet - screen and (max-width: 1024px)</option>
                        <option value="Desktop - screen and (min-width: 1200px)">Desktop - screen and (min-width: 1200px)</option>
                      </select>
                    </div>

                    {/* State/Pseudo Selector */}
                    <div className="space-y-3 bg-[#77f0a00d] rounded-lg">
                      <div className="flex gap-2 items-center px-3 pt-3 text-gray-400">
                        <div className="flex justify-center items-center w-4 h-4 rounded-full border border-gray-500">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        </div>
                        <span className="text-xs">State or pseudo</span>
                      </div>
                      <select 
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-3 py-2 w-full text-sm text-green-400 bg-transparent rounded border-none focus:border-blue-500 focus:outline-none"
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
                    <div className="p-3 space-y-3 rounded-lg bg-secondary-bg">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* Position X */}
                        <div className="flex items-center space-y-1">
                          <div className="flex gap-1 items-center">
                            <span className="text-gray-400">X</span>
                            <span className="text-gray-500">{selectedElement ? Math.round(selectedElement.getBoundingClientRect().left) : 0}</span>
                          </div>
                        </div>
                        
                        {/* Position Y */}
                        <div className="flex items-center space-y-1">
                          <div className="flex gap-1 items-center">
                            <span className="text-gray-400">Y</span>
                            <span className="text-gray-500">{selectedElement ? Math.round(selectedElement.getBoundingClientRect().top) : 0}</span>
                          </div>
                        </div>

                        {/* Rotation */}
                        <div className="flex items-center space-y-1">
                          <label className="mr-2 text-gray-400">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="15"  height="15"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-rotate"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" /></svg>
                          </label>
                          <div className="flex relative rounded-lg border-2 border-secondary-bg">
                            <input
                              type="text"
                              value={editableValues.rotate.value}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  rotate: { ...prev.rotate, value: newValue }
                                }));
                                if (selectedElement) {
                                  selectedElement.style.setProperty('transform', `rotate(${newValue}${editableValues.rotate.unit})`, 'important');
                                }
                              }}
                              className="flex-1 px-2 py-1 w-full text-xs text-white bg-transparent outline-none"
                              placeholder="0"
                            />
                            <Select 
                              value={editableValues.rotate.unit} 
                              onValueChange={(value) => {
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  rotate: { ...prev.rotate, unit: value }
                                }));
                                if (selectedElement) {
                                  selectedElement.style.setProperty('transform', `rotate(${editableValues.rotate.value}${value})`, 'important');
                                }
                              }}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none  focus:border-none focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="deg">deg</SelectItem>
                                <SelectItem value="rad">rad</SelectItem>
                                <SelectItem value="grad">grad</SelectItem>
                                <SelectItem value="turn">turn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Width, Height, Border-radius */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* Width */}
                        <div className="space-y-1">
                          <label className="text-gray-400">W</label>
                          <div className="flex relative rounded-lg border-2 border-secondary-bg">
                            <input
                              type="text"
                              value={editableValues.width.value}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  width: { ...prev.width, value: newValue }
                                }));
                                if (selectedElement) {
                                  const fullValue = newValue === 'auto' ? 'auto' : `${newValue}${editableValues.width.unit}`;
                                  selectedElement.style.width = fullValue;
                                }
                              }}
                              className="flex-1 px-2 py-1 w-full text-xs text-white bg-none border border-r-0 border-none focus:border-green-500 focus:outline-none"
                              placeholder="auto"
                            />
                            <Select 
                              value={editableValues.width.unit}
                              
                              onValueChange={(newUnit) => {
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  width: { ...prev.width, unit: newUnit }
                                }));
                                if (selectedElement && editableValues.width.value !== 'auto') {
                                  selectedElement.style.width = `${editableValues.width.value}${newUnit}`;
                                }
                              }}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none  focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="px" className="text-white hover:bg-gray-700">px</SelectItem>
                                <SelectItem value="%" className="text-white hover:bg-gray-700">%</SelectItem>
                                <SelectItem value="em" className="text-white hover:bg-gray-700">em</SelectItem>
                                <SelectItem value="rem" className="text-white hover:bg-gray-700">rem</SelectItem>
                                <SelectItem value="vw" className="text-white hover:bg-gray-700">vw</SelectItem>
                                <SelectItem value="vh" className="text-white hover:bg-gray-700">vh</SelectItem>
                                <SelectItem value="auto" className="text-white hover:bg-gray-700">auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Height */}
                        <div className="space-y-1">
                          <label className="text-gray-400">H</label>
                          <div className="flex relative rounded-lg border-2 border-secondary-bg">
                            <input
                              type="text"
                              value={editableValues.height.value}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  height: { ...prev.height, value: newValue }
                                }));
                                if (selectedElement) {
                                  const fullValue = newValue === 'auto' ? 'auto' : `${newValue}${editableValues.height.unit}`;
                                  selectedElement.style.height = fullValue;
                                }
                              }}
                              className="flex-1 px-2 py-1 w-full text-xs text-white bg-none border border-r-0 border-none focus:border-green-500 focus:outline-none"
                              placeholder="auto"
                            />
                            <Select 
                              value={editableValues.height.unit}
                              onValueChange={(newUnit) => {
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  height: { ...prev.height, unit: newUnit }
                                }));
                                if (selectedElement && editableValues.height.value !== 'auto') {
                                  selectedElement.style.height = `${editableValues.height.value}${newUnit}`;
                                }
                              }}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="px" className="text-white hover:bg-gray-700">px</SelectItem>
                                <SelectItem value="%" className="text-white hover:bg-gray-700">%</SelectItem>
                                <SelectItem value="em" className="text-white hover:bg-gray-700">em</SelectItem>
                                <SelectItem value="rem" className="text-white hover:bg-gray-700">rem</SelectItem>
                                <SelectItem value="vw" className="text-white hover:bg-gray-700">vw</SelectItem>
                                <SelectItem value="vh" className="text-white hover:bg-gray-700">vh</SelectItem>
                                <SelectItem value="auto" className="text-white hover:bg-gray-700">auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-1">
                          <label className="text-gray-400">R</label>
                          <div className="flex relative rounded-lg border-2 border-secondary-bg">
                            <input
                              type="text"
                              value={editableValues.borderRadius.value}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  borderRadius: { ...prev.borderRadius, value: newValue }
                                }));
                                if (selectedElement) {
                                  selectedElement.style.borderRadius = `${newValue}${editableValues.borderRadius.unit}`;
                                }
                              }}
                              className="flex-1 px-2 py-1 w-full text-xs text-white bg-none border border-r-0 border-none focus:border-green-500 focus:outline-none"
                              placeholder="0"
                            />
                            <Select 
                              value={editableValues.borderRadius.unit}
                              onValueChange={(newUnit) => {
                                setEditableValues(prev => ({ 
                                  ...prev, 
                                  borderRadius: { ...prev.borderRadius, unit: newUnit }
                                }));
                                if (selectedElement) {
                                  selectedElement.style.borderRadius = `${editableValues.borderRadius.value}${newUnit}`;
                                }
                              }}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="px" className="text-white hover:bg-gray-700">px</SelectItem>
                                <SelectItem value="%" className="text-white hover:bg-gray-700">%</SelectItem>
                                <SelectItem value="em" className="text-white hover:bg-gray-700">em</SelectItem>
                                <SelectItem value="rem" className="text-white hover:bg-gray-700">rem</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CSS Pro Style Spacing Visualizer */}
                    <div className={`${styles.cssProVisualSpacingBox} ${styles.cssProVisualAccordionContent} border border-secondary-bg css-pro-visual-spacing-box`}>
                      {/* Margin container */}
                      <div className="css-pro-visual-spacing-placeholder horizontal top"></div>
                      <div className="css-pro-visual-spacing-placeholder horizontal bottom"></div>
                      <div className='css-pro-visual-spacing-placeholder vertical left'></div>
                      <div className='css-pro-visual-spacing-placeholder vertical right'></div>
                      <div className="p-6 rounded-lg bg-secondary-bg">
                        
                        {/* Margin Top */}
                        <label 
                          data-css-pro-edit-rule="margin-top" 
                          onMouseDown={(e) => handleSpacingMouseDown('marginTop', e)} 
                          data-css-pro-input 
                          className="flex absolute top-2 left-1/2 items-center border transform -translate-x-1/2 border-secondary-bg"
                        >
                          <span 
                            className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                            title="Click and drag to change margin-top"
                          >
                            ⇕
                          </span>
                          <div className="flex gap-1 items-center h-full">
                            {/* Input con botones +/- personalizado */}
                            <div className="flex items-center w-full h-full rounded">
                              <button
                                type="button"
                                onClick={() => handleSpacingValueChange('marginTop', Math.max(-999, (spacingValues.marginTop?.value || 0) - 1))}
                                className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-secondary-bg"
                              >
                                <MinusIcon size={12} />
                              </button>
                              <input
                                type="text"
                                value={spacingValues.marginTop?.value || 0}
                                onChange={(e) => handleSpacingValueChange('marginTop', parseFloat(e.target.value) || 0)}
                                className="w-full text-xs text-center text-white bg-transparent border-none outline-none"
                                
                              />
                              <button
                                type="button"
                                onClick={() => handleSpacingValueChange('marginTop', Math.min(999, (spacingValues.marginTop?.value || 0) + 1))}
                                className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-secondary-bg"
                              >
                                <PlusIcon size={12} />
                              </button>
                            </div>
                            <Select 
                              value={spacingValues.marginTop?.unit || 'px'} 
                              onValueChange={(value) => handleSpacingUnitChange('marginTop', value)}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="auto">auto</SelectItem>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="em">em</SelectItem>
                                <SelectItem value="rem">rem</SelectItem>
                                <SelectItem value="vw">vw</SelectItem>
                                <SelectItem value="vh">vh</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </label>

                        {/* Margin Bottom */}
                        <label 
                          data-css-pro-edit-rule="margin-bottom" 
                          onMouseDown={(e) => handleSpacingMouseDown('marginBottom', e)} 
                          data-css-pro-input 
                          className="flex absolute bottom-2 left-1/2 items-center border transform -translate-x-1/2 border-secondary-bg"
                        >
                          <span 
                            className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                            title="Click and drag to change margin-bottom"
                          >
                            ⇕
                          </span>
                          <div className="flex gap-1 items-center h-full">
                            {/* Input con botones +/- personalizado */}
                            <div className="flex items-center w-full h-full rounded">
                              <button
                                type="button"
                                onClick={() => handleSpacingValueChange('marginBottom', Math.max(-999, (spacingValues.marginBottom?.value || 0) - 1))}
                                className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-gray-600 hover:bg-secondary-bg"
                              >
                                <MinusIcon size={12} />
                              </button>
                              <input
                                type="text"
                                value={spacingValues.marginBottom?.value || 0}
                                onChange={(e) => handleSpacingValueChange('marginBottom', parseFloat(e.target.value) || 0)}
                                className="w-full text-xs text-center text-white bg-transparent border-none outline-none"
                              
                              />
                              <button
                                type="button"
                                onClick={() => handleSpacingValueChange('marginBottom', Math.min(999, (spacingValues.marginBottom?.value || 0) + 1))}
                                className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-gray-600 hover:bg-secondary-bg"
                              >
                                <PlusIcon size={12} />
                              </button>
                            </div>
                            <Select 
                              value={spacingValues.marginBottom?.unit || 'px'} 
                              onValueChange={(value) => handleSpacingUnitChange('marginBottom', value)}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="auto">auto</SelectItem>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="em">em</SelectItem>
                                <SelectItem value="rem">rem</SelectItem>
                                <SelectItem value="vh">vh</SelectItem>
                                <SelectItem value="vw">vw</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </label>

                        {/* Margin Left */}
                        <label 
                          data-css-pro-edit-rule="margin-left" 
                          onMouseDown={(e) => handleSpacingMouseDown('marginLeft', e)} 
                          data-css-pro-input 
                          className="absolute left-[-48px] top-[42%] transform -translate-y-[-6%] -rotate-90 origin-center border border-secondary-bg h-[44px] w-[45.035%]"
                        >
                          <div className="flex items-center h-full">
                            <span 
                              className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                              title="Click and drag to change margin-left"
                            >
                              ⇔
                            </span>
                            <div className="flex gap-1 items-center h-full">
                              {/* Input con botones +/- personalizado */}
                              <div className="flex items-center w-full h-full rounded">
                                <button
                                  type="button"
                                  onClick={() => handleSpacingValueChange('marginLeft', Math.max(-999, (spacingValues.marginLeft?.value || 0) - 1))}
                                  className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-gray-600 hover:bg-secondary-bg"
                                >
                                  <MinusIcon size={12} />
                                </button>
                                <input
                                  type="text"
                                  value={spacingValues.marginLeft?.value || 0}
                                  onChange={(e) => handleSpacingValueChange('marginLeft', parseFloat(e.target.value) || 0)}
                                  className="w-full text-xs text-center text-white bg-transparent border-none outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSpacingValueChange('marginLeft', Math.min(999, (spacingValues.marginLeft?.value || 0) + 1))}
                                  className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-gray-600 hover:bg-secondary-bg"
                                >
                                  <PlusIcon size={12} />
                                </button>
                              </div>
                              <Select 
                                value={spacingValues.marginLeft?.unit || 'px'} 
                                onValueChange={(value) => handleSpacingUnitChange('marginLeft', value)}
                              >
                                <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-primary-bg border-secondary-bg">
                                  <SelectItem value="auto">auto</SelectItem>
                                  <SelectItem value="px">px</SelectItem>
                                  <SelectItem value="%">%</SelectItem>
                                  <SelectItem value="em">em</SelectItem>
                                  <SelectItem value="rem">rem</SelectItem>
                                  <SelectItem value="vw">vw</SelectItem>
                                  <SelectItem value="vh">vh</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </label>

                        {/* Margin Right */}
                        <label 
                          data-css-pro-edit-rule="margin-right" 
                          onMouseDown={(e) => handleSpacingMouseDown('marginRight', e)} 
                          data-css-pro-input 
                          className="absolute right-1 top-1/2 transform -translate-[101px] rotate-90 origin-center border border-secondary-bg h-[44px] w-[45.035%] top-[213px] right-[-148px]"
                        >
                          <div className="flex items-center">
                            <span 
                              className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                              title="Click and drag to change margin-right"
                            >
                              ⇔
                            </span>
                            <div className="flex gap-1 items-center h-full">
                              {/* Input con botones +/- personalizado */}
                              <div className="flex items-center w-full h-full rounded">
                                <button
                                  type="button"
                                  onClick={() => handleSpacingValueChange('marginRight', Math.max(-999, (spacingValues.marginRight?.value || 0) - 1))}
                                  className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-gray-600 hover:bg-secondary-bg"
                                >
                                  <MinusIcon size={12} />
                                </button>
                                <input
                                  type="text"
                                  value={spacingValues.marginRight?.value || 0}
                                  onChange={(e) => handleSpacingValueChange('marginRight', parseFloat(e.target.value) || 0)}
                                  className="w-full text-xs text-center text-white bg-transparent border-none outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSpacingValueChange('marginRight', Math.min(999, (spacingValues.marginRight?.value || 0) + 1))}
                                  className="flex justify-center items-center w-full h-full text-gray-400 transition-colors cursor-pointer hover:text-white hover:bg-gray-600 hover:bg-secondary-bg"
                                >
                                  <PlusIcon size={12} />
                                </button>
                              </div>
                              <Select 
                                value={spacingValues.marginRight?.unit || 'px'} 
                                onValueChange={(value) => handleSpacingUnitChange('marginRight', value)}
                              >
                                <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-primary-bg border-secondary-bg">
                                  <SelectItem value="auto">auto</SelectItem>
                                  <SelectItem value="px">px</SelectItem>
                                  <SelectItem value="%">%</SelectItem>
                                  <SelectItem value="em">em</SelectItem>
                                  <SelectItem value="rem">rem</SelectItem>
                                  <SelectItem value="vw">vw</SelectItem>
                                  <SelectItem value="vh">vh</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </label>

                        {/* Padding container */}
                        <div className="relative p-10 m-8 rounded bg-secondary-bg">
                          
                          {/* Padding Top */}
                          <div className="flex absolute top-2 left-1/2 items-center rounded-lg border transform -translate-x-1/2 border-secondary-bg">
                            <span 
                              className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                              onMouseDown={(e) => handleSpacingMouseDown('paddingTop', e)}
                              title="Click and drag to change padding-top"
                            >
                              ⇕
                            </span>
                            <input
                              type="text"
                              min="0"
                              value={spacingValues.paddingTop?.value || 0}
                              onChange={(e) => handleSpacingValueChange('paddingTop', parseFloat(e.target.value) || 0)}
                              className="w-8 text-xs text-center text-white bg-transparent border-none outline-none"
                              style={{ width: `${Math.max(2, String(spacingValues.paddingTop?.value || 0).length)}ch` }}
                            />
                            <Select 
                              value={spacingValues.paddingTop?.unit || 'px'} 
                              onValueChange={(value) => handleSpacingUnitChange('paddingTop', value)}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="em">em</SelectItem>
                                <SelectItem value="rem">rem</SelectItem>
                                <SelectItem value="vw">vw</SelectItem>
                                <SelectItem value="vh">vh</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Padding Bottom */}
                          <div className="flex absolute bottom-0 left-1/2 items-center rounded-lg border transform -translate-x-1/2 border-secondary-bg">
                            <span 
                              className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                              onMouseDown={(e) => handleSpacingMouseDown('paddingBottom', e)}
                              title="Click and drag to change padding-bottom"
                            >
                              ⇕
                            </span>
                            <input
                              type="text"
                              min="0"
                              value={spacingValues.paddingBottom?.value || 0}
                              onChange={(e) => handleSpacingValueChange('paddingBottom', parseFloat(e.target.value) || 0)}
                              className="w-8 text-xs text-center text-white bg-transparent border-none outline-none"
                              style={{ width: `${Math.max(2, String(spacingValues.paddingBottom?.value || 0).length)}ch` }}
                            />
                            <Select 
                              value={spacingValues.paddingBottom?.unit || 'px'} 
                              onValueChange={(value) => handleSpacingUnitChange('paddingBottom', value)}
                            >
                              <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-primary-bg border-secondary-bg">
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="em">em</SelectItem>
                                <SelectItem value="rem">rem</SelectItem>
                                <SelectItem value="vw">vw</SelectItem>
                                <SelectItem value="vh">vh</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Padding Left */}
                          <div className="absolute left-[-19px] top-1/2 transform -translate-y-1/2 -rotate-90 origin-center border border-secondary-bg rounded-lg">
                            <div className="flex items-center">
                              <span 
                                className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                                onMouseDown={(e) => handleSpacingMouseDown('paddingLeft', e)}
                                title="Click and drag to change padding-left"
                              >
                                ⇔
                              </span>
                              <input
                                type="text"
                                min="0"
                                value={spacingValues.paddingLeft?.value || 0}
                                onChange={(e) => handleSpacingValueChange('paddingLeft', parseFloat(e.target.value) || 0)}
                                className="w-8 text-xs text-center text-white bg-transparent border-none outline-none"
                                style={{ width: `${Math.max(2, String(spacingValues.paddingLeft?.value || 0).length)}ch` }}
                              />
                              <Select 
                                value={spacingValues.paddingLeft?.unit || 'px'} 
                                onValueChange={(value) => handleSpacingUnitChange('paddingLeft', value)}
                              >
                                <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-primary-bg border-secondary-bg">
                                  <SelectItem value="px">px</SelectItem>
                                  <SelectItem value="%">%</SelectItem>
                                  <SelectItem value="em">em</SelectItem>
                                  <SelectItem value="rem">rem</SelectItem>
                                  <SelectItem value="vw">vw</SelectItem>
                                  <SelectItem value="vh">vh</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Padding Right */}
                          <div className="absolute right-[-19px] top-1/2 transform -translate-y-1/2 rotate-90 origin-center border border-secondary-bg rounded-lg">
                            <div className="flex items-center">
                              <span 
                                className="mr-1 text-xs text-gray-400 cursor-ns-resize hover:text-white"
                                onMouseDown={(e) => handleSpacingMouseDown('paddingRight', e)}
                                title="Click and drag to change padding-right"
                              >
                                ⇔
                              </span>
                              <input
                                type="text"
                                min="0"
                                value={spacingValues.paddingRight?.value || 0}
                                onChange={(e) => handleSpacingValueChange('paddingRight', parseFloat(e.target.value) || 0)}
                                className="w-8 text-xs text-center text-white bg-transparent border-none outline-none"
                                style={{ width: `${Math.max(2, String(spacingValues.paddingRight?.value || 0).length)}ch` }}
                              />
                              <Select 
                                value={spacingValues.paddingRight?.unit || 'px'} 
                                onValueChange={(value) => handleSpacingUnitChange('paddingRight', value)}
                              >
                                <SelectTrigger className="w-[60px] bg-none text-white px-2 py-1 rounded-r text-xs border-none focus:border-green-500 focus:outline-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-primary-bg border-secondary-bg">
                                  <SelectItem value="px">px</SelectItem>
                                  <SelectItem value="%">%</SelectItem>
                                  <SelectItem value="em">em</SelectItem>
                                  <SelectItem value="rem">rem</SelectItem>
                                  <SelectItem value="vw">vw</SelectItem>
                                  <SelectItem value="vh">vh</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Element center */}
                          <div className="bg-primary-bg p-8 rounded text-center border border-secondary-bg min-h-[80px] flex flex-col justify-center">
                            <div className="mb-1 text-xs font-medium text-gray-300">
                              {selectedElement?.tagName.toLowerCase() || 'element'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {editableValues.width.value}{editableValues.width.unit} × {editableValues.height.value}{editableValues.height.unit}
                            </div>
                          </div>

                          {/* Padding label */}
                          <span className="absolute top-1 left-2 text-xs font-medium text-gray-400">Padding</span>
                        </div>

                        {/* Margin label */}
                        <span className="absolute top-1 left-2 text-xs font-medium text-gray-400">Margin</span>
                      </div>
                    </div>
                    <Accordion type="single" collapsible>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-1">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconBackground stroke={2} size={21} />
                          Typography
                        </AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Typography 
                            values={typographyValues}
                            onChange={handleTypographyChange}
                            onFontSizeChange={handleFontSizeChange}
                            onFontSizeUnitChange={handleFontSizeUnitChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-2">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconSquareRounded stroke={2} size={21} />
                          Background</AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Background 
                            value={backgroundValues}
                            onChange={handleBackgroundChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-3">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconTiltShift stroke={2} size={21}/>
                          Filters</AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Filters 
                            values={filtersValues}
                            onChange={handleFiltersChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem  className='border-b-2 border-secondary-bg' value="item-4">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconBoxPadding stroke={2} size={21}/>
                          Text shadow</AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Shadows 
                            values={shadowsValues}
                            onChange={handleShadowsChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-5">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconWashDryShade stroke={2} size={21}/>
                          Box shadow</AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <BoxShadows 
                            value={boxShadow}
                            onChange={handleBoxShadowChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-6">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconStackFront stroke={2} size={21}/>
                          Positioning</AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Positioning 
                            values={positioning}
                            onChange={handlePositioningChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-7">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconBorderSides stroke={2} size={21}/>
                          Border</AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Border 
                            values={borderValues}
                            onChange={handleBorderChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className='border-b-2 border-secondary-bg' value="item-8">
                        <AccordionTrigger className='px-3 mb-2 cursor-pointer hover:bg-secondary-bg text-[#b1b1b1] !no-underline flex text-left justify-normal mt-2'>
                          <IconCarouselVertical stroke={2} size={21}/>
                          Display
                          </AccordionTrigger>
                        <AccordionContent className='px-2 py-2'>
                          <Display 
                            values={displayValues}
                            onChange={handleDisplayChange}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ) : activeTab === 'code' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-400">Generated CSS</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(generateCSS())}
                          className="p-1 rounded hover:bg-gray-700"
                          title="Copy CSS"
                        >
                          <Copy size={12} className="text-gray-400" />
                        </button>
                      </div>
                      <pre className="overflow-x-auto font-mono text-xs text-gray-300 whitespace-pre-wrap">
                        {generateCSS()}
                      </pre>
                    </div>
                  </div>
                ) : activeTab === 'html' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-400">HTML Structure</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(selectedElement?.outerHTML || '')}
                          className="p-1 rounded hover:bg-gray-700"
                          title="Copy HTML"
                        >
                          <Copy size={12} className="text-gray-400" />
                        </button>
                      </div>
                      <pre className="overflow-x-auto font-mono text-xs text-gray-300 whitespace-pre-wrap">
                        {selectedElement?.outerHTML}
                      </pre>
                    </div>
                  </div>
                ) : activeTab === 'chat' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-purple-400">AI Chat</span>
                        <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">NEW</span>
                      </div>
                      <div className="py-8 text-center text-gray-400">
                        <div className="mb-2 text-2xl">🤖</div>
                        <p className="text-sm">AI Chat feature coming soon!</p>
                        <p className="mt-2 text-xs">Ask questions about this element's styling</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
   
            </ScrollArea>
          </>
        )}
      </div>
      
      {/* Instrucciones flotantes - Solo mostrar cuando el panel NO esté minimizado */}
      {!isMinimized && isInspectorMode && !selectedElement && (
        <div className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9997] text-sm">
          🎯 Inspector Mode: Click any element to inspect its CSS
        </div>
      )}
      
      {/* Indicador de Ctrl+Click cuando hay elemento seleccionado - Solo mostrar cuando el panel NO esté minimizado */}
      {!isMinimized && selectedElement && !isInspectorMode && (
        <div className="fixed top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9997] text-sm">
          💡 Hold <kbd className="px-1 bg-green-700 rounded">Ctrl</kbd> + Click to select another element
        </div>
      )}
      
    </>
  );
};