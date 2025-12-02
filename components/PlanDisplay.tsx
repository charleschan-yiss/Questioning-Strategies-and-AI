import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, FileText, CheckCircle2, BookOpen, Users, Brain, Activity, Quote } from 'lucide-react';

interface PlanDisplayProps {
  markdown: string;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ markdown }) => {
  if (!markdown) return null;

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
        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 inline" />
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
    )
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
         <button 
            onClick={() => navigator.clipboard.writeText(markdown)}
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
            <ReactMarkdown components={components}>
                {markdown}
            </ReactMarkdown>
        </div>

        {/* Footer Connections Grid */}
        <div className="bg-slate-50 border-t border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Framework Integration Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CEL 5D Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-100 pb-2">CEL 5D+ Alignment</h4>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-start">
                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                             <p><strong className="text-slate-800">Purpose:</strong> Standards-aligned learning targets.</p>
                        </div>
                        <div className="flex items-start">
                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                             <p><strong className="text-slate-800">Engagement:</strong> High cognitive demand tasks.</p>
                        </div>
                        <div className="flex items-start">
                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                             <p><strong className="text-slate-800">Culture:</strong> Collaborative inquiry & talk.</p>
                        </div>
                    </div>
                </div>

                {/* Biblical Integration Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-yellow-300 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Quote className="w-16 h-16 text-yellow-600" />
                    </div>
                    <h4 className="font-bold text-yellow-900 mb-3 border-b border-yellow-100 pb-2">Biblical Integration</h4>
                    <p className="text-sm text-slate-600 italic mb-3">
                        "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding."
                    </p>
                    <div className="flex items-start text-sm text-slate-700 bg-yellow-50 p-3 rounded-md">
                        <Brain className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <p>Lesson content is examined through the lens of Truth, seeking to reveal God's character and order in creation.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
