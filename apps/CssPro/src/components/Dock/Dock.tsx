import React, { useState, useEffect } from 'react';
import { Target, Code, Layers, Image, Grid, Type, Zap, Settings } from 'lucide-react';

interface DockProps {
  onToolSelect?: (toolId: string) => void;
  activeTool?: string;
  inspectorMode?: boolean;
  onInspectorToggle?: () => void;
  selectedElement?: HTMLElement | null; // Agregar esta prop
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
  onInspectorToggle,
  selectedElement: externalSelectedElement // Recibir la prop externa
}: DockProps) {
  const [dockPosition, setDockPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - 200 : 200, 
    y: typeof window !== 'undefined' ? window.innerHeight - 120 : 500 // Siempre abajo
  });
  const [isDraggingDock, setIsDraggingDock] = useState(false);
  const [dockDragOffset, setDockDragOffset] = useState({ x: 0, y: 0 });
  const [showCssPanel, setShowCssPanel] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  // Sincronizar el estado interno con la prop externa
  useEffect(() => {
    if (externalSelectedElement !== selectedElement) {
      setSelectedElement(externalSelectedElement);
    }
  }, [externalSelectedElement]);

  // Función para detener/pausar CSS Pro
  const stopCssPro = () => {
    console.log('🛑 CSS Pro detenido');
    
    // Desactivar el modo inspector
    if (onInspectorToggle && inspectorMode) {
      onInspectorToggle();
    }
    
    // Limpiar elemento seleccionado
    setSelectedElement(null);
    
    // Cerrar panel CSS si está abierto
    setShowCssPanel(false);
    
    // Remover todos los event listeners de inspección
    document.removeEventListener('mouseover', handleElementHover);
    document.removeEventListener('mouseout', handleElementOut);
    document.removeEventListener('click', handleElementClick);
    
    // Limpiar estilos de hover de todos los elementos
    const highlightedElements = document.querySelectorAll('[data-css-pro-highlight]');
    highlightedElements.forEach(el => {
      el.removeAttribute('data-css-pro-highlight');
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.backgroundColor = '';
    });
    
    // Notificar al componente padre
    if (onToolSelect) {
      onToolSelect('stopped');
    }
  };

  // Función para mostrar mensajes temporales
  const showTemporaryMessage = (message: string) => {
    // Remover mensaje existente si existe
    const existingMessage = document.getElementById('css-pro-temp-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Crear mensaje temporal
    const messageDiv = document.createElement('div');
    messageDiv.id = 'css-pro-temp-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(59, 130, 246, 0.5);
      border-radius: 8px;
      padding: 12px 20px;
      color: #3b82f6;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 10002;
      animation: slideDown 0.3s ease-out;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    `;
    
    messageDiv.innerHTML = `
      <style>
        @keyframes slideDown { 
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; } 
          to { transform: translateX(-50%) translateY(0); opacity: 1; } 
        }
      </style>
      ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
      if (messageDiv && messageDiv.parentNode) {
        messageDiv.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => {
          messageDiv.remove();
        }, 300);
      }
    }, 3000);
  };

  // Función simplificada para mostrar CSS - solo modal, sin inspector
  const showCss = () => {
    console.log('🎨 Mostrando CSS');
    
    // Si el panel ya está abierto, cerrarlo
    if (showCssPanel) {
      setShowCssPanel(false);
      const existingModal = document.getElementById('css-pro-modal');
      if (existingModal) {
        existingModal.remove();
      }
      console.log('❌ Panel CSS cerrado');
      return;
    }
    
    // Usar el elemento externo si está disponible, sino el interno
    const elementToUse = externalSelectedElement || selectedElement;
    
    // Si no hay elemento seleccionado, mostrar mensaje
    if (!elementToUse) {
      showTemporaryMessage('Primero selecciona un elemento con el Inspector');
      return;
    }
    
    // Mostrar panel CSS directamente
    setShowCssPanel(true);
    
    // Obtener estilos computados del elemento
    const computedStyles = window.getComputedStyle(elementToUse);
    
    console.log('📋 CSS del elemento:', elementToUse);
    
    // Crear modal CSS inmediatamente
    createCssModal(elementToUse, computedStyles);
  };

  // Nueva función para crear modal CSS simple y elegante
  const createCssModal = (element: HTMLElement, styles: CSSStyleDeclaration) => {
    // Remover modal existente si existe
    const existingModal = document.getElementById('css-pro-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Crear overlay del modal
    const overlay = document.createElement('div');
    overlay.id = 'css-pro-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    `;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: rgba(17, 24, 39, 0.98);
      border: 1px solid rgba(75, 85, 99, 0.6);
      border-radius: 16px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 13px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease-out;
    `;
    
    const importantStyles = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
      'border', 'borderRadius', 'boxShadow', 'transform', 'opacity',
      'flexDirection', 'alignItems', 'justifyContent', 'textAlign'
    ];
    
    // Función para cerrar modal
    const closeModal = () => {
      overlay.remove();
      setShowCssPanel(false);
    };
    
    modal.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      </style>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(75, 85, 99, 0.3); padding-bottom: 16px;">
        <div>
          <h3 style="margin: 0; color: #3b82f6; font-size: 18px; font-weight: 600;">CSS Properties</h3>
          <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">
            <strong style="color: #10b981;">${element.tagName.toLowerCase()}</strong>
            ${element.className ? `<span style="color: #f59e0b;">.${element.className.split(' ').join('.')}</span>` : ''}
            ${element.id ? `<span style="color: #ec4899;">#${element.id}</span>` : ''}
          </p>
        </div>
        <button id="close-css-modal" 
                style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; font-size: 18px; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
      </div>
      <div style="display: grid; gap: 12px;">
        ${importantStyles.map(prop => {
          const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          const value = styles.getPropertyValue(cssProperty);
          return value && value !== 'none' && value !== 'auto' && value !== 'normal' && value !== '' ? `
            <div style="background: rgba(55, 65, 81, 0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #8b5cf6; font-weight: 500;">${cssProperty}:</span>
                <button class="copy-prop" data-value="${cssProperty}: ${value};" 
                        style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; cursor: pointer; font-size: 10px; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;">Copy</button>
              </div>
              <div style="color: #f3f4f6; margin-top: 4px; word-break: break-all;">${value}</div>
            </div>
          ` : '';
        }).join('')}
      </div>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(75, 85, 99, 0.3); text-align: center;">
        <button id="copy-all-css"
                style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 12px; transition: all 0.2s;">
          📋 Copiar todo el CSS
        </button>
      </div>
    `;
    
    // Agregar event listeners después de crear el modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
    
    // Cerrar modal con Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Agregar event listeners para los botones después de que el modal esté en el DOM
    setTimeout(() => {
      const closeBtn = document.getElementById('close-css-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
      
      const copyBtns = document.querySelectorAll('.copy-prop');
      copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          if (value) {
            navigator.clipboard.writeText(value);
            btn.textContent = '✓';
            setTimeout(() => {
              btn.textContent = 'Copy';
            }, 1000);
          }
        });
      });
      
      const copyAllBtn = document.getElementById('copy-all-css');
      if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
          const allCss = importantStyles.map(prop => {
            const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            const value = styles.getPropertyValue(cssProperty);
            return value && value !== 'none' && value !== 'auto' && value !== 'normal' && value !== '' ? `${cssProperty}: ${value};` : '';
          }).filter(Boolean).join('\n');
          
          navigator.clipboard.writeText(allCss);
          copyAllBtn.textContent = '✅ Copiado!';
          setTimeout(() => {
            copyAllBtn.innerHTML = '📋 Copiar todo el CSS';
          }, 2000);
        });
      }
    }, 100);
  };

  // Función auxiliar para manejar hover de elementos
  const handleElementHover = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && !target.closest('[data-css-pro-dock]')) {
      target.style.outline = '2px solid #3b82f6';
      target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      target.setAttribute('data-css-pro-highlight', 'true');
    }
  };

  // Función auxiliar para manejar salida de hover
  const handleElementOut = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.hasAttribute('data-css-pro-highlight')) {
      target.style.outline = '';
      target.style.backgroundColor = '';
      target.removeAttribute('data-css-pro-highlight');
    }
  };

  // Función auxiliar para manejar click en elemento
  const handleElementClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('[data-css-pro-dock]')) {
      setSelectedElement(target);
      
      // Limpiar highlights
      const highlightedElements = document.querySelectorAll('[data-css-pro-highlight]');
      highlightedElements.forEach(el => {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.backgroundColor = '';
        el.removeAttribute('data-css-pro-highlight');
      });
      
      // Marcar elemento seleccionado
      target.style.outline = '3px solid #10b981';
      target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      
      // Remover event listeners de selección
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseout', handleElementOut);
      document.removeEventListener('click', handleElementClick);
      
      console.log('✅ Elemento seleccionado:', target);
    }
  };

  // Función para crear panel CSS
  const createCssPanel = (element: HTMLElement, styles: CSSStyleDeclaration) => {
    // Remover panel existente si existe
    const existingPanel = document.getElementById('css-pro-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Crear nuevo panel
    const panel = document.createElement('div');
    panel.id = 'css-pro-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(75, 85, 99, 0.5);
      border-radius: 12px;
      padding: 20px;
      z-index: 10001;
      color: white;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    `;
    
    const importantStyles = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
      'border', 'borderRadius', 'boxShadow', 'transform', 'opacity'
    ];
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #3b82f6; font-size: 14px;">CSS Inspector</h3>
        <button onclick="document.getElementById('css-pro-panel').remove()" 
                style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px;">×</button>
      </div>
      <div style="margin-bottom: 10px;">
        <strong style="color: #10b981;">${element.tagName.toLowerCase()}</strong>
        ${element.className ? `<span style="color: #f59e0b;">.${element.className.split(' ').join('.')}</span>` : ''}
      </div>
      <div style="border-top: 1px solid rgba(75, 85, 99, 0.5); padding-top: 15px;">
        ${importantStyles.map(prop => {
          const value = styles.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
          return value ? `
            <div style="margin-bottom: 8px;">
              <span style="color: #8b5cf6;">${prop}:</span> 
              <span style="color: #f3f4f6;">${value}</span>
            </div>
          ` : '';
        }).join('')}
      </div>
    `;
    
    document.body.appendChild(panel);
  };

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

  // Herramientas del dock (sin el botón de pausa)
  const dockTools: DockTool[] = [
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
      className={`fixed transition-all duration-300 flex items-center gap-3 ${
        isDraggingDock ? 'shadow-blue-500/50 scale-105' : 'shadow-black/30'
      }`}
      style={{
        left: `${dockPosition.x}px`,
        bottom: `${window.innerHeight - dockPosition.y - 60}px`,
        zIndex: 10000,
        padding: '12px 16px',
      }}
      onMouseDown={handleDockDragStart}
    >
      {/* Botones de control principales */}
      <div className="flex items-center gap-2 bg-gray-800/90 backdrop-blur-md border border-gray-600/50 rounded-2xl p-2 shadow-xl">
        {/* Botón Stop CSS Pro */}
        <button 
          className={`relative p-3 rounded-xl transition-all duration-200 group ${
            !inspectorMode 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/20' 
              : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent'
          }`}
          onClick={stopCssPro}
          title="Detener CSS Pro Inspector"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M13.022 17.945a9.308 9.308 0 0 1 -1.022 .055c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6c-.195 .325 -.394 .636 -.596 .935" />
            <path d="M17 17v5" />
            <path d="M21 17v5" />
          </svg>
          
          {/* Indicador de estado */}
          {!inspectorMode && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Separador */}
        <div className="w-px h-8 bg-gray-600/50" />

        {/* Botón Show CSS - Solo modal, sin inspector */}
        <button 
          className={`relative p-3 rounded-xl transition-all duration-300 ease-out group min-w-[44px] min-h-[44px] flex items-center justify-center ${
            showCssPanel 
              ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20' 
              : (externalSelectedElement || selectedElement)
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/15'
              : 'text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 border border-transparent hover:shadow-md hover:shadow-blue-500/10'
          }`}
          onClick={showCss}
          title={
            showCssPanel 
              ? "Cerrar modal CSS" 
              : (externalSelectedElement || selectedElement)
              ? "Ver CSS del elemento seleccionado" 
              : "Selecciona un elemento primero con el Inspector"
          }
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`transition-all duration-300 ${
              showCssPanel ? 'rotate-12 scale-110' : 'group-hover:scale-105'
            }`}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          
          {/* Indicadores de estado */}
          {showCssPanel && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-500/50">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {selectedElement && !showCssPanel && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Dock principal de herramientas */}
      <div className="bg-gray-800/90 backdrop-blur-md border border-gray-600/50 rounded-2xl shadow-2xl p-2">
        <div className="flex items-center gap-1 cursor-grab active:cursor-grabbing select-none">
          {dockTools.map((tool, index) => (
            <React.Fragment key={tool.id}>
              <button
                className={`relative p-3 rounded-xl transition-all duration-200 group ${
                  tool.active 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20 scale-105' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white hover:scale-105 border border-transparent hover:border-gray-600/30'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToolClick(tool.id);
                }}
                title={tool.label}
              >
                {typeof tool.icon === 'string' ? (
                  <span className="text-sm font-bold transition-transform group-hover:scale-110">{tool.icon}</span>
                ) : (
                  <tool.icon size={16} className="transition-transform group-hover:scale-110" />
                )}
                
                {/* Indicador de herramienta activa mejorado */}
                {tool.active && (
                  <>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse" />
                  </>
                )}

                {/* Efecto de hover */}
                <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
              
              {/* Separador mejorado */}
              {index === dockTools.length - 2 && (
                <div className="w-px h-6 bg-gray-600/50 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
       </div>
      {/* Indicador de arrastre - ahora en la parte superior */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60" />
    </div>
  );
}

  // Nueva función para crear modal CSS simple y elegante
  const createCssModal = (element: HTMLElement, styles: CSSStyleDeclaration) => {
    // Remover modal existente si existe
    const existingModal = document.getElementById('css-pro-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Crear overlay del modal
    const overlay = document.createElement('div');
    overlay.id = 'css-pro-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    `;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: rgba(17, 24, 39, 0.98);
      border: 1px solid rgba(75, 85, 99, 0.6);
      border-radius: 16px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 13px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease-out;
    `;
    
    const importantStyles = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
      'border', 'borderRadius', 'boxShadow', 'transform', 'opacity',
      'flexDirection', 'alignItems', 'justifyContent', 'textAlign'
    ];
    
    modal.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      </style>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(75, 85, 99, 0.3); padding-bottom: 16px;">
        <div>
          <h3 style="margin: 0; color: #3b82f6; font-size: 18px; font-weight: 600;">CSS Properties</h3>
          <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">
            <strong style="color: #10b981;">${element.tagName.toLowerCase()}</strong>
            ${element.className ? `<span style="color: #f59e0b;">.${element.className.split(' ').join('.')}</span>` : ''}
            ${element.id ? `<span style="color: #ec4899;">#${element.id}</span>` : ''}
          </p>
        </div>
        <button id="close-css-modal" 
                style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; cursor: pointer; font-size: 18px; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
      </div>
      <div style="display: grid; gap: 12px;">
        ${importantStyles.map(prop => {
          const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          const value = styles.getPropertyValue(cssProperty);
          return value && value !== 'none' && value !== 'auto' && value !== 'normal' && value !== '' ? `
            <div style="background: rgba(55, 65, 81, 0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #8b5cf6; font-weight: 500;">${cssProperty}:</span>
                <button onclick="navigator.clipboard.writeText('${cssProperty}: ${value};')" 
                        style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; cursor: pointer; font-size: 10px; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;">Copy</button>
              </div>
              <div style="color: #f3f4f6; margin-top: 4px; word-break: break-all;">${value}</div>
            </div>
          ` : '';
        }).join('')}
      </div>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(75, 85, 99, 0.3); text-align: center;">
        <button onclick="navigator.clipboard.writeText(\`${importantStyles.map(prop => {
          const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          const value = styles.getPropertyValue(cssProperty);
          return value && value !== 'none' && value !== 'auto' && value !== 'normal' && value !== '' ? `${cssProperty}: ${value};` : '';
        }).filter(Boolean).join('\\n')}\`)" 
                style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 12px; transition: all 0.2s;">
          📋 Copiar todo el CSS
        </button>
      </div>
    `;
    
    // Cerrar modal al hacer clic en el overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        setShowCssPanel(false);
      }
    });
    
    // Cerrar modal con Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        overlay.remove();
        setShowCssPanel(false);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Hacer disponible la función para cerrar desde el botón
    (window as any).dockInstance = { setShowCssPanel };
  };