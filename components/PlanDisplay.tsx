
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle2, BookOpen, Users, Brain, Activity, Quote, Target, Search, MessageCircle, ChevronDown, ChevronUp, Layers, Download, PenTool } from 'lucide-react';
import { StrategyNode } from '../types';
import { marked } from 'marked';
import { generateResourceContent } from '../services/geminiService';

interface PlanDisplayProps {
  markdown: string;
  selectedStrategies: StrategyNode[];
  gradeLevel: string; // Added prop for context
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

const CollapsibleSection: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    defaultOpen?: boolean 
}> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm bg-white">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
            >
                <div className="flex items-center">
                    <div className="mr-3 text-blue-600">{icon}</div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-6 md:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

// Helper to extract content by header regardless of section break order
const extractSection = (fullText: string, headerPattern: string, nextHeaders: string[]) => {
    // Escape special regex characters (like + in 5D+)
    const escapedHeader = headerPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headerRegex = new RegExp(`## ${escapedHeader}`, 'i');
    
    const match = fullText.match(headerRegex);
    
    if (!match || match.index === undefined) return "";

    const startIndex = match.index;
    const contentStart = startIndex + match[0].length;
    let endIndex = fullText.length;

    // Find the nearest next section header or section break using regex for case-insensitive matching
    const stops: number[] = [];
    
    const sectionBreakIdx = fullText.indexOf("<<<SECTION_BREAK>>>", contentStart);
    if (sectionBreakIdx !== -1) stops.push(sectionBreakIdx);

    nextHeaders.forEach(h => {
        // Search for next headers only after the current content start
        const escapedNext = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nextRegex = new RegExp(`## ${escapedNext}`, 'i');
        const subText = fullText.substring(contentStart);
        const m = subText.match(nextRegex);
        if (m && m.index !== undefined) {
             stops.push(contentStart + m.index);
        }
    });

    if (stops.length > 0) {
        endIndex = Math.min(...stops);
    }

    return fullText.substring(contentStart, endIndex).trim();
};

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ markdown, selectedStrategies, gradeLevel }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingResource, setIsGeneratingResource] = useState(false);
  const [resourceInstructions, setResourceInstructions] = useState('');

  // Filter strategies into their specific categories for the footer summary
  const celStrategies = selectedStrategies.filter(s => s.id.startsWith('cel-'));
  const paqStrategies = selectedStrategies.filter(s => s.id.startsWith('paq-'));
  const questioningStrategies = selectedStrategies.filter(s => !s.id.startsWith('cel-') && !s.id.startsWith('paq-') && !s.id.startsWith('kagan-'));
  const kaganStrategies = selectedStrategies.filter(s => s.id.startsWith('kagan-'));

  const pSelected = paqStrategies.some(s => s.id === 'paq-p');
  const aSelected = paqStrategies.some(s => s.id === 'paq-a');
  const qSelected = paqStrategies.some(s => s.id === 'paq-q');
  
  const resourceStrategy = kaganStrategies.find(s => s.requiresResource);

  const components = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3 mb-6" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <div className="flex items-center mt-6 mb-4">
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide" {...props} />
      </div>
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-md font-semibold text-slate-700 mt-5 mb-2 flex items-center" {...props}>
         {props.children?.toString().includes("P - Purpose") ? <Target className="w-4 h-4 text-purple-600 mr-2 inline" /> :
          props.children?.toString().includes("A - Assumptions") ? <Search className="w-4 h-4 text-orange-600 mr-2 inline" /> :
          props.children?.toString().includes("Q - Questions") ? <MessageCircle className="w-4 h-4 text-pink-600 mr-2 inline" /> :
          null}
         {props.children}
      </h3>
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-outside ml-5 space-y-1 text-slate-700 mb-4 text-sm md:text-base" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="pl-1 leading-relaxed" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-slate-600 mb-4 leading-relaxed text-sm md:text-base" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-bold text-slate-900" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg italic text-slate-700 mb-4 text-sm" {...props} />
    ),
  };

  // 1. Full Plan
  const fullPlanContent = extractSection(markdown, "Full Integrated Lesson Plan", ["CEL 5D+ Framework", "Questioning Strategy", "Biblical Integration", "Instructional Strategy", "Integration Highlights"]);
  
  // 2. CEL 5D+ Framework
  // We look for strict header first, but allow variations by listing next possible headers
  const celContent = extractSection(markdown, "CEL 5D+ Framework", ["Questioning Strategy", "Biblical Integration", "Instructional Strategy", "Instructional Strategy Integration", "Integration Highlights"]);

  // 3. Questioning Strategy
  const strategyContent = extractSection(markdown, "Questioning Strategy Integration Guide", ["Biblical Integration", "Instructional Strategy", "Instructional Strategy Integration", "Integration Highlights"]);
  
  // 4. PAQ
  const paqContent = extractSection(markdown, "Biblical Integration Analysis", ["Instructional Strategy", "Instructional Strategy Integration", "Integration Highlights"]);
  
  // 5. Instructional Strategy (Top Level)
  const instructionalContent = extractSection(markdown, "Instructional Strategy Integration Guide", ["Integration Highlights"]);
  
  // 6. Highlights
  const highlightsContent = extractSection(markdown, "Integration Highlights Summary", []);

  // Fallback if parsing fails
  const sections = markdown.split("<<<SECTION_BREAK>>>");
  const fallbackFullPlan = sections[0] || "";

  const displayPlan = fullPlanContent || fallbackFullPlan;

  const handleGenerateResource = async () => {
      if (!resourceStrategy) return;
      setIsGeneratingResource(true);
      try {
          const htmlContent = await generateResourceContent(
              resourceStrategy, 
              markdown, 
              resourceInstructions, // Pass user input
              gradeLevel // Pass context
          );
          
          // Use html2pdf to download
          const element = document.createElement('div');
          element.innerHTML = htmlContent;
          element.style.padding = '40px';
          element.style.fontFamily = 'Arial, sans-serif';
          document.body.appendChild(element);
          
          const opt = {
              margin: 0.5,
              filename: `${resourceStrategy.label.replace(/\s+/g, '_')}_Worksheet.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
          await (window as any).html2pdf().set(opt).from(element).save();
          document.body.removeChild(element);

      } catch (e) {
          console.error(e);
          alert("Failed to generate resource. Please try again.");
      } finally {
          setIsGeneratingResource(false);
      }
  };

  const renderResourceGeneratorUI = () => (
      <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Generate {resourceStrategy?.label} Resource
              </h4>
              <p className="text-xs text-indigo-700 mb-3">
                  Create a professional PDF worksheet for this activity. Add any specific topics or instructions below.
              </p>
              
              <div className="flex gap-2">
                  <div className="flex-1 relative">
                      <PenTool className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                      <input 
                          type="text"
                          value={resourceInstructions}
                          onChange={(e) => setResourceInstructions(e.target.value)}
                          placeholder="E.g., Focus on vocabulary words from Chapter 3..."
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                  </div>
                  <button 
                      onClick={handleGenerateResource}
                      disabled={isGeneratingResource}
                      className="flex items-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                      {isGeneratingResource ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      Generate PDF
                  </button>
              </div>
          </div>
      </div>
  );

  // SUB-PARSING FOR INSTRUCTIONAL STRATEGY (NESTED DROPDOWNS)
  const renderInstructionalContent = () => {
      // Split by ### headers
      const subSections = instructionalContent.split(/(?=### )/g).filter(s => s.trim().length > 0);
      
      // If no sub-sections found (just flat text), render normally
      if (subSections.length <= 1 && !subSections[0]?.startsWith('###')) {
          return (
            <div className="relative">
                <ReactMarkdown components={components}>{instructionalContent}</ReactMarkdown>
                {resourceStrategy && renderResourceGeneratorUI()}
            </div>
          );
      }

      // If sub-sections exist, render them as nested collapsibles
      return (
          <div className="space-y-4">
              <div className="mb-4 text-slate-600">
                  <ReactMarkdown components={components}>
                      {subSections.find(s => !s.startsWith('###')) || ""} 
                  </ReactMarkdown>
              </div>
              
              {subSections.filter(s => s.startsWith('###')).map((sub, idx) => {
                  const titleMatch = sub.match(/^### (.*?)(\n|$)/);
                  const title = titleMatch ? titleMatch[1] : "Strategy Detail";
                  const content = sub.replace(/^### .*(\n|$)/, '');
                  
                  // Check if this subsection is relevant to the resource strategy (often Classbuilding or Review)
                  const showGeneratorHere = resourceStrategy && title.includes(resourceStrategy.label) || (resourceStrategy && idx === subSections.length - 1); 

                  return (
                      <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                          <CollapsibleSection 
                              title={title} 
                              icon={<Layers className="w-4 h-4" />}
                              defaultOpen={false}
                          >
                              <ReactMarkdown components={components}>{content}</ReactMarkdown>
                              {resourceStrategy && (title.includes("Classbuilding") || title.includes("Review") || title.includes(resourceStrategy.label)) && 
                                  renderResourceGeneratorUI()
                              }
                          </CollapsibleSection>
                      </div>
                  );
              })}
          </div>
      );
  };

  const handleCopyPlan = async () => {
      try {
          const cleanMarkdown = markdown.replace(/<<<SECTION_BREAK>>>/g, '\n\n---\n\n');
          const htmlBody = await marked.parse(cleanMarkdown);
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px; margin-bottom: 20px; }
                h2 { color: #1e40af; margin-top: 25px; margin-bottom: 15px; font-size: 20px; text-transform: uppercase; }
                h3 { color: #334155; margin-top: 20px; font-size: 18px; }
                ul { margin-bottom: 15px; }
                li { margin-bottom: 8px; }
                p { margin-bottom: 15px; }
                strong { color: #0f172a; }
                blockquote { border-left: 4px solid #3b82f6; padding-left: 15px; color: #475569; background: #f8fafc; font-style: italic; }
            </style>
            </head>
            <body>
                ${htmlBody}
            </body>
            </html>
          `;
          const blobInput = new Blob([htmlContent], { type: 'text/html' });
          const blobText = new Blob([cleanMarkdown], { type: 'text/plain' });
          const data = [new ClipboardItem({ "text/html": blobInput, "text/plain": blobText })];
          await navigator.clipboard.write(data);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
          console.error("Copy failed", err);
          navigator.clipboard.writeText(markdown).then(() => {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
          });
      }
  };

  if (!markdown) return null;

  return (
    <div className="w-full max-w-5xl mx-auto pb-40">
      
      {/* Toolbar */}
      <div className="flex justify-end mb-4 gap-3">
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

      {/* 1. Full Integrated Lesson Plan */}
      <CollapsibleSection 
        title="Full Integrated Lesson Plan" 
        icon={<Activity className="w-5 h-5" />}
        defaultOpen={false}
      >
         <ReactMarkdown components={components}>{displayPlan}</ReactMarkdown>
      </CollapsibleSection>

      {/* 2. CEL 5D+ Framework */}
      {celContent.trim().length > 10 && (
          <CollapsibleSection 
            title="CEL 5D+ Framework" 
            icon={<Target className="w-5 h-5" />}
            defaultOpen={false}
          >
             <ReactMarkdown components={components}>{celContent}</ReactMarkdown>
          </CollapsibleSection>
      )}

      {/* 3. Questioning Strategy Analysis */}
      {strategyContent.trim().length > 10 && (
          <CollapsibleSection 
            title="Questioning Strategy Integration" 
            icon={<Brain className="w-5 h-5" />}
            defaultOpen={false}
          >
             <ReactMarkdown components={components}>{strategyContent}</ReactMarkdown>
          </CollapsibleSection>
      )}

      {/* 4. PAQ / Biblical Integration */}
      {paqContent.trim().length > 10 && (
          <CollapsibleSection 
            title="Biblical Integration Analysis (PAQ)" 
            icon={<Quote className="w-5 h-5" />}
            defaultOpen={false}
          >
             <ReactMarkdown components={components}>{paqContent}</ReactMarkdown>
          </CollapsibleSection>
      )}

      {/* 5. Instructional Strategy (Kagan - Nested) */}
      {instructionalContent.trim().length > 10 && (
          <CollapsibleSection 
            title="Instructional Strategy Integration" 
            icon={<Layers className="w-5 h-5" />}
            defaultOpen={false}
          >
             {renderInstructionalContent()}
          </CollapsibleSection>
      )}

      {/* 6. Highlights */}
      {highlightsContent.trim().length > 10 && (
          <CollapsibleSection 
            title="Integration Highlights" 
            icon={<CheckCircle2 className="w-5 h-5" />}
            defaultOpen={false}
          >
             <ReactMarkdown components={components}>{highlightsContent}</ReactMarkdown>
          </CollapsibleSection>
      )}

      {/* Footer Connections Grid */}
      <div className="mt-8 border-t border-slate-200 pt-8">
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
                                <div key={s.id} className="flex items-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                                    <p><strong className="text-slate-800">{s.label}</strong></p>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 italic text-xs pt-2">No CEL 5D+ dimensions selected.</div>
                        )}
                    </div>
                </div>

                {/* Selected Strategies Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain className="w-16 h-16 text-green-600" />
                    </div>
                    <h4 className="font-bold text-green-900 mb-3 border-b border-green-100 pb-2">Selected Strategies</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                        {/* Questioning Strategies */}
                        {questioningStrategies.length > 0 && (
                            <>
                             <div className="text-xs font-bold text-slate-500 uppercase mb-1">Questioning</div>
                             {questioningStrategies.slice(0, 6).map(s => (
                                <div key={s.id} className="flex items-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">{s.label}</span>
                                </div>
                             ))}
                            </>
                        )}
                        
                        {/* Kagan Strategies - Now using Green Checkmarks too */}
                        {kaganStrategies.length > 0 && (
                            <div className={`${questioningStrategies.length > 0 ? 'mt-3 pt-2 border-t border-slate-100' : ''}`}>
                                <span className="text-xs font-bold text-slate-500 uppercase">Instructional (Kagan)</span>
                                {kaganStrategies.map(s => (
                                    <div key={s.id} className="flex items-center mt-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                                        <span className="truncate text-slate-700">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {questioningStrategies.length === 0 && kaganStrategies.length === 0 && (
                            <span className="text-slate-400 italic text-xs">No specific strategies selected.</span>
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
  );
};
