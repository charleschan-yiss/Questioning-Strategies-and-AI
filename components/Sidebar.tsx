
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { strategies } from '../data/strategies';
import { SavedPlan, StrategyNode } from '../types';
import { ChevronRight, ChevronDown, BookOpen, Brain, Zap, MessageCircle, CheckSquare, Square, Folder, ChevronLeft, Menu, FileText, Trash2, Calendar, Layout, FolderOpen, Pencil, Check, X, Info, Download, Upload, Search } from 'lucide-react';

interface SidebarProps {
  onToggleStrategy: (id: string) => void;
  selectedIds: string[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  allowCollapse?: boolean;
  savedPlans: SavedPlan[];
  onLoadPlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string) => void;
  onRenamePlan: (id: string, newName: string) => void;
  currentPlanId: string | null;
  onNewPlan: () => void;
  onImportPlan: (plan: SavedPlan) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

const getIcon = (id: string) => {
  if (id.includes('paq')) return <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />;
  if (id.includes('blooms')) return <Brain className="w-4 h-4 mr-2 text-purple-500" />;
  if (id.includes('mnemonics')) return <Zap className="w-4 h-4 mr-2 text-yellow-500" />;
  if (id.includes('cort')) return <BookOpen className="w-4 h-4 mr-2 text-blue-500" />;
  if (id.includes('questioning')) return <MessageCircle className="w-4 h-4 mr-2 text-green-500" />;
  return <Folder className="w-4 h-4 mr-2 text-slate-400" />;
};

// Helper to recursively check if a node has any selected descendants
const hasSelectedDescendant = (node: StrategyNode, selectedIds: string[]): boolean => {
    if (selectedIds.includes(node.id)) return true;
    if (node.children) {
        return node.children.some(child => hasSelectedDescendant(child, selectedIds));
    }
    return false;
};

const TreeNode: React.FC<{ 
  node: StrategyNode; 
  onToggle: (id: string) => void; 
  selectedIds: string[];
  level: number;
  forceExpand?: boolean;
}> = ({ node, onToggle, selectedIds, level, forceExpand }) => {
  const [isOpen, setIsOpen] = useState(false); // Default closed for cleaner look
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedIds.includes(node.id);

  // Auto-expand if ANY descendant is selected (Deep check)
  useEffect(() => {
    if (hasChildren && hasSelectedDescendant(node, selectedIds)) {
        setIsOpen(true);
    }
  }, [selectedIds, hasChildren, node]);

  // Auto-expand on search
  useEffect(() => {
    if (forceExpand) {
        setIsOpen(true);
    }
  }, [forceExpand]);

  return (
    <div className="select-none" id={`strategy-node-${node.id}`}>
      <div 
        onClick={(e) => {
             // If has children, toggle fold. If leaf, toggle selection.
             if (hasChildren) {
                 setIsOpen(!isOpen);
             } else {
                 onToggle(node.id);
             }
        }}
        className={`
          flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 text-sm
          ${isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <span className="opacity-70 flex-shrink-0 mr-1">
            {hasChildren ? (
                isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
            ) : (
                // Checkbox for leaf nodes
                <div 
                    onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                    className="hover:text-green-500"
                >
                   {isSelected ? (
                       <CheckSquare className="w-4 h-4 text-green-600" />
                   ) : (
                       <Square className="w-4 h-4 text-slate-300" />
                   )}
                </div>
            )}
        </span>
        
        {/* Only show category icon for parents */}
        {hasChildren && getIcon(node.id)}
        
        <span className="truncate">{node.label}</span>
      </div>

      {hasChildren && isOpen && (
        <div className="border-l border-slate-200 ml-6">
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onToggle={onToggle} 
              selectedIds={selectedIds}
              level={level + 1} 
              forceExpand={forceExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
    onToggleStrategy, 
    selectedIds, 
    isCollapsed, 
    onToggleCollapse, 
    allowCollapse = false,
    savedPlans,
    onLoadPlan,
    onDeletePlan,
    onRenamePlan,
    currentPlanId,
    onNewPlan,
    onImportPlan,
    width,
    onWidthChange
}) => {
  const [activeTab, setActiveTab] = useState<'strategies' | 'plans'>('strategies');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const prevSelectedIdsRef = useRef<string[]>([]);
  
  // Watch for new selections and scroll to them
  useEffect(() => {
    // Find newly added IDs
    const newIds = selectedIds.filter(id => !prevSelectedIdsRef.current.includes(id));
    
    if (newIds.length > 0) {
        // Scroll to the last added one
        const lastId = newIds[newIds.length - 1];
        setTimeout(() => {
            const element = document.getElementById(`strategy-node-${lastId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: Flash effect could be added here via class manipulation
            }
        }, 100); // Small delay to allow tree expansion to render
    }
    
    prevSelectedIdsRef.current = selectedIds;
  }, [selectedIds]);
  
  // Resizable logic handled by parent via props
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = () => {
      isResizingRef.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection
  };

  const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) {
          onWidthChange(newWidth);
      }
  };

  const stopResizing = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
  };

  const startEditing = (plan: SavedPlan) => {
    setEditingPlanId(plan.id);
    setEditName(plan.name);
  };

  const saveEditing = (id: string) => {
    if (editName.trim()) {
        onRenamePlan(id, editName.trim());
    }
    setEditingPlanId(null);
  };

  const cancelEditing = () => {
    setEditingPlanId(null);
    setEditName('');
  };

  const handleExportPlan = (plan: SavedPlan) => {
      const dataStr = JSON.stringify(plan, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      const versionStr = `v${plan.versions.length}`;
      const safeName = plan.name.replace(/[^a-z0-9\-_]/gi, '_');

      a.download = `${safeName}_${versionStr}_${dateStr}.yiss.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              // Basic validation
              if (json.id && json.name && json.data) {
                  onImportPlan(json);
              } else {
                  alert("Invalid lesson plan file.");
              }
          } catch (error) {
              console.error("Error parsing JSON", error);
              alert("Failed to import plan.");
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filterStrategies = (nodes: StrategyNode[], term: string): StrategyNode[] => {
    const lowerTerm = term.toLowerCase();
    
    const filterNode = (node: StrategyNode): StrategyNode | null => {
        const matchesSelf = node.label.toLowerCase().includes(lowerTerm);
        
        let filteredChildren: StrategyNode[] = [];
        if (node.children) {
              filteredChildren = node.children.map(filterNode).filter((n): n is StrategyNode => n !== null);
        }
        
        if (matchesSelf || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren.length > 0 ? filteredChildren : (node.children ? [] : undefined) };
        }
        return null;
    };

    return nodes.map(filterNode).filter((n): n is StrategyNode => n !== null);
  };

  const displayedStrategies = useMemo(() => {
    if (!searchTerm) return strategies;
    return filterStrategies(strategies, searchTerm);
  }, [searchTerm]);

  return (
    <div 
        ref={sidebarRef}
        className="bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0 transition-all duration-75 ease-linear relative"
        style={{ width: isCollapsed ? '4rem' : `${width}px` }}
    >
      
      {/* Header */}
      <div className={`p-4 border-b border-slate-100 bg-slate-50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Workspace</h2>
                <button 
                    onClick={onNewPlan}
                    className="text-xs bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                >
                    + New Plan
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex p-1 bg-slate-200/50 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('strategies')}
                    className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'strategies' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <Layout className="w-3.5 h-3.5 mr-1.5" /> Strategies
                  </button>
                  <button 
                    onClick={() => setActiveTab('plans')}
                    className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'plans' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <FolderOpen className="w-3.5 h-3.5 mr-1.5" /> My Plans
                  </button>
              </div>
          </div>
        )}
        
        {allowCollapse && (
            <button 
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors ${isCollapsed ? '' : 'ml-2 self-start'}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {!isCollapsed ? (
          activeTab === 'strategies' ? (
            <>
                <div className="px-3 mb-2 sticky top-0 bg-white z-10 pb-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search strategies..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                {displayedStrategies.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm px-4">
                        No strategies match "{searchTerm}"
                    </div>
                ) : (
                    displayedStrategies.map((strategy) => (
                        <TreeNode 
                        key={strategy.id} 
                        node={strategy} 
                        onToggle={onToggleStrategy}
                        selectedIds={selectedIds}
                        level={0}
                        forceExpand={searchTerm.length > 0}
                        />
                    ))
                )}
            </>
          ) : (
            // Saved Plans List
            <div className="px-3 space-y-2">
                <div className="flex justify-end mb-2">
                    <button 
                        onClick={handleImportClick}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100"
                    >
                        <Download className="w-3 h-3 mr-1" /> Import Plan
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>

                {savedPlans.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No saved plans yet.<br/>Generate and save a plan to see it here.
                    </div>
                ) : (
                    savedPlans.map(plan => (
                        <div 
                            key={plan.id}
                            onClick={() => {
                                if (editingPlanId !== plan.id) onLoadPlan(plan);
                            }}
                            className={`
                                group p-3 rounded-lg border transition-all cursor-pointer relative min-h-[70px]
                                ${currentPlanId === plan.id 
                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' 
                                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                                }
                            `}
                        >
                            {editingPlanId === plan.id ? (
                                <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="flex-1 text-sm border border-blue-300 rounded px-2 py-1 outline-none bg-white text-slate-900"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') saveEditing(plan.id);
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                    />
                                    <button onClick={() => saveEditing(plan.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={cancelEditing} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="pr-14">
                                        <h3 className={`text-sm font-semibold mb-1 truncate ${currentPlanId === plan.id ? 'text-blue-800' : 'text-slate-700'}`}>
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-center text-[10px] text-slate-400 space-x-2">
                                            <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(plan.updatedAt).toLocaleDateString()}
                                            </span>
                                            {plan.versions.length > 0 && (
                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                    v{plan.versions.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-md">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleExportPlan(plan); }}
                                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            title="Export Backup"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); startEditing(plan); }}
                                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Rename Plan"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete Plan"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center pt-4 space-y-4">
             {/* Minimal view when collapsed */}
          </div>
        )}
      </div>

      {/* Drag Handle */}
      {!isCollapsed && (
          <div 
            onMouseDown={startResizing}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-50 group"
          >
              <div className="w-px h-full bg-slate-200 group-hover:bg-blue-300 mx-auto"></div>
          </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 flex items-center justify-center">
            <span>YISS • CEL 5D+ • Biblical Integration</span>
            <div className="group relative flex items-center ml-2 cursor-pointer">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 transition-colors" />
                <div className="absolute bottom-full mb-2 w-max px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Designed & Developed by the Secondary Media Specialist
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
