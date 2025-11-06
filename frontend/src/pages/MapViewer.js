import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ArrowLeft,
  Save,
  Download,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Custom node component - Fixed to use memo and proper props
const CustomNode = React.memo(({ data, id }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} id={`${id}-target`} />
      <div
        className="px-6 py-4 shadow-lg rounded-xl border-2 bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-600 min-w-[200px] max-w-[300px]"
        style={{ cursor: 'pointer' }}
      >
        <div className="font-semibold text-slate-900 dark:text-white mb-2">
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-3">
            {data.description}
          </div>
        )}
        {data.resources && data.resources.length > 0 && (
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            {data.resources.length} resources
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id={`${id}-source`} />
    </>
  );
});

CustomNode.displayName = 'CustomNode';

// Layout function using dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const MapViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mapId } = useParams();
  const { getAuthHeaders } = useAuth();
  const { theme } = useTheme();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');

  // Memoize nodeTypes to prevent recreation - THIS IS CRITICAL
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    const initMap = async () => {
      if (mapId === 'new' && location.state?.mapData) {
        // New generated map
        const { mapData, topic: mapTopic, level: mapLevel } = location.state;
        setTopic(mapTopic);
        setLevel(mapLevel);
        processMapData(mapData);
      } else if (mapId && mapId !== 'new') {
        // Load existing map
        await loadMap(mapId);
      }
    };

    initMap();
  }, [mapId, location.state]);

  const processMapData = (mapData) => {
    const processedNodes = mapData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      data: {
        label: node.label,
        description: node.description,
        resources: node.resources || [],
      },
      position: { x: 0, y: 0 },
    }));

    const processedEdges = mapData.edges.map((edge, index) => ({
      id: `e${index}-${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      animated: true,
      style: { stroke: theme === 'dark' ? '#60a5fa' : '#3b82f6', strokeWidth: 2 },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      processedNodes,
      processedEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const loadMap = async (id) => {
    try {
      const response = await axios.get(`${API}/maps/${id}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        const map = response.data.map;
        setTopic(map.topic);
        setLevel(map.level);
        setNodes(map.nodes);
        setEdges(map.edges);
      }
    } catch (error) {
      console.error('Error loading map:', error);
      toast.error('Failed to load learning map');
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleExpandNode = async () => {
    if (!selectedNode) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/expand-node`,
        {
          node_label: selectedNode.data.label,
          topic,
          level,
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const subtopics = response.data.subtopics;
        
        // Create new nodes for subtopics with unique IDs
        const newNodes = subtopics.map((subtopic, index) => ({
          id: `${selectedNode.id}-sub-${Date.now()}-${index}`, // Ensure unique IDs
          type: 'custom',
          data: {
            label: subtopic.label,
            description: subtopic.description,
            resources: subtopic.resources || [],
          },
          position: { x: 0, y: 0 }, // Temporary position, will be recalculated
        }));

        // Create edges from parent to subtopics with unique IDs
        const newEdges = newNodes.map((newNode) => ({
          id: `e-${selectedNode.id}-${newNode.id}`,
          source: selectedNode.id,
          target: newNode.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: theme === 'dark' ? '#60a5fa' : '#3b82f6', strokeWidth: 2 },
        }));

        // Combine all nodes and edges
        const updatedNodes = [...nodes, ...newNodes];
        const updatedEdges = [...edges, ...newEdges];

        // Recalculate layout with dagre to prevent overlapping
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          updatedNodes,
          updatedEdges
        );

        // Update nodes and edges with new layout
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
        toast.success('Node expanded successfully!');
        setSelectedNode(null);
      }
    } catch (error) {
      console.error('Error expanding node:', error);
      toast.error('Failed to expand node');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMap = async () => {
    setSaving(true);
    try {
      const response = await axios.post(
        `${API}/maps/save`,
        {
          topic,
          level,
          nodes,
          edges,
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('Learning map saved successfully!');
      }
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save learning map');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      topic,
      level,
      nodes,
      edges,
      exported_at: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-map-${topic.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Map exported successfully!');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              data-testid="back-btn"
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{topic}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{level} Level</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              data-testid="save-map-btn"
              variant="outline"
              size="sm"
              onClick={handleSaveMap}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            <Button
              data-testid="export-map-btn"
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50 dark:bg-slate-900"
        >
          <Controls />
          <MiniMap
            nodeColor={(n) => (theme === 'dark' ? '#1e293b' : '#ffffff')}
            maskColor={theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0, 0, 0, 0.1)'}
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {/* Selected Node Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 z-10">
            <Card className="shadow-xl">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {selectedNode.data.label}
                  </h3>
                  <button
                    data-testid="close-node-panel-btn"
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedNode.data.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                    {selectedNode.data.description}
                  </p>
                )}
                
                {selectedNode.data.resources && selectedNode.data.resources.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Learning Resources:
                    </h4>
                    <ul className="space-y-1">
                      {selectedNode.data.resources.map((resource, index) => (
                        <li key={index} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button
                  data-testid="expand-node-btn"
                  onClick={handleExpandNode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Expanding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Expand Node
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapViewer;