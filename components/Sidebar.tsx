import React, { useState } from 'react';
import { strategies } from '../data/strategies';
import { StrategyNode } from '../types';
import { ChevronRight, ChevronDown, BookOpen, Brain, Zap, MessageCircle } from 'lucide-react';

interface SidebarProps {
  onSelectStrategy: (node: StrategyNode) => void;
  selectedId: string | null;
}

const getIcon = (id: string) => {
  if (id.includes('blooms')) return <Brain className="w-4 h-4 mr-2 text-purple-500" />;
  if (id.includes('mnemonics')) return <Zap className="w-4 h-4 mr-2 text-yellow-500" />;
  if (id.includes('critical')) return <BookOpen className="w-4 h-4 mr-2 text-blue-500" />;
  return <MessageCircle className="w-4 h-4 mr-2 text-green-500" />;
};

const TreeNode: React.FC<{ 
  node: StrategyNode; 
  onSelect: (node: StrategyNode) => void; 
  selectedId: string | null;
  level: number 
}> = ({ node, onSelect, selectedId, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  // Auto-expand if a child is selected
  React.useEffect(() => {
    if (hasChildren && node.children?.some(c => c.id === selectedId)) {
        setIsOpen(true);
    }
  }, [selectedId, hasChildren, node.children]);

  return (
    <div className="select-none">
      <div 
        onClick={(e) => {
             // If it has children, clicking the row toggles. If it's a leaf, it selects.
             if (hasChildren) {
                 setIsOpen(!isOpen);
             } else {
                 onSelect(node);
             }
        }}
        className={`
          flex items-center py-2 px-3 cursor-pointer transition-colors duration-150 text-sm
          ${isSelected ? 'bg-blue-100 text-blue-800 font-medium border-r-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <span className="opacity-70">
            {hasChildren ? (
                isOpen ? <ChevronDown className="w-3 h-3 mr-2" /> : <ChevronRight className="w-3 h-3 mr-2" />
            ) : (
                <span className="w-3 h-3 mr-2 inline-block" />
            )}
        </span>
        
        {level === 0 && getIcon(node.id)}
        <span className="truncate">{node.label}</span>
      </div>

      {hasChildren && isOpen && (
        <div className="border-l border-slate-200 ml-6">
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              selectedId={selectedId}
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onSelectStrategy, selectedId }) => {
  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Questioning Strategies</h2>
        <p className="text-xs text-slate-500 mt-1">Select a method to apply</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {strategies.map((strategy) => (
          <TreeNode 
            key={strategy.id} 
            node={strategy} 
            onSelect={onSelectStrategy}
            selectedId={selectedId}
            level={0}
          />
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 text-center">
        Based on YISS & CEL 5D+
      </div>
    </div>
  );
};