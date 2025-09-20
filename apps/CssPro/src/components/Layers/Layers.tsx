import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Eye, Copy, Search, X, Code, Target } from 'lucide-react';

interface LayersProps {
  selectedElement?: HTMLElement | null;
  onElementSelect?: (element: HTMLElement) => void;
  onClose?: () => void;
}

interface ElementNode {
  element: HTMLElement;
  tagName: string;
  id?: string;
  className?: string;
  children: ElementNode[];
  depth: number;
  isExpanded: boolean;
}

export default function Layers({ selectedElement, onElementSelect, onClose }: LayersProps) {
  const [elementTree, setElementTree] = useState<ElementNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<HTMLElement>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Función para construir el árbol de elementos
  const buildElementTree = (element: HTMLElement, depth = 0): ElementNode => {
    const children: ElementNode[] = [];
    
    // Solo incluir elementos HTML, no text nodes
    Array.from(element.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        // Filtrar elementos del CSS Pro para no mostrarlos en el árbol
        if (!child.closest('[data-csspro]') && 
            !child.classList.contains('csspro-dock') &&
            !child.classList.contains('csspro-panel')) {
          children.push(buildElementTree(child, depth + 1));
        }
      }
    });

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      children,
      depth,
      isExpanded: expandedNodes.has(element)
    };
  };

  // Función para actualizar el árbol de elementos
  const updateElementTree = () => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      const tree = buildElementTree(body);
      setElementTree([tree]);
    }
  };

  // Observar cambios en el DOM
  useEffect(() => {
    updateElementTree();

    const observer = new MutationObserver(() => {
      updateElementTree();
    });

    if (typeof document !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id']
      });
    }

    return () => observer.disconnect();
  }, [expandedNodes]);

  // Función para alternar expansión de nodos
  const toggleExpanded = (element: HTMLElement) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(element)) {
      newExpanded.delete(element);
    } else {
      newExpanded.add(element);
    }
    setExpandedNodes(newExpanded);
  };

  // Función para manejar hover sobre elementos
  const handleElementHover = (element: HTMLElement | null) => {
    // Remover highlight anterior
    if (hoveredElement) {
      hoveredElement.style.outline = '';
    }

    // Agregar highlight al nuevo elemento
    if (element) {
      element.style.outline = '2px solid #3b82f6';
      element.style.outlineOffset = '2px';
    }

    setHoveredElement(element);
  };

  // Función para seleccionar elemento
  const handleElementClick = (element: HTMLElement) => {
    if (onElementSelect) {
      onElementSelect(element);
    }
  };

  // Función para copiar selector CSS
  const copySelector = (element: HTMLElement) => {
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      selector = `#${element.id}`;
    } else if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        selector = `${selector}.${classes.join('.')}`;
      }
    }

    navigator.clipboard.writeText(selector);
    console.log(`Selector copiado: ${selector}`);
  };

  // Función para copiar HTML del elemento
  const copyHTML = (element: HTMLElement) => {
    navigator.clipboard.writeText(element.outerHTML);
    console.log('HTML copiado al portapapeles');
  };

  // Función para filtrar elementos por búsqueda
  const filterElements = (nodes: ElementNode[], term: string): ElementNode[] => {
    if (!term) return nodes;

    return nodes.reduce((filtered: ElementNode[], node) => {
      const matchesSearch = 
        node.tagName.includes(term.toLowerCase()) ||
        (node.id && node.id.toLowerCase().includes(term.toLowerCase())) ||
        (node.className && node.className.toLowerCase().includes(term.toLowerCase()));

      const filteredChildren = filterElements(node.children, term);

      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });
      }

      return filtered;
    }, []);
  };

  // Renderizar nodo del árbol
  const renderTreeNode = (node: ElementNode) => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedElement === node.element;
    const isHovered = hoveredElement === node.element;

    return (
      <div key={`${node.tagName}-${node.element.getAttribute('data-key') || Math.random()}`} className="select-none">
        <div
          className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
          } ${isHovered ? 'bg-gray-50' : ''}`}
          style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
          onMouseEnter={() => handleElementHover(node.element)}
          onMouseLeave={() => handleElementHover(null)}
          onClick={() => handleElementClick(node.element)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.element);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {node.isExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-4" />}
          
          <span className="text-blue-600 font-mono text-sm">{node.tagName}</span>
          
          {node.id && (
            <span className="text-green-600 font-mono text-xs">#{node.id}</span>
          )}
          
          {node.className && (
            <span className="text-purple-600 font-mono text-xs">
              .{node.className.split(' ').slice(0, 2).join('.')}
            </span>
          )}

          <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copySelector(node.element);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copiar selector"
            >
              <Target size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyHTML(node.element);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copiar HTML"
            >
              <Code size={10} />
            </button>
          </div>
        </div>

        {hasChildren && node.isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = filterElements(elementTree, searchTerm);

  return (
    <div 
      ref={containerRef}
      className="fixed top-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col"
      data-csspro="layers-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Capas HTML</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="group">
          {filteredTree.map(node => renderTreeNode(node))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
        {selectedElement ? (
          <div>
            Seleccionado: <span className="font-mono">{selectedElement.tagName.toLowerCase()}</span>
            {selectedElement.id && <span className="text-green-600">#{selectedElement.id}</span>}
          </div>
        ) : (
          'Selecciona un elemento para ver detalles'
        )}
      </div>
    </div>
  );
}