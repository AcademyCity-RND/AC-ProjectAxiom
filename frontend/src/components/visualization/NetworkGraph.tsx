import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Share2, Filter, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';
import type { CytoscapeGraphData, CytoscapeNode, CytoscapeEdge } from '../../types';

interface NetworkGraphProps {
  graphData?: CytoscapeGraphData | null;
  onSelectNode?: (nodeInfo: any) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graphData,
  onSelectNode,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'cib' | 'interaction'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Jika belum ada data graf jejaring -> Tactical Empty State
  if (!graphData || !graphData.elements?.nodes?.length) {
    return (
      <div className="cyber-card p-16 flex flex-col items-center justify-center text-center space-y-4 bg-[#090D16]/60 border border-[#1E293B]">
        <div className="w-12 h-12 rounded-lg bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Share2 className="w-6 h-6" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-white uppercase font-mono">
            GRAF JEJARING BELUM TERPILIH
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pilih kasus investigasi dari menu Beranda atau Direktori Target untuk merender visualisasi Social Network Analysis (SNA), pemetaan akun sentral, dan klaster copypasta CIB.
          </p>
        </div>
      </div>
    );
  }

  const rawNodes = graphData.elements.nodes;
  const rawEdges = graphData.elements.edges || [];

  // Filter edges based on selector
  const filteredRawEdges = useMemo(() => {
    if (filterType === 'cib') {
      return rawEdges.filter((e) => e.data.link_type === 'semantic_cib' || e.data.weight >= 0.85);
    }
    if (filterType === 'interaction') {
      return rawEdges.filter((e) => e.data.link_type !== 'semantic_cib');
    }
    return rawEdges;
  }, [rawEdges, filterType]);

  // Layout conversion: Radial layout around center (400, 260)
  const initialNodes: Node[] = useMemo(() => {
    const center = { x: 380, y: 240 };
    const radius = 180;
    const nonTargetNodes = rawNodes.filter((n) => n.data.id !== 'target' && n.data.type !== 'target');
    const angleStep = (2 * Math.PI) / (nonTargetNodes.length || 1);

    const nodesList: Node[] = [];

    // 1. Target Node at Center
    const targetNode = rawNodes.find((n) => n.data.id === 'target' || n.data.type === 'target') || rawNodes[0];
    if (targetNode) {
      nodesList.push({
        id: targetNode.data.id,
        position: { x: center.x - 70, y: center.y - 25 },
        data: {
          label: (
            <div className="px-3 py-2 bg-[#0F172A] border-2 border-[#38BDF8] rounded-md shadow-lg text-center select-none cursor-pointer">
              <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
                TARGET INTI
              </div>
              <div className="text-xs font-mono font-bold text-white truncate max-w-[130px]">
                {targetNode.data.label}
              </div>
              {targetNode.data.confidence && (
                <div className="text-[9px] font-mono tabular-nums text-slate-300">
                  Skor: {Math.round(targetNode.data.confidence * 100)}%
                </div>
              )}
            </div>
          ),
          raw: targetNode.data,
        },
      });
    }

    // 2. Peripheral Member Nodes
    nonTargetNodes.forEach((n, idx) => {
      const angle = idx * angleStep;
      const x = center.x + radius * Math.cos(angle) - 60;
      const y = center.y + radius * Math.sin(angle) - 20;

      const cat = (n.data.category || 'UNKNOWN').toUpperCase();
      let borderColor = 'border-slate-700';
      let bgColor = 'bg-[#0F172A]';
      let textColor = 'text-slate-300';
      let dotColor = 'bg-slate-400';

      if (cat === 'BOT') {
        borderColor = 'border-rose-500/50';
        bgColor = 'bg-rose-950/30';
        textColor = 'text-[#F87171]';
        dotColor = 'bg-rose-400';
      } else if (cat === 'BUZZER') {
        borderColor = 'border-amber-500/50';
        bgColor = 'bg-amber-950/30';
        textColor = 'text-[#FBBF24]';
        dotColor = 'bg-amber-400';
      } else if (cat === 'HUMAN') {
        borderColor = 'border-emerald-500/50';
        bgColor = 'bg-emerald-950/30';
        textColor = 'text-[#34D399]';
        dotColor = 'bg-emerald-400';
      }

      nodesList.push({
        id: n.data.id,
        position: { x, y },
        data: {
          label: (
            <div
              className={`px-2.5 py-1.5 ${bgColor} border ${borderColor} rounded-md text-left select-none cursor-pointer hover:border-sky-400 transition-colors`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold">
                  {cat}
                </span>
              </div>
              <div className={`text-xs font-mono font-medium truncate max-w-[120px] ${textColor}`}>
                {n.data.label}
              </div>
              {n.data.confidence && (
                <div className="text-[9px] font-mono tabular-nums text-slate-400">
                  Conf: {Math.round(n.data.confidence * 100)}%
                </div>
              )}
            </div>
          ),
          raw: n.data,
        },
      });
    });

    return nodesList;
  }, [rawNodes]);

  // Edges Conversion
  const initialEdges: Edge[] = useMemo(() => {
    return filteredRawEdges.map((e) => {
      const isCib = Boolean(e.data.link_type === 'semantic_cib' || e.data.weight >= 0.85);
      const isSelected = Boolean(selectedNodeId && (e.data.source === selectedNodeId || e.data.target === selectedNodeId));

      return {
        id: e.data.id,
        source: e.data.source,
        target: e.data.target,
        animated: Boolean(isCib || isSelected),
        label: e.data.label,
        labelStyle: {
          fill: isSelected ? '#38BDF8' : '#94A3B8',
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#090D16',
          fillOpacity: 0.8,
        },
        style: {
          stroke: isSelected ? '#38BDF8' : isCib ? '#F59E0B' : '#334155',
          strokeWidth: isSelected ? 2 : isCib ? 1.5 : 1,
          opacity: isSelected ? 1 : isCib ? 0.75 : 0.35,
          strokeDasharray: isCib ? '4,4' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSelected ? '#38BDF8' : isCib ? '#F59E0B' : '#334155',
          width: 12,
          height: 12,
        },
      };
    });
  }, [filteredRawEdges, selectedNodeId]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Sync state when raw data changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (onSelectNode && node.data?.raw) {
      onSelectNode(node.data.raw);
    }
  };

  return (
    <div className="cyber-card p-4 space-y-3 flex flex-col h-[560px]">
      {/* Graph Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B] shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
              SOCIAL NETWORK ANALYSIS (SNA)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              &bull; Cosine Similarity &ge; 0.85
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            Topologi Klaster Sindikat CIB (Coordinated Inauthentic Behavior)
          </h2>
        </div>

        {/* Filter Controls & Stats */}
        <div className="flex items-center gap-2">
          {/* Edge Filter Dropdown */}
          <div className="flex items-center p-0.5 bg-[#090D16] border border-[#1E293B] rounded text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-[#1E293B] text-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({rawEdges.length})
            </button>
            <button
              onClick={() => setFilterType('cib')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'cib'
                  ? 'bg-[#1E293B] text-amber-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Klaster CIB
            </button>
            <button
              onClick={() => setFilterType('interaction')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'interaction'
                  ? 'bg-[#1E293B] text-slate-200 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interaksi Lain
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div className="flex-1 rounded border border-[#1E293B] bg-[#090D16] relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-left"
          className="axiom-network-flow"
        >
          <Background
            color="#1E293B"
            gap={20}
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls
            showInteractive={false}
            className="bg-[#0F172A]! border-[#1E293B]! rounded! text-slate-300!"
          />
        </ReactFlow>

        {/* Legend Overlay (Clean, Low Noise) */}
        <div className="absolute bottom-3 right-3 bg-[#0F172A]/90 backdrop-blur-sm border border-[#1E293B] p-2.5 rounded text-[11px] font-mono space-y-1.5 pointer-events-none select-none">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Legenda Node</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-sky-400"></span>
            <span className="text-white">Target Utama</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-amber-400"></span>
            <span className="text-slate-300">Buzzer Terkoordinasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-rose-400"></span>
            <span className="text-slate-300">Bot Otomatis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-emerald-400"></span>
            <span className="text-slate-300">Organik / Human</span>
          </div>
        </div>
      </div>

      {/* Footer Info Notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 shrink-0">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          Klik node mana pun untuk memeriksa profil & bobot keterpautan CIB di Inspector Drawer.
        </span>
        <span className="tabular-nums">
          Nodes: {rawNodes.length} &bull; Edges: {filteredRawEdges.length}
        </span>
      </div>
    </div>
  );
};
