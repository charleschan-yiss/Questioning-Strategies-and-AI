import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { PlanDisplay } from './components/PlanDisplay';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ChatInterface } from './components/ChatInterface';
import { StrategyInfo } from './components/StrategyInfo';
import { StrategyNode, LessonInput, AppState } from './types';
import { generateLessonPlan } from './services/geminiService';
import { LayoutDashboard, AlertCircle, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyNode | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [planMarkdown, setPlanMarkdown] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  const handleStrategySelect = (node: StrategyNode) => {
    setSelectedStrategy(node);
  };

  const handleGenerate = async () => {
    if (!selectedStrategy) return;

    setAppState(AppState.LOADING);
    setErrorMsg('');
    setPlanMarkdown('');

    try {
      const result = await generateLessonPlan(currentFormData, selectedStrategy.label, selectedStrategy.description || '');
      setPlanMarkdown(result);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Failed to generate lesson plan. Please check your API key.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        onSelectStrategy={handleStrategySelect} 
        selectedId={selectedStrategy?.id || null} 
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
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
          
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
               {selectedStrategy ? (
                 <StrategyInfo strategy={selectedStrategy} />
               ) : (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-8">
                    <h3 className="text-blue-800 font-bold text-lg mb-1">Select a Strategy</h3>
                    <p className="text-blue-600">Choose a questioning technique from the sidebar to start planning.</p>
                 </div>
               )}

               <InputForm 
                 selectedStrategy={selectedStrategy} 
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
               <button 
                  onClick={() => setAppState(AppState.IDLE)}
                  className="mb-6 text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center transition-colors"
               >
                  ← Back to Editor
               </button>
               <PlanDisplay markdown={planMarkdown} />
            </div>
          )}

        </div>
      </main>

      {/* Chat Overlay */}
      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        currentInput={currentFormData}
        currentPlan={planMarkdown}
      />
    </div>
  );
};

export default App;