import React, { useState, useEffect } from 'react';
import { Target, Code, Layers, Image, Grid, Type, Zap, Settings } from 'lucide-react';

interface DockProps {
  onToolSelect?: (toolId: string) => void;
  activeTool?: string;
  inspectorMode?: boolean;
  onInspectorToggle?: () => void;
}

interface DockTool {
  id: string;
  icon: React.ComponentType<{ size?: number }> | string;
  label: string;
  active?: boolean;
}

export default function Dock({ 
  onToolSelect, 
  activeTool = 'inspector', 
  inspectorMode = false,
  onInspectorToggle 
}: DockProps) {
  const [dockPosition, setDockPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - 200 : 200, 
    y: typeof window !== 'undefined' ? window.innerHeight - 120 : 500 // Siempre abajo
  });
  const [isDraggingDock, setIsDraggingDock] = useState(false);
  const [dockDragOffset, setDockDragOffset] = useState({ x: 0, y: 0 });

  // Actualizar posición cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setDockPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 400),
        y: window.innerHeight - 120 // Mantener siempre abajo
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Funciones para arrastrar el dock
  const handleDockDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDock(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDockDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    document.body.style.cursor = 'grabbing';
  };

  const handleDockDragMove = (e: MouseEvent) => {
    if (!isDraggingDock) return;
    
    const newX = e.clientX - dockDragOffset.x;
    const newY = e.clientY - dockDragOffset.y;
    
    // Límites de la ventana - restringir solo movimiento horizontal
    const maxX = window.innerWidth - 400; // ancho del dock
    const minY = window.innerHeight - 150; // área inferior
    const maxY = window.innerHeight - 80;  // no muy pegado al borde
    
    setDockPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY)) // Mantener en la parte inferior
    });
  };

  const handleDockDragEnd = () => {
    setIsDraggingDock(false);
    document.body.style.cursor = 'default';
  };

  // useEffect para los eventos de arrastre del dock
  useEffect(() => {
    if (isDraggingDock) {
      document.addEventListener('mousemove', handleDockDragMove);
      document.addEventListener('mouseup', handleDockDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDockDragMove);
        document.removeEventListener('mouseup', handleDockDragEnd);
      };
    }
  }, [isDraggingDock, dockDragOffset]);

  // Herramientas del dock
  const dockTools: DockTool[] = [
    { id: 'pause', icon: '⏸️', label: 'Pausar' },
    { id: 'inspector', icon: Target, label: 'Inspector', active: inspectorMode },
    { id: 'layers', icon: Layers, label: 'Capas', active: activeTool === 'layers' },
    { id: 'image', icon: Image, label: 'Imagen', active: activeTool === 'image' },
    { id: 'grid', icon: Grid, label: 'Grid', active: activeTool === 'grid' },
    { id: 'type', icon: Type, label: 'Texto', active: activeTool === 'type' },
    { id: 'code', icon: Code, label: 'Código', active: activeTool === 'code' },
    { id: 'more', icon: '•••', label: 'Más' }
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'inspector' && onInspectorToggle) {
      onInspectorToggle();
    }
    
    if (onToolSelect) {
      onToolSelect(toolId);
    }
  };

  return (
    <div
      className={`fixed bg-gray-800/90 backdrop-blur-md border border-gray-600/50 rounded-2xl shadow-2xl transition-all duration-200 ${
        isDraggingDock ? 'shadow-blue-500/30 scale-105' : 'shadow-black/50'
      }`}
      style={{
        left: `${dockPosition.x}px`,
        bottom: `${window.innerHeight - dockPosition.y - 60}px`, // Usar bottom en lugar de top
        zIndex: 10000,
        padding: '8px 12px',
      }}
      onMouseDown={handleDockDragStart}
    >
      <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing select-none">
        {dockTools.map((tool, index) => (
          <React.Fragment key={tool.id}>
            <button
              className={`relative p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                tool.active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToolClick(tool.id);
              }}
              title={tool.label}
            >
              {typeof tool.icon === 'string' ? (
                <span className="text-sm">{tool.icon}</span>
              ) : (
                <tool.icon size={16} />
              )}
              
              {/* Indicador de herramienta activa */}
              {tool.active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </button>
            
            {/* Separador después del botón de pausa y antes del botón de más */}
            {(index === 0 || index === dockTools.length - 2) && (
              <div className="w-px h-6 bg-gray-600/50 mx-1" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Indicador de arrastre - ahora en la parte superior */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60" />
    </div>
  );
}