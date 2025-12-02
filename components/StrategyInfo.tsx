import React from 'react';
import { StrategyNode } from '../types';
import { Info, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';

export const StrategyInfo: React.FC<{ strategy: StrategyNode }> = ({ strategy }) => {
  // If it's a category node (has children but no deep info), don't show the detailed card
  if (!strategy.fullDefinition && !strategy.usage) return null;

  return (
    <div className="bg-white border-l-4 border-blue-600 rounded-r-xl shadow-md p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
          <BookOpen className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{strategy.label}</h2>
          <p className="text-slate-500 text-lg mt-1">{strategy.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {strategy.fullDefinition && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center">
              <Info className="w-4 h-4 mr-2" /> Definition
            </h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {strategy.fullDefinition}
            </p>
          </div>
        )}
        
        {strategy.usage && (
          <div className="space-y-2">
             <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" /> Application
            </h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {strategy.usage}
            </p>
          </div>
        )}
      </div>

      {strategy.pedagogicalValue && (
        <div className="mt-6 pt-6 border-t border-slate-100">
           <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center">
             <GraduationCap className="w-4 h-4 mr-2" /> Pedagogical Value
           </h3>
           <div className="flex items-start bg-green-50 p-4 rounded-lg border border-green-100 text-green-900">
               <span className="italic font-medium">"{strategy.pedagogicalValue}"</span>
           </div>
        </div>
      )}
    </div>
  );
};