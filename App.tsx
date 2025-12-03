
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { PlanDisplay } from './components/PlanDisplay';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ChatInterface } from './components/ChatInterface';
import { StrategyInfo } from './components/StrategyInfo';
import { SaveDialog } from './components/SaveDialog';
import { StrategyNode, LessonInput, AppState, ReferenceFile, LessonVersion, SavedPlan } from './types';
import { strategies } from './data/strategies'; // Import strategies for lookups
import { generateLessonPlan } from './services/geminiService';
import { LayoutDashboard, AlertCircle, MessageSquare, RefreshCw, Upload, Link as LinkIcon, X, Plus, History, Clock, Save, Info } from 'lucide-react';

const App: React.FC = () => {
  // State for selected IDs (multi-select)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Track IDs that were used to generate the CURRENT plan to detect dirty state
  const [lastUsedStrategyIds, setLastUsedStrategyIds] = useState<string[]>([]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [planMarkdown, setPlanMarkdown] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Version History State
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  
  // Persistence / Saved Plans
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Refinement text for the bottom bar
  const [refinementText, setRefinementText] = useState('');
  
  // State for supplementary files/links added during refinement phase
  const [refinementFiles, setRefinementFiles] = useState<ReferenceFile[]>([]);
  const [refinementLinkText, setRefinementLinkText] = useState('');
  const [refinementLinks, setRefinementLinks] = useState<string[]>([]);
  const refinementFileRef = useRef<HTMLInputElement>(null);

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

  // --- PERSISTENCE LOAD ON MOUNT ---
  useEffect(() => {
    const loaded = localStorage.getItem('yiss_saved_plans');
    if (loaded) {
      try {
        setSavedPlans(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to parse saved plans", e);
      }
    }
    setIsStorageLoaded(true);
  }, []);

  // --- PERSISTENCE SAVE ON CHANGE ---
  useEffect(() => {
    if (isStorageLoaded) {
        localStorage.setItem('yiss_saved_plans', JSON.stringify(savedPlans));
    }
  }, [savedPlans, isStorageLoaded]);

  // --- AUTO SAVE TO CURRENT PLAN ---
  // When working on an EXISTING plan, auto-save changes to the main record and memory
  useEffect(() => {
    if (currentPlanId && appState === AppState.SUCCESS && planMarkdown) {
        setSavedPlans(prev => prev.map(plan => {
            if (plan.id === currentPlanId) {
                // Determine if this is a "new" version compared to what's stored
                // Note: We don't push to 'versions' array here to avoid spamming history
                // We just update the "current state" of the plan
                return {
                    ...plan,
                    updatedAt: Date.now(),
                    markdown: planMarkdown,
                    data: currentFormData,
                    strategyIds: selectedIds
                };
            }
            return plan;
        }));
    }
  }, [planMarkdown, currentFormData, selectedIds, currentPlanId, appState]);

  // --- AUTO SAVE TO VERSION HISTORY (Memory Only) ---
  // This creates undo points in the session
  useEffect(() => {
    if (appState === AppState.SUCCESS && planMarkdown) {
        const newVersion: LessonVersion = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            markdown: planMarkdown,
            strategyIds: [...selectedIds],
            description: 'Auto-saved'
        };
        // Avoid duplicates
        setVersions(prev => {
            if (prev.length > 0 && prev[0].markdown === planMarkdown) {
                return prev;
            }
            return [newVersion, ...prev].slice(0, 20); 
        });
    }
  }, [planMarkdown, appState]);

  const handleCreateNewPlan = () => {
      setCurrentPlanId(null);
      setAppState(AppState.IDLE);
      setPlanMarkdown('');
      setSelectedIds([]);
      setLastUsedStrategyIds([]);
      setVersions([]);
      setCurrentFormData({
        unitName: '',
        topic: '',
        gradeLevel: '',
        subject: '',
        standards: '',
        context: '',
        files: [],
        links: []
      });
      setErrorMsg('');
      setIsSidebarCollapsed(false);
  };

  const handleLoadPlan = (plan: SavedPlan) => {
      setCurrentPlanId(plan.id);
      setCurrentFormData(plan.data);
      setPlanMarkdown(plan.markdown);
      setSelectedIds(plan.strategyIds);
      setVersions(plan.versions);
      setLastUsedStrategyIds(plan.strategyIds);
      
      if (plan.markdown) {
        setAppState(AppState.SUCCESS);
      } else {
        setAppState(AppState.IDLE);
      }
      // On mobile/narrow screens, maybe collapse sidebar?
  };

  const handleDeletePlan = (id: string) => {
      if (window.confirm("Are you sure you want to delete this lesson plan?")) {
          setSavedPlans(prev => prev.filter(p => p.id !== id));
          if (currentPlanId === id) {
              handleCreateNewPlan();
          }
      }
  };

  const handleRenamePlan = (id: string, newName: string) => {
    setSavedPlans(prev => prev.map(p => 
        p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p
    ));
  };

  const handleSaveClick = () => {
      if (!currentPlanId) {
          setIsSaveDialogOpen(true);
      } else {
          // Explicit save adds a named version marker
          const newVersion: LessonVersion = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            markdown: planMarkdown,
            strategyIds: [...selectedIds],
            description: 'Manual Save'
          };
          
          setVersions(prev => [newVersion, ...prev]);
          
          setSavedPlans(prev => prev.map(p => {
              if (p.id === currentPlanId) {
                  return {
                      ...p,
                      updatedAt: Date.now(),
                      markdown: planMarkdown,
                      data: currentFormData,
                      strategyIds: selectedIds,
                      versions: [newVersion, ...p.versions] // Persist the version history
                  };
              }
              return p;
          }));
      }
  };

  const handleNewPlanSave = (name: string) => {
      const newVersion: LessonVersion = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        markdown: planMarkdown,
        strategyIds: [...selectedIds],
        description: 'Initial Save'
      };

      const newPlan: SavedPlan = {
          id: crypto.randomUUID(),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          data: currentFormData,
          markdown: planMarkdown,
          strategyIds: selectedIds,
          versions: [newVersion]
      };

      setSavedPlans(prev => [newPlan, ...prev]);
      setCurrentPlanId(newPlan.id);
      setVersions([newVersion]);
  };

  const handleRestoreVersion = (version: LessonVersion) => {
    setPlanMarkdown(version.markdown);
    setSelectedIds(version.strategyIds);
    setLastUsedStrategyIds(version.strategyIds);
    setAppState(AppState.SUCCESS);
    setIsHistoryOpen(false); // Close history panel
  };

  // Helper to find all selected nodes
  const getSelectedStrategies = (): StrategyNode[] => {
    const selectedNodes: StrategyNode[] = [];
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
  const currentSelectionSignature = [...selectedIds].sort().join(',');
  const lastUsedSignature = [...lastUsedStrategyIds].sort().join(',');
  const isSelectionDirty = appState === AppState.SUCCESS && currentSelectionSignature !== lastUsedSignature;
  
  // Has the user typed something in the refinement box?
  const isRefinementActive = refinementText.trim().length > 0 || refinementFiles.length > 0 || refinementLinks.length > 0;

  const handleToggleStrategy = (id: string) => {
    setSelectedIds(prev => {
        if (prev.includes(id)) {
            return prev.filter(item => item !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const handleRefinementFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: ReferenceFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
          const base64Data = base64.split(',')[1];
          newFiles.push({ name: file.name, mimeType: file.type, data: base64Data });
        } catch (err) { console.error(err); }
      }
      setRefinementFiles(prev => [...prev, ...newFiles]);
      if (refinementFileRef.current) refinementFileRef.current.value = '';
    }
  };

  const addRefinementLink = () => {
      if (refinementLinkText.trim()) {
          setRefinementLinks(prev => [...prev, refinementLinkText.trim()]);
          setRefinementLinkText('');
      }
  };

  const handleGenerate = async () => {
    if (selectedStrategies.length === 0) return;

    setAppState(AppState.LOADING);
    setErrorMsg('');
    
    const updatedFormData = {
        ...currentFormData,
        files: [...(currentFormData.files || []), ...refinementFiles],
        links: [...(currentFormData.links || []), ...refinementLinks]
    };

    const planToRefine = appState === AppState.SUCCESS ? planMarkdown : undefined;

    try {
      const result = await generateLessonPlan(updatedFormData, selectedStrategies, refinementText, planToRefine);
      
      setPlanMarkdown(result);
      setAppState(AppState.SUCCESS);
      setLastUsedStrategyIds(selectedIds);
      
      // Update form data with accumulated files
      setCurrentFormData(updatedFormData);
      
      // Clear refinement inputs
      setRefinementText('');
      setRefinementFiles([]);
      setRefinementLinks([]);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Failed to generate lesson plan. Please check your API key.");
    }
  };

  const handleBackToEditor = () => {
      // If we are just viewing a saved plan, going back shouldn't reset the ID, but should allow editing inputs
      setAppState(AppState.IDLE);
      setIsSidebarCollapsed(false); 
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        onToggleStrategy={handleToggleStrategy} 
        selectedIds={selectedIds} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        allowCollapse={appState === AppState.SUCCESS}
        savedPlans={savedPlans}
        onLoadPlan={handleLoadPlan}
        onDeletePlan={handleDeletePlan}
        onRenamePlan={handleRenamePlan}
        currentPlanId={currentPlanId}
        onNewPlan={handleCreateNewPlan}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col transition-all duration-300">
        
        {/* Top Navigation / Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-md">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">YISS AI Integrated Lesson Planner</h1>
              {/* Only show subtitle if a plan is actively loaded/named */}
              {currentPlanId && (
                <div className="flex items-center text-xs font-medium mt-0.5 animate-in fade-in">
                    <span className="mr-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                      {savedPlans.find(p => p.id === currentPlanId)?.name}
                    </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             {appState === AppState.SUCCESS && (
                <>
                  <button
                    onClick={handleSaveClick}
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors relative"
                    title="Save Plan"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className={`p-2 rounded-full transition-colors relative ${isHistoryOpen ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    title="Version History"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                </>
             )}

             <VoiceAssistant 
                apiKey={process.env.API_KEY || ''} 
                currentInput={currentFormData}
                currentPlan={planMarkdown}
                currentPlanId={currentPlanId} // Pass ID for chat persistence
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
          
          {appState === AppState.ERROR && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{errorMsg}</span>
            </div>
          )}

          {appState !== AppState.SUCCESS && (
            <>
               {selectedStrategies.length > 0 ? (
                 <StrategyInfo strategies={selectedStrategies} />
               ) : (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-8">
                    <h3 className="text-blue-800 font-bold text-lg mb-1">Select Strategies</h3>
                    <p className="text-blue-600">Choose Questioning Strategies, Biblical Integration (PAQ), or CEL 5D+ from the sidebar.</p>
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

          {appState === AppState.SUCCESS && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-between items-center mb-6">
                 <button 
                    onClick={handleBackToEditor}
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

      {/* History Side Panel */}
      {isHistoryOpen && (
        <div className="w-72 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-20 animate-in slide-in-from-right duration-300">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center font-bold text-slate-700">
                   <Clock className="w-4 h-4 mr-2" /> Version History
               </div>
               <button onClick={() => setIsHistoryOpen(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {versions.length === 0 ? (
                   <div className="text-xs text-slate-400 p-4 text-center italic">No versions saved yet.</div>
               ) : (
                   versions.map((ver) => (
                       <div key={ver.id} 
                            onClick={() => handleRestoreVersion(ver)}
                            className={`p-3 rounded-lg border cursor-pointer hover:border-blue-300 transition-all ${ver.markdown === planMarkdown ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200'}`}
                       >
                           <div className="text-xs font-bold text-slate-700 mb-1">{ver.description}</div>
                           <div className="text-[10px] text-slate-400 flex justify-between">
                               <span>{new Date(ver.timestamp).toLocaleTimeString()}</span>
                               <span>{new Date(ver.timestamp).toLocaleDateString()}</span>
                           </div>
                       </div>
                   ))
               )}
           </div>
        </div>
      )}

      {/* Refinement Bar */}
      {appState === AppState.SUCCESS && (
        <div 
            className={`fixed bottom-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-20 flex flex-col gap-3 animate-in slide-in-from-bottom-full duration-500 transition-all duration-300`}
            style={{ left: isSidebarCollapsed ? '4rem' : '20rem', right: isHistoryOpen ? '18rem' : 0 }}
        >
             <div className="flex gap-4 items-start">
                 <div className="flex-1 flex flex-col gap-2">
                     <textarea 
                        value={refinementText} 
                        onChange={(e) => setRefinementText(e.target.value)}
                        placeholder="Type changes here (e.g. 'Make the intro shorter', 'Change the group activity')..."
                        rows={1}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 px-4 text-sm bg-slate-50 resize-none"
                     />
                     <div className="flex items-center gap-3 text-xs">
                         <span className="text-slate-400 font-medium uppercase tracking-wider">Add Missing Info:</span>
                         <button 
                            onClick={() => refinementFileRef.current?.click()}
                            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded"
                         >
                            <Upload className="w-3 h-3 mr-1" />
                            {refinementFiles.length > 0 ? `${refinementFiles.length} files attached` : 'Attach Files'}
                         </button>
                         <input type="file" ref={refinementFileRef} onChange={handleRefinementFileChange} multiple className="hidden" />

                         <div className="flex items-center relative group">
                            <LinkIcon className="w-3 h-3 text-slate-400 absolute left-2" />
                            <input 
                                type="text" 
                                value={refinementLinkText}
                                onChange={(e) => setRefinementLinkText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addRefinementLink()}
                                placeholder="Paste URL..."
                                className="pl-6 pr-6 py-1 rounded border border-slate-200 bg-slate-50 text-slate-600 w-32 focus:w-64 transition-all"
                            />
                            <button onClick={addRefinementLink} disabled={!refinementLinkText} className="absolute right-1 text-slate-400 hover:text-blue-500">
                                <Plus className="w-3 h-3" />
                            </button>
                         </div>
                         {refinementLinks.length > 0 && <span className="text-blue-600">{refinementLinks.length} links added</span>}
                     </div>
                 </div>

                 <button 
                    onClick={handleGenerate}
                    className={`
                        flex items-center px-6 py-4 rounded-lg font-bold text-white shadow-md transition-all h-full
                        ${appState === AppState.LOADING 
                            ? 'bg-slate-400 cursor-wait' 
                            : isRefinementActive 
                                ? 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-300 ring-offset-1 scale-105' 
                                : isSelectionDirty 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                        }
                    `}
                 >
                    <RefreshCw className={`w-4 h-4 mr-2 ${appState === AppState.LOADING ? 'animate-spin' : ''}`} />
                    {appState === AppState.LOADING 
                        ? 'Updating...' 
                        : isRefinementActive
                            ? 'Update Plan'
                            : isSelectionDirty 
                                ? 'Update Strategies' 
                                : 'Update Plan'
                    }
                 </button>
             </div>
             
             {(refinementFiles.length > 0 || refinementLinks.length > 0) && (
                 <div className="flex gap-2 flex-wrap">
                     {refinementFiles.map((f, i) => (
                         <div key={`f-${i}`} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs flex items-center">
                             <Upload className="w-3 h-3 mr-1" /> {f.name} <button onClick={() => setRefinementFiles(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                         </div>
                     ))}
                     {refinementLinks.map((l, i) => (
                         <div key={`l-${i}`} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-xs flex items-center">
                             <LinkIcon className="w-3 h-3 mr-1" /> Link <button onClick={() => setRefinementLinks(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      )}

      {/* Save Dialog Modal */}
      <SaveDialog 
        isOpen={isSaveDialogOpen} 
        onClose={() => setIsSaveDialogOpen(false)} 
        onSave={handleNewPlanSave} 
      />

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
