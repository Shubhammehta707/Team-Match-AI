import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { GraphEdge, GraphNode, StudentRole } from '../types/student';
import { ROLE_COLORS } from '../data/demoStudents';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sliders,
  Search,
  Filter,
  Info,
  Sparkles,
} from 'lucide-react';

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedStudentId?: string | null;
  onSelectStudent: (studentId: string) => void;
  threshold: number;
  onChangeThreshold: (val: number) => void;
  isLoading?: boolean;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  selectedStudentId,
  onSelectStudent,
  threshold,
  onChangeThreshold,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Calculate visible nodes based on active track and search filters
  let visibleNodes =
    activeRoleFilter === 'All'
      ? nodes
      : nodes.filter(
          (n) => n.isUser || n.role.toLowerCase() === activeRoleFilter.toLowerCase()
        );

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    visibleNodes = visibleNodes.filter(
      (n) =>
        n.label.toLowerCase().includes(query) ||
        n.skills.some((s) => s.toLowerCase().includes(query)) ||
        n.role.toLowerCase().includes(query) ||
        n.interests.some((i) => i.toLowerCase().includes(query))
    );
  }

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const filteredNodes = visibleNodes;
    const validNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
    );

    const elements: cytoscape.ElementDefinition[] = [
      ...filteredNodes.map((n) => ({
        group: 'nodes' as const,
        data: {
          id: n.id,
          label: n.label,
          role: n.role,
          color: n.color,
          isUser: n.isUser ? 'yes' : 'no',
        },
      })),
      ...filteredEdges.map((e) => {
        // Map edge color based on connectionType: violet for synergy, teal for interest, blue for skill
        const edgeColor =
          e.connectionType === 'synergy'
            ? '#8b5cf6'
            : e.connectionType === 'interest'
            ? '#0d9488'
            : '#2563eb';

        return {
          group: 'edges' as const,
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            weight: e.weight,
            label: e.label,
            edgeColor,
          },
        };
      }),
    ];

    // Destroy previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#0f172a',
            'font-family': 'Plus Jakarta Sans, system-ui, sans-serif',
            'font-size': '11px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-outline-width': 2,
            'text-outline-color': '#ffffff',
            'width': 34,
            'height': 34,
            'border-width': 2.5,
            'border-color': '#ffffff',
            'transition-property': 'background-color, border-color, border-width, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node[isUser = "yes"]',
          style: {
            'width': 42,
            'height': 42,
            'border-width': 3,
            'border-color': '#7c3aed',
            'font-size': '12px',
            'font-weight': 700,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#7c3aed',
            'border-opacity': 1,
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 3.5,
            'border-color': '#7c3aed',
            'opacity': 1,
          },
        },
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.2,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 'mapData(weight, 2, 7, 1.5, 3.8)',
            'line-color': 'data(edgeColor)',
            'curve-style': 'bezier',
            'opacity': 0.45,
            'transition-property': 'line-color, opacity, width',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 3.5,
            'opacity': 0.95,
            'z-index': 10,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.08,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        randomize: false,
        componentSpacing: 65,
        nodeOverlap: 25,
        idealEdgeLength: (edge: any) => 85 / (edge.data('weight') || 1),
        nodeRepulsion: () => 500000,
        edgeElasticity: (edge: any) => 100 * (edge.data('weight') || 1),
        nestingFactor: 1.2,
        gravity: 30,
        numIter: 400,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    // Event listeners
    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      const nodeId = node.id();
      highlightNeighborhood(cy, node);
      onSelectStudent(nodeId);
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        resetHighlight(cy);
      }
    });

    cy.on('mouseover', 'node', (evt: EventObject) => {
      const targetId = evt.target.id();
      const nodeData = nodes.find((n) => n.id === targetId);
      if (nodeData) {
        setHoveredNode(nodeData);
      }
    });

    cy.on('mouseout', 'node', () => {
      setHoveredNode(null);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, activeRoleFilter, searchQuery]);

  // Synchronize external selection
  useEffect(() => {
    if (!cyRef.current || !selectedStudentId) return;
    const node = cyRef.current.getElementById(selectedStudentId);
    if (node && node.length > 0) {
      cyRef.current.$(':selected').unselect();
      node.select();
      highlightNeighborhood(cyRef.current, node);
      cyRef.current.animate({
        center: { eles: node },
        zoom: 1.25,
        duration: 300,
      });
    }
  }, [selectedStudentId]);

  const highlightNeighborhood = (cy: Core, centerNode: cytoscape.NodeSingular) => {
    const neighborhood = centerNode.neighborhood().add(centerNode);
    cy.elements().removeClass('highlighted dimmed');
    cy.elements().not(neighborhood).addClass('dimmed');
    neighborhood.addClass('highlighted');
  };

  const resetHighlight = (cy: Core) => {
    cy.elements().removeClass('highlighted dimmed');
    setHoveredNode(null);
  };

  const handleZoomIn = () => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      zoom: cyRef.current.zoom() * 1.3,
      duration: 200,
    });
  };

  const handleZoomOut = () => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      zoom: cyRef.current.zoom() * 0.75,
      duration: 200,
    });
  };

  const handleFit = () => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      fit: { eles: cyRef.current.elements(), padding: 35 },
      duration: 250,
    });
  };

  const handleResetLayout = () => {
    if (!cyRef.current) return;
    resetHighlight(cyRef.current);
    const layout = cyRef.current.layout({
      name: 'cose',
      animate: true,
      animationDuration: 400,
      nodeRepulsion: () => 500000,
    });
    layout.run();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Student Collaboration Network
            </h3>
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 font-mono tabular-nums">
              {nodes.length} nodes · {edges.length} connections
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Interactive topological network. Edges represent shared passions, complementary roles, and common goals. Click any node to inspect.
          </p>
        </div>

        {/* Search & Graph Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Field */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or skill..."
              className="rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 w-44 sm:w-52 transition-all"
            />
          </div>

          {/* Threshold Slider */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs">
            <Sliders className="h-3.5 w-3.5 text-violet-600 shrink-0" />
            <span className="text-slate-500 whitespace-nowrap">Filter:</span>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={threshold}
              onChange={(e) => onChangeThreshold(Number(e.target.value))}
              className="w-16 accent-violet-600 cursor-pointer"
              title={`Connection filter: Weight >= ${threshold}`}
            />
            <span className="font-mono text-slate-800 text-[11px] font-bold tabular-nums">
              {threshold >= 3 ? 'High' : threshold === 2 ? 'Med' : 'All'}
            </span>
          </div>

          {/* Canvas Buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 p-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-2xs transition-all cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-2xs transition-all cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleFit}
              title="Fit to Screen"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-2xs transition-all cursor-pointer"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetLayout}
              title="Reset Layout & Selection"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold mr-1 whitespace-nowrap">
          Filter Track:
        </span>
        {['All', 'AI/ML', 'Designer', 'Frontend', 'Backend', 'Data', 'Product'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRoleFilter(role)}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeRoleFilter === role
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Cytoscape Canvas Area with Light Background */}
      <div className="relative mt-3 h-[480px] w-full rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden shadow-inner">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
            <span className="mt-3 text-xs font-semibold text-slate-700">
              Generating student network topology...
            </span>
          </div>
        )}

        <div ref={containerRef} className="h-full w-full" />

        {/* Empty state when search or role filters match 0 nodes */}
        {visibleNodes.length === 0 && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/90 backdrop-blur-xs">
            <Search className="h-8 w-8 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No matching student nodes</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              No students found matching your search term or role filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveRoleFilter('All');
              }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Hovered Node Floating Card */}
        {hoveredNode && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md max-w-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <span className="text-xs font-bold text-slate-900">{hoveredNode.label}</span>
              <span className="text-[11px] font-medium text-slate-500">({hoveredNode.role})</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-600 truncate">
              Skills: {hoveredNode.skills.join(', ')}
            </div>
            <div className="text-[11px] text-slate-500 truncate">Goal: {hoveredNode.goal}</div>
          </div>
        )}

        {/* Graph Legend Overlay: Explaining Nodes and Edges */}
        <div className="absolute top-3 right-3 z-10 hidden sm:flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-md text-[11px]">
          <div>
            <div className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1">
              Role Nodes
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-600" />
                <span>AI/ML</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-600" />
                <span>Designer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-600" />
                <span>Frontend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Backend</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1.5">
            <div className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1">
              Connection Edges
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-violet-500" />
                <span>Role Synergy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-teal-500" />
                <span>Shared Interest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-blue-500" />
                <span>Skill Foundation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
