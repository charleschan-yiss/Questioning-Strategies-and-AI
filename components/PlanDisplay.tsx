import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, FileText, CheckCircle2, BookOpen, Users, Brain, Activity, Quote, Target, Search, MessageCircle } from 'lucide-react';
import { StrategyNode } from '../types';

interface PlanDisplayProps {
  markdown: string;
  selectedStrategies: StrategyNode[];
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ markdown, selectedStrategies }) => {
  if (!markdown) return null;

  // Determine active PAQ sections
  const pSelected = selectedStrategies.some(s => s.id === 'paq-p');
  const aSelected = selectedStrategies.some(s => s.id === 'paq-a');
  const qSelected = selectedStrategies.some(s => s.id === 'paq-q');
  // If none selected, default to all active for the summary
  const allActive = !pSelected && !aSelected && !qSelected;
  const isP = pSelected || allActive;
  const isA = aSelected || allActive;
  const isQ = qSelected || allActive;

  // Custom components for ReactMarkdown to style the output
  const components = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl font-bold text-slate-900 border-b-2 border-slate-200 pb-4 mb-6 mt-2" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <div className="flex items-center mt-8 mb-4">
        <div className="bg-blue-100 p-1.5 rounded-md mr-3">
           <Activity className="w-5 h-5 text-blue-700" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide" {...props} />
      </div>
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2 flex items-center" {...props} >
        {props.children?.toString().includes("P - Purpose") ? <Target className="w-4 h-4 text-purple-600 mr-2 inline" /> :
         props.children?.toString().includes("A - Assumptions") ? <Search className="w-4 h-4 text-orange-600 mr-2 inline" /> :
         props.children?.toString().includes("Q - Questions") ? <MessageCircle className="w-4 h-4 text-pink-600 mr-2 inline" /> :
         <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 inline" />}
        {props.children}
      </h3>
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-outside ml-6 space-y-2 text-slate-700 mb-4" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="pl-1 leading-relaxed" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-slate-600 mb-4 leading-relaxed" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-bold text-slate-900" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg italic text-slate-700 mb-4" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-8 border-slate-200" {...props} />
    ),
    // Handle the custom blue highlight for changes
    div: ({ node, className, ...props }: any) => {
        if (className === 'diff-highlight') {
            return (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r shadow-sm animate-in fade-in slide-in-from-left-2">
                    <div className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center">
                        <Activity className="w-3 h-3 mr-1" />
                        AI Updated Section
                    </div>
                    {props.children}
                </div>
            );
        }
        return <div className={className} {...props} />;
    }
  };

  const processMarkdown = (text: string) => {
    // Split by the delimiter
    const parts = text.split(/\$\$CHANGE\$\$/);
    
    // If no changes, standard render
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
        // Even indices are normal text, Odd indices are changed text
        if (index % 2 === 1) {
            return (
                <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r shadow-sm">
                     <div className="text-xs font-bold text-blue-600 uppercase mb-1">Updated Content</div>
                     <ReactMarkdown components={components}>{part}</ReactMarkdown>
                </div>
            );
        }
        return <ReactMarkdown key={index} components={components}>{part}</ReactMarkdown>;
    });
  };

  const processedContent = processMarkdown(markdown);

  return (
    <div className="w-full max-w-5xl mx-auto pb-40">
      
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
         <button 
            onClick={() => navigator.clipboard.writeText(markdown.replace(/\$\$CHANGE\$\$/g, ''))}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg px-4 py-2 transition-all shadow-sm"
         >
            <Copy className="w-4 h-4 mr-2" />
            Copy Plan
         </button>
      </div>

      {/* Document Sheet */}
      <div className="bg-white rounded-none md:rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
        
        {/* Document Header (Visual only) */}
        <div className="bg-slate-900 text-white p-8 border-b-4 border-blue-600">
           <div className="flex justify-between items-start">
               <div>
                   <h2 className="text-2xl font-bold tracking-tight">YISS Lesson Planner</h2>
                   <p className="text-blue-200 text-sm mt-1">Integrated Questioning & Frameworks</p>
               </div>
               <div className="opacity-80">
                   <FileText className="w-10 h-10 text-slate-400" />
               </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-12">
            {/* If it's an array (from diff processing), render array, else render standard */}
            {Array.isArray(processedContent) ? processedContent : (
                <ReactMarkdown components={components}>
                    {processedContent}
                </ReactMarkdown>
            )}
        </div>

        {/* Footer Connections Grid */}
        <div className="bg-slate-50 border-t border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Framework Integration Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CEL 5D Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-100 pb-2">CEL 5D+ Alignment</h4>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-start">
                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                             <p><strong className="text-slate-800">Purpose:</strong> Standards-aligned targets.</p>
                        </div>
                        <div className="flex items-start">
                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                             <p><strong className="text-slate-800">Engagement:</strong> High cognitive demand.</p>
                        </div>
                    </div>
                </div>

                {/* Selected Strategies Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain className="w-16 h-16 text-green-600" />
                    </div>
                    <h4 className="font-bold text-green-900 mb-3 border-b border-green-100 pb-2">Selected Strategies</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                        {selectedStrategies.filter(s => !s.id.includes('paq')).slice(0, 5).map(s => (
                             <div key={s.id} className="flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2" />
                                <span className="truncate">{s.label}</span>
                             </div>
                        ))}
                        {selectedStrategies.filter(s => !s.id.includes('paq')).length === 0 && (
                            <span className="text-slate-400 italic">No questioning strategies selected.</span>
                        )}
                        {selectedStrategies.filter(s => !s.id.includes('paq')).length > 5 && (
                            <span className="text-xs text-slate-400 pl-6">+ {selectedStrategies.length - 5} more...</span>
                        )}
                    </div>
                </div>

                {/* Biblical Integration Card (PAQ Style) */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-yellow-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Quote className="w-16 h-16 text-yellow-600" />
                    </div>
                    <h4 className="font-bold text-yellow-900 mb-3 border-b border-yellow-100 pb-2">PAQ Biblical Integration</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 text-xs text-slate-600">
                        <div className={`p-2 rounded border transition-opacity ${isP ? 'bg-purple-50 border-purple-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-40 grayscale'}`}>
                            <strong className="text-purple-700 block mb-1">P - Purpose</strong>
                            Divine Intent & Foundation
                        </div>
                        <div className={`p-2 rounded border transition-opacity ${isA ? 'bg-orange-50 border-orange-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-40 grayscale'}`}>
                            <strong className="text-orange-700 block mb-1">A - Assumptions</strong>
                            Worldview Logic Check
                        </div>
                        <div className={`p-2 rounded border transition-opacity ${isQ ? 'bg-pink-50 border-pink-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-40 grayscale'}`}>
                            <strong className="text-pink-700 block mb-1">Q - Questions</strong>
                            Ethical Application
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};