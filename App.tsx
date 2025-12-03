import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { PlanDisplay } from './components/PlanDisplay';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ChatInterface } from './components/ChatInterface';
import { StrategyInfo } from './components/StrategyInfo';
import { StrategyNode, LessonInput, AppState } from './types';
import { strategies } from './data/strategies'; // Import strategies for lookups
import { generateLessonPlan } from './services/geminiService';
import { LayoutDashboard, AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  // State for selected IDs (multi-select)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Track IDs that were used to generate the CURRENT plan to detect dirty state
  const [lastUsedStrategyIds, setLastUsedStrategyIds] = useState<string[]>([]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [planMarkdown, setPlanMarkdown] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Refinement text for the bottom bar
  const [refinementText, setRefinementText] = useState('');

  // Lifted state: Single source of truth for the form data
  const [currentFormData, setCurrentFormData] = useState<LessonInput>({
    unitName: '',
    topic: '',
    gradeLevel: '',
    subject: '',
    standards: '',
    context: '',
    files: [],
    links: []
  });

  // Helper to find all selected nodes
  const getSelectedStrategies = (): StrategyNode[] => {
    const selectedNodes: StrategyNode[] = [];
    
    // Recursive search
    const traverse = (nodes: StrategyNode[]) => {
      for (const node of nodes) {
        if (selectedIds.includes(node.id)) {
          selectedNodes.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    };
    
    traverse(strategies);
    return selectedNodes;
  };

  const selectedStrategies = getSelectedStrategies();

  // Detect if selection has changed since generation
  // Sort arrays to compare content
  const currentSelectionSignature = [...selectedIds].sort().join(',');
  const lastUsedSignature = [...lastUsedStrategyIds].sort().join(',');
  const isSelectionDirty = appState === AppState.SUCCESS && currentSelectionSignature !== lastUsedSignature;

  const handleToggleStrategy = (id: string) => {
    setSelectedIds(prev => {
        if (prev.includes(id)) {
            return prev.filter(item => item !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const handleGenerate = async () => {
    if (selectedStrategies.length === 0) return;

    setAppState(AppState.LOADING);
    setErrorMsg('');
    // Note: We don't clear planMarkdown immediately so user can see old one while loading if regenerating? 
    // Usually better to show loading state.
    
    try {
      const result = await generateLessonPlan(currentFormData, selectedStrategies, refinementText);
      setPlanMarkdown(result);
      setAppState(AppState.SUCCESS);
      setLastUsedStrategyIds(selectedIds); // Update tracking
      setRefinementText(''); // Clear refinement text after use? Or keep it? Keeping it can be useful for minor tweaks.
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Failed to generate lesson plan. Please check your API key.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        onToggleStrategy={handleToggleStrategy} 
        selectedIds={selectedIds} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        
        {/* Top Navigation / Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-md">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">YISS Lesson Planner</h1>
              <p className="text-xs text-slate-500 font-medium">AI-Powered Curriculum Design</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <VoiceAssistant 
                apiKey={process.env.API_KEY || ''} 
                currentInput={currentFormData}
                currentPlan={planMarkdown}
             />
             
             <button 
               onClick={() => setIsChatOpen(true)}
               className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
             >
               <MessageSquare className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full relative">
          
          {/* Error Message */}
          {appState === AppState.ERROR && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{errorMsg}</span>
            </div>
          )}

          {/* If no plan generated yet, show input form and strategy info */}
          {appState !== AppState.SUCCESS && (
            <>
               {selectedStrategies.length > 0 ? (
                 <StrategyInfo strategies={selectedStrategies} />
               ) : (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-8">
                    <h3 className="text-blue-800 font-bold text-lg mb-1">Select Strategies</h3>
                    <p className="text-blue-600">Choose questioning techniques or PAQ methods from the sidebar.</p>
                 </div>
               )}

               <InputForm 
                 selectedStrategies={selectedStrategies} 
                 onSubmit={handleGenerate}
                 isLoading={appState === AppState.LOADING}
                 data={currentFormData}
                 onChange={setCurrentFormData}
               />
            </>
          )}

          {/* If plan generated, show display */}
          {appState === AppState.SUCCESS && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-between items-center mb-6">
                 <button 
                    onClick={() => setAppState(AppState.IDLE)}
                    className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center transition-colors"
                 >
                    ← Back to Editor
                 </button>
               </div>

               <PlanDisplay markdown={planMarkdown} selectedStrategies={selectedStrategies} />
            </div>
          )}

        </div>
      </main>

      {/* Refinement Bar (Fixed at bottom when plan is visible) */}
      {appState === AppState.SUCCESS && (
        <div className="fixed bottom-0 left-80 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-20 flex gap-4 items-center animate-in slide-in-from-bottom-full duration-500">
             <div className="flex-1">
                 <input 
                    type="text" 
                    value={refinementText} 
                    onChange={(e) => setRefinementText(e.target.value)}
                    placeholder="Add specific instructions to refine the plan (e.g. 'Make the intro shorter', 'Focus on Group Work')..."
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 px-4 text-sm bg-slate-50"
                 />
             </div>
             <button 
                onClick={handleGenerate}
                className={`
                    flex items-center px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all
                    ${isSelectionDirty ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400 ring-offset-2' : 'bg-blue-600 hover:bg-blue-700'}
                `}
             >
                <RefreshCw className={`w-4 h-4 mr-2 ${appState === AppState.LOADING ? 'animate-spin' : ''}`} />
                {appState === AppState.LOADING 
                    ? 'Updating...' 
                    : isSelectionDirty 
                        ? 'Update Plan with New Selections' 
                        : 'Regenerate Plan'
                }
             </button>
        </div>
      )}

      {/* Chat Overlay */}
      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        currentInput={currentFormData}
        currentPlan={planMarkdown}
        setPlanMarkdown={setPlanMarkdown}
      />
    </div>
  );
};

export default App;