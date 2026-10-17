/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, Network, Database, RefreshCw, Filter, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GraphData, GraphNode, GraphEdge } from './types';

export const GraphViewer: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/graph');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch graph data');
      }
      setGraphData(json.data);
      if (json.data?.nodes?.length > 0 && !selectedNode) {
        setSelectedNode(json.data.nodes[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const studentNodes = nodes.filter((n) => n.type === 'Student');
  const skillNodes = nodes.filter((n) => n.type === 'Skill');
  const interestNodes = nodes.filter((n) => n.type === 'Interest');
  const projectNodes = nodes.filter((n) => n.type === 'Project');

  const filteredNodes = nodes.filter((node) => {
    const matchesType = selectedType === 'ALL' || node.type === selectedType;
    const matchesSearch =
      !searchQuery ||
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate connected edges for selected node
  const connectedEdges = selectedNode
    ? edges.filter(
        (e) =>
          e.source === selectedNode.id ||
          e.target === selectedNode.id ||
          e.target === `skill:${selectedNode.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}` ||
          e.target === `interest:${selectedNode.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}` ||
          e.target === `proj:${selectedNode.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      )
    : [];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Student':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
      case 'Skill':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'Interest':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/40';
      case 'Project':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Graph Database Schema & Relationships</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
              GET /api/graph
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Schema: <code className="text-indigo-300 font-mono">(:Student)-[:HAS_SKILL]-&gt;(:Skill)</code>, <code className="text-pink-300 font-mono">(:Student)-[:INTERESTED_IN]-&gt;(:Interest)</code>, <code className="text-amber-300 font-mono">(:Student)-[:WORKING_ON]-&gt;(:Project)</code>
          </p>
        </div>

        <button
          onClick={fetchGraph}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          Refresh Graph
        </button>
      </div>

      {/* Graph Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400">Student Nodes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-indigo-400">{studentNodes.length}</span>
            <span className="text-[11px] text-slate-500">(:Student)</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400">Skill Nodes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">{skillNodes.length}</span>
            <span className="text-[11px] text-slate-500">(:Skill)</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400">Interest Nodes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-pink-400">{interestNodes.length}</span>
            <span className="text-[11px] text-slate-500">(:Interest)</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400">Project Nodes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">{projectNodes.length}</span>
            <span className="text-[11px] text-slate-500">(:Project)</span>
          </div>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Nodes List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter nodes by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48"
                />
              </div>

              {/* Type pills */}
              <div className="flex flex-wrap gap-1">
                {['ALL', 'Student', 'Skill', 'Interest', 'Project'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      selectedType === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing {filteredNodes.length} of {nodes.length} nodes (Click any node to inspect relationships)
            </div>

            {/* Nodes Container */}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${getNodeColor(node.type)}`}>
                        {node.type}
                      </span>
                      <span className="font-medium text-sm text-slate-100">{node.label}</span>
                    </div>

                    <div className="text-right text-xs text-slate-500 font-mono">
                      {node.id}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Node Details & Connected Edges Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Network className="w-4 h-4 text-indigo-400" />
              Node Inspector & Relationships
            </h3>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Node Label:</span>
                    <span className="text-sm font-bold text-white">{selectedNode.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-400 font-medium">Type:</span>
                    <span className={`px-2 py-0.5 rounded border font-semibold ${getNodeColor(selectedNode.type)}`}>
                      {selectedNode.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-400 font-medium">Internal ID:</span>
                    <code className="text-slate-300 font-mono">{selectedNode.id}</code>
                  </div>
                </div>

                {/* Properties */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-300">Node Properties:</span>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                    {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="text-indigo-300 font-mono">{key}:</span>
                        <span className="text-slate-200">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected Edges */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-300">
                    Connected Relationships ({connectedEdges.length}):
                  </span>
                  {connectedEdges.length === 0 ? (
                    <p className="text-slate-500 italic">No direct edges found in active view.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {connectedEdges.map((edge) => (
                        <div
                          key={edge.id}
                          className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px]"
                        >
                          <span className="font-mono text-slate-400 truncate max-w-[90px]">
                            {edge.source}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-300 font-bold border border-indigo-900/50">
                            -[:{edge.label}]-&gt;
                          </span>
                          <span className="font-mono text-slate-400 truncate max-w-[90px]">
                            {edge.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select a node from the left list to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
