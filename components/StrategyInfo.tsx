
import React, { useState, useEffect } from 'react';
import { StrategyNode } from '../types';
import { Info, BookOpen, Lightbulb, Layout, MessageCircle, Users } from 'lucide-react';

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
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full max-w-full">
      
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
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{activeStrategy.label}</h2>
                        <p className="text-slate-500 text-base mt-1">{activeStrategy.description}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {activeStrategy.fullDefinition && (
                <div className="space-y-2 min-w-0">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Steps / Definition
                    </h3>
                    <div className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm h-full break-words whitespace-pre-wrap">
                        {activeStrategy.fullDefinition}
                    </div>
                </div>
                )}
                
                {activeStrategy.usage && (
                <div className="space-y-2 min-w-0">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" /> Application
                    </h3>
                    <div className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm h-full break-words whitespace-pre-wrap">
                        {activeStrategy.usage}
                    </div>
                </div>
                )}
            </div>

            {(activeStrategy.optionA || activeStrategy.optionB) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
                    <div className="space-y-2 min-w-0">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center">
                        Option A: Academic
                        </h3>
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-900 text-sm h-full break-words whitespace-pre-wrap">
                            {activeStrategy.optionA}
                        </div>
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                        <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center">
                        Option B: Social/Fun
                        </h3>
                        <div className="bg-pink-50 p-4 rounded-lg border border-pink-100 text-pink-900 text-sm h-full break-words whitespace-pre-wrap">
                            {activeStrategy.optionB}
                        </div>
                    </div>
                </div>
            )}

            {(activeStrategy.teacherScript || activeStrategy.socialSkill) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
                    {activeStrategy.teacherScript && (
                        <div className="space-y-2 min-w-0 overflow-hidden">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" /> Teacher Script
                            </h3>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-purple-900 text-sm italic h-full break-words whitespace-pre-wrap w-full">
                                "{activeStrategy.teacherScript}"
                            </div>
                        </div>
                    )}
                    
                    {activeStrategy.socialSkill && (
                        <div className="space-y-2 min-w-0 overflow-hidden">
                            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest flex items-center">
                            <Users className="w-4 h-4 mr-2" /> Social Skill
                            </h3>
                            <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 text-teal-900 text-sm h-full break-words whitespace-pre-wrap w-full">
                                {activeStrategy.socialSkill}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};
