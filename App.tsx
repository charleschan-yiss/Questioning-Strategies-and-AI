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
    context: ''
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
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar 
        onSelectStrategy={handleStrategySelect} 
        selectedId={selectedStrategy?.id || null} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 py-3 px-8 flex items-center justify-between shadow-sm z-40 sticky top-0">
          <div className="flex items-center">
             <div className="bg-blue-700 p-2 rounded-lg mr-3 shadow-sm">
                 <LayoutDashboard className="w-5 h-5 text-white" />
             </div>
             <div>
                 <h1 className="text-lg font-bold text-slate-800 leading-tight">YISS Lesson Planner</h1>
                 <p className="text-xs text-slate-500 font-medium">AI-Enhanced Curriculum Design</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedStrategy && (
                <div className="hidden md:flex bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-200 items-center shadow-sm mr-2">
                    <span className="text-blue-400 mr-2 text-xs uppercase tracking-wider font-bold">Strategy:</span>
                    {selectedStrategy.label}
                </div>
            )}
            
            {/* Voice Assistant Button (Stationary in Header) */}
            <VoiceAssistant 
                apiKey={process.env.API_KEY || ''} 
                currentInput={currentFormData}
                currentPlan={planMarkdown}
            />

            {/* Text Chat Button */}
            <button 
              onClick={() => setIsChatOpen(true)}
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${isChatOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Open Chat Assistant"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto">
            
            <div className={`transition-all duration-500 ${appState === AppState.SUCCESS ? 'mb-12' : 'mb-8'}`}>
               {appState !== AppState.SUCCESS && (
                 <div className="mb-8 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Your Lesson Plan</h2>
                    <p className="text-slate-600 max-w-2xl">
                        Select a questioning strategy from the sidebar, fill in your lesson details, and let the AI build a robust plan aligned with CEL 5D+ and Biblical integration.
                    </p>
                 </div>
               )}
               
               <div className={appState === AppState.SUCCESS ? "hidden" : "block"}>
                   {selectedStrategy && <StrategyInfo strategy={selectedStrategy} />}
                   
                   <InputForm 
                      selectedStrategy={selectedStrategy} 
                      onSubmit={handleGenerate} 
                      isLoading={appState === AppState.LOADING}
                      data={currentFormData}
                      onChange={setCurrentFormData}
                   />
               </div>
               
               {appState === AppState.SUCCESS && (
                   <button 
                     onClick={() => setAppState(AppState.IDLE)}
                     className="mb-6 text-sm text-slate-500 hover:text-blue-600 flex items-center underline"
                   >
                     ← Create another lesson
                   </button>
               )}
            </div>

            {appState === AppState.ERROR && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                            <p className="text-sm text-red-700 mt-1">
                                {errorMsg}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {appState === AppState.SUCCESS && (
               <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <PlanDisplay markdown={planMarkdown} />
               </div>
            )}

             {appState === AppState.IDLE && !selectedStrategy && (
                 <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                     <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <LayoutDashboard className="w-8 h-8 text-slate-300" />
                     </div>
                     <p className="text-slate-500 font-medium text-lg">Select a strategy from the menu to get started</p>
                     <p className="text-slate-400 text-sm mt-2">Choose from Bloom's, SCAMPER, 6 Hats, and more</p>
                 </div>
             )}
          </div>
        </main>

        {/* Text Chat Interface */}
        <ChatInterface 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          currentInput={currentFormData}
          currentPlan={planMarkdown}
        />

      </div>
    </div>
  );
};

export default App;