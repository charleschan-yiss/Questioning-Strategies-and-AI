import React, { useState } from 'react';
import { strategies } from '../data/strategies';
import { StrategyNode } from '../types';
import { ChevronRight, ChevronDown, BookOpen, Brain, Zap, MessageCircle, CheckSquare, Square, Folder } from 'lucide-react';

interface SidebarProps {
  onToggleStrategy: (id: string) => void;
  selectedIds: string[];
}

const getIcon = (id: string) => {
  if (id.includes('paq')) return <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />;
  if (id.includes('blooms')) return <Brain className="w-4 h-4 mr-2 text-purple-500" />;
  if (id.includes('mnemonics')) return <Zap className="w-4 h-4 mr-2 text-yellow-500" />;
  if (id.includes('cort')) return <BookOpen className="w-4 h-4 mr-2 text-blue-500" />;
  if (id.includes('questioning')) return <MessageCircle className="w-4 h-4 mr-2 text-green-500" />;
  return <Folder className="w-4 h-4 mr-2 text-slate-400" />;
};

const TreeNode: React.FC<{ 
  node: StrategyNode; 
  onToggle: (id: string) => void; 
  selectedIds: string[];
  level: number 
}> = ({ node, onToggle, selectedIds, level }) => {
  const [isOpen, setIsOpen] = useState(false); // Default closed for cleaner look
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedIds.includes(node.id);

  // Auto-expand if a child is selected
  React.useEffect(() => {
    if (hasChildren && node.children?.some(c => selectedIds.includes(c.id))) {
        setIsOpen(true);
    }
  }, [selectedIds, hasChildren, node.children]);

  return (
    <div className="select-none">
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
                    className="hover:text-blue-500"
                >
                   {isSelected ? (
                       <CheckSquare className="w-4 h-4 text-blue-600" />
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onToggleStrategy, selectedIds }) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Strategy Selection</h2>
        <p className="text-xs text-slate-500 mt-1">Select one or more methods</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {strategies.map((strategy) => (
          <TreeNode 
            key={strategy.id} 
            node={strategy} 
            onToggle={onToggleStrategy}
            selectedIds={selectedIds}
            level={0}
          />
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 text-center">
        YISS • CEL 5D+ • PAQ
      </div>
    </div>
  );
};