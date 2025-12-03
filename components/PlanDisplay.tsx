
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, FileText, CheckCircle2, BookOpen, Users, Brain, Activity, Quote, Target, Search, MessageCircle, Download, Loader2, FileType, ChevronDown, ChevronUp } from 'lucide-react';
import { StrategyNode } from '../types';

interface PlanDisplayProps {
  markdown: string;
  selectedStrategies: StrategyNode[];
}

const ActionTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="group relative flex flex-col items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
    </div>
);

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ markdown, selectedStrategies }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState(false);

  if (!markdown) return null;

  // Filter strategies into their specific categories for the footer summary
  const celStrategies = selectedStrategies.filter(s => s.id.startsWith('cel-'));
  const paqStrategies = selectedStrategies.filter(s => s.id.startsWith('paq-'));
  // "Questioning Strategies" includes everything that isn't CEL or PAQ
  const questioningStrategies = selectedStrategies.filter(s => !s.id.startsWith('cel-') && !s.id.startsWith('paq-'));

  // Determine active PAQ sections for the PAQ card visuals
  const pSelected = paqStrategies.some(s => s.id === 'paq-p');
  const aSelected = paqStrategies.some(s => s.id === 'paq-a');
  const qSelected = paqStrategies.some(s => s.id === 'paq-q');
  
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
    // First, check if we have the "Full Plan" delimiter
    const splitByPlan = text.split("<<<FULL_PLAN_START>>>");
    const integrationPart = splitByPlan[0];
    const fullPlanPart = splitByPlan[1] || "";

    const renderChanges = (segment: string) => {
        const parts = segment.split(/\$\$CHANGE\$\$/);
        if (parts.length === 1) return <ReactMarkdown components={components}>{segment}</ReactMarkdown>;

        return parts.map((part, index) => {
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

    return (
        <>
            {/* 1. Integration Analysis (Always Visible) */}
            <div className="mb-8">
                {renderChanges(integrationPart)}
            </div>

            {/* 2. Full Plan (Collapsible) */}
            {fullPlanPart && (
                <div className="border-t-2 border-slate-200 pt-8 mt-8">
                    <button 
                        onClick={() => setShowFullPlan(!showFullPlan)}
                        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-4 rounded-lg border border-slate-200 transition-colors group"
                    >
                        <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 mr-3" />
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide group-hover:text-blue-700">Full Integrated Lesson Plan</h3>
                                <p className="text-xs text-slate-500">Click to {showFullPlan ? 'hide' : 'view'} the complete document</p>
                            </div>
                        </div>
                        {showFullPlan ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {showFullPlan && (
                         <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                             {renderChanges(fullPlanPart)}
                         </div>
                    )}
                </div>
            )}
        </>
    );
  };

  const handleExportPDF = () => {
    // Temporarily expand plan for printing if needed, but html2pdf grabs rendered DOM.
    // If it's hidden, it won't print. We'll alert user or auto-expand logic could be complex.
    // For now, simpler: user must expand to print full plan, or we print what's seen.
    // Ideally, we force expansion.
    const wasHidden = !showFullPlan;
    if (wasHidden) setShowFullPlan(true);

    // Wait for render
    setTimeout(() => {
        setIsExporting(true);
        const element = document.getElementById('lesson-plan-document');
        if (!element) {
            setIsExporting(false);
            return;
        }

        const opt = {
            margin: [0.75, 0.75], // Increased margins
            filename: `YISS_Lesson_Plan_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Use global html2pdf
        const worker = (window as any).html2pdf().set(opt).from(element).save();
        
        worker.then(() => {
            setIsExporting(false);
            if (wasHidden) setShowFullPlan(false); // Restore state
        }).catch((err: any) => {
            console.error("PDF Export failed:", err);
            setIsExporting(false);
        });
    }, 100);
  };

  const handleCopyPlan = () => {
      const element = document.getElementById('lesson-plan-document');
      if (!element) return;

      const wasHidden = !showFullPlan;
      if (wasHidden) setShowFullPlan(true);

      setTimeout(() => {
        // Copy with formatting for Google Docs / Word (HTML) AND Plain Text fallback
        const contentHTML = element.innerHTML;
        
        const blobInput = new Blob([contentHTML], { type: 'text/html' });
        const blobText = new Blob([element.innerText], { type: 'text/plain' });
        
        const data = [new ClipboardItem({ 
            "text/html": blobInput,
            "text/plain": blobText 
        })];

        navigator.clipboard.write(data).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            if (wasHidden) setShowFullPlan(false);
        }).catch(err => {
            console.error("Copy failed", err);
            navigator.clipboard.writeText(element.innerText).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
                if (wasHidden) setShowFullPlan(false);
            });
        });
      }, 100);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-40">
      
      {/* Toolbar */}
      <div className="flex justify-end mb-4 gap-3">
         <ActionTooltip text="Download as PDF file">
            <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg px-4 py-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait"
            >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isExporting ? 'Generating...' : 'Export PDF'}
            </button>
         </ActionTooltip>

         <ActionTooltip text="Copy plan with formatting (for Google Docs, Word, etc.)">
             <button 
                onClick={handleCopyPlan}
                className="flex items-center text-sm font-medium text-slate-600 hover:text-green-600 bg-white hover:bg-green-50 border border-slate-200 rounded-lg px-4 py-2 transition-all shadow-sm"
             >
                {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {isCopied ? 'Copied!' : 'Copy Plan'}
             </button>
         </ActionTooltip>
      </div>

      {/* Document Sheet - Target this ID for PDF Generation */}
      <div id="lesson-plan-document" className="bg-white rounded-none md:rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
        
        {/* Document Header */}
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
             <style>{`
                @media print {
                    p, li, blockquote, h1, h2, h3, h4 {
                        break-inside: avoid;
                    }
                }
                .avoid-break-inside {
                    break-inside: avoid;
                }
             `}</style>
            {processMarkdown(markdown)}
        </div>

        {/* Footer Connections Grid */}
        <div className="bg-slate-50 border-t border-slate-200 p-8 avoid-break-inside">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Framework Integration Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CEL 5D Alignment Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-100 pb-2">CEL 5D+ Alignment</h4>
                    <div className="space-y-3 text-sm text-slate-600">
                        {celStrategies.length > 0 ? (
                            celStrategies.map(s => (
                                <div key={s.id} className="flex items-start">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                                    <p><strong className="text-slate-800">{s.label}</strong></p>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 italic text-xs pt-2">No CEL 5D+ dimensions selected.</div>
                        )}
                    </div>
                </div>

                {/* Selected Strategies Card (Questioning Only) */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain className="w-16 h-16 text-green-600" />
                    </div>
                    <h4 className="font-bold text-green-900 mb-3 border-b border-green-100 pb-2">Selected Strategies</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                        {questioningStrategies.length > 0 ? (
                             questioningStrategies.slice(0, 6).map(s => (
                                <div key={s.id} className="flex items-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">{s.label}</span>
                                </div>
                             ))
                        ) : (
                            <span className="text-slate-400 italic text-xs">No questioning strategies selected.</span>
                        )}
                        {questioningStrategies.length > 6 && (
                            <span className="text-xs text-slate-400 pl-6">+ {questioningStrategies.length - 6} more...</span>
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
                        <div className={`p-2 rounded border transition-opacity ${pSelected ? 'bg-purple-50 border-purple-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-30 grayscale'}`}>
                            <strong className="text-purple-700 block mb-1">P - Purpose</strong>
                            Divine Intent & Foundation
                        </div>
                        <div className={`p-2 rounded border transition-opacity ${aSelected ? 'bg-orange-50 border-orange-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-30 grayscale'}`}>
                            <strong className="text-orange-700 block mb-1">A - Assumptions</strong>
                            Worldview Logic Check
                        </div>
                        <div className={`p-2 rounded border transition-opacity ${qSelected ? 'bg-pink-50 border-pink-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-30 grayscale'}`}>
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
