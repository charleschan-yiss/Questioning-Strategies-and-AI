
import React, { useState, useEffect } from 'react';
import { StrategyNode } from '../types';
import { Info, BookOpen, Lightbulb, GraduationCap, Layout } from 'lucide-react';

export const StrategyInfo: React.FC<{ strategies: StrategyNode[] }> = ({ strategies }) => {
  // Filter out nodes that don't have detail info (like root folders if accidentally passed)
  const validStrategies = strategies.filter(s => s.fullDefinition || s.usage);
  
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-select the first strategy if none is active or if active one was removed
  useEffect(() => {
    if (validStrategies.length > 0) {
      if (!activeId || !validStrategies.find(s => s.id === activeId)) {
        setActiveId(validStrategies[0].id);
      }
    } else {
      setActiveId(null);
    }
  }, [strategies, activeId]);

  if (validStrategies.length === 0) return null;

  const activeStrategy = validStrategies.find(s => s.id === activeId) || validStrategies[0];

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header / Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <div className="mr-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            Selected Methods ({validStrategies.length})
        </div>
        {validStrategies.map(s => (
            <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`
                    flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${activeId === s.id 
                        ? 'bg-white text-blue-700 border-blue-200 shadow-sm' 
                        : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-800'
                    }
                `}
            >
                {s.label}
            </button>
        ))}
      </div>

      {/* Active Content Body */}
      {activeStrategy && (
        <div className="p-6">
            <div className="flex items-start mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{activeStrategy.label}</h2>
                    <p className="text-slate-500 text-base mt-1">{activeStrategy.description}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeStrategy.fullDefinition && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Definition
                    </h3>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm h-full">
                        {activeStrategy.fullDefinition}
                    </p>
                </div>
                )}
                
                {activeStrategy.usage && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" /> Application
                    </h3>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm h-full">
                        {activeStrategy.usage}
                    </p>
                </div>
                )}
            </div>

            {activeStrategy.pedagogicalValue && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" /> Pedagogical Value
                </h3>
                <div className="flex items-start bg-green-50 p-4 rounded-lg border border-green-100 text-green-900 text-sm">
                    <span className="italic font-medium">"{activeStrategy.pedagogicalValue}"</span>
                </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
