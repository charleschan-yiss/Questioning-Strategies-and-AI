
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Sparkles, Loader2, FileText } from 'lucide-react';

interface WorksheetDisplayProps {
  markdown: string;
  onGenerate: () => void;
  isLoading: boolean;
  topic: string;
}

export const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ markdown, onGenerate, isLoading, topic }) => {
  const handleDownload = () => {
      const element = document.getElementById('worksheet-content');
      if (!element) return;

      const opt = {
          margin: 0.5,
          filename: `${topic.replace(/\s+/g, '_')}_Worksheet.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Check if html2pdf is available (loaded in index.html)
      if ((window as any).html2pdf) {
        (window as any).html2pdf().set(opt).from(element).save();
      } else {
        alert("PDF generator library not loaded.");
      }
  };

  if (!markdown && !isLoading) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Student Worksheet</h3>
              <p className="text-slate-500 max-w-md mb-6">
                  Generate a student-facing worksheet based on your current lesson plan. 
                  Includes questions, activities, and reflection space.
              </p>
              <button 
                  onClick={onGenerate}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
              >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Worksheet
              </button>
          </div>
      );
  }

  return (
      <div className="w-full max-w-4xl mx-auto">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Student Worksheet
              </h2>
              <div className="flex gap-2">
                  {!isLoading && markdown && (
                      <>
                        <button 
                            onClick={onGenerate}
                            className="flex items-center text-sm font-medium text-slate-600 hover:text-purple-600 px-3 py-2 bg-white border border-slate-200 rounded-lg transition-colors"
                        >
                            <Sparkles className="w-4 h-4 mr-2" /> Regenerate
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg shadow transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </button>
                      </>
                  )}
              </div>
           </div>

           {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Creating student activities...</p>
                </div>
           ) : (
               <div className="bg-white shadow-lg rounded-none md:rounded-lg border border-slate-200 p-8 md:p-12 min-h-[800px]" id="worksheet-content">
                    <ReactMarkdown 
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 text-center mb-2 uppercase tracking-wide border-b-2 border-slate-800 pb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 border-b border-slate-200 pb-1" {...props} />,
                            p: ({node, ...props}) => <p className="text-slate-700 mb-4 leading-relaxed" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-4 space-y-1" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...props} />,
                            table: ({node, ...props}) => <table className="w-full border-collapse border border-slate-300 my-4" {...props} />,
                            th: ({node, ...props}) => <th className="border border-slate-300 bg-slate-100 p-2 text-left font-bold" {...props} />,
                            td: ({node, ...props}) => <td className="border border-slate-300 p-2" {...props} />,
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
               </div>
           )}
      </div>
  );
};
