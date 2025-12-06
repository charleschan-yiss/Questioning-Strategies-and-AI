
import React, { useRef, useState } from 'react';
import { LessonInput, StrategyNode, ReferenceFile, StrategySuggestion } from '../types';
import { Sparkles, Loader2, Upload, Link as LinkIcon, FileText, X, Video, Music, Image as ImageIcon, Plus, Globe, Lightbulb, Check } from 'lucide-react';

interface InputFormProps {
  selectedStrategies: StrategyNode[];
  selectedStrategyIds: string[];
  onSubmit: () => void;
  isLoading: boolean;
  data: LessonInput;
  onChange: (data: LessonInput) => void;
  // Recommender Props
  onGetSuggestions: (purpose: string) => void;
  suggestions: StrategySuggestion[];
  isSuggesting: boolean;
  onSelectStrategy: (id: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ 
    selectedStrategies, 
    selectedStrategyIds,
    onSubmit, 
    isLoading, 
    data, 
    onChange,
    onGetSuggestions,
    suggestions,
    isSuggesting,
    onSelectStrategy
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempLink, setTempLink] = useState('');
  const [suggestionPurpose, setSuggestionPurpose] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Details Toggle State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const strategiesRef = useRef<HTMLDivElement>(null);
  
  const [showUploadShake, setShowUploadShake] = useState(false);
  const [showStrategyShake, setShowStrategyShake] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const processFiles = async (files: FileList) => {
    const newFiles: ReferenceFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Simple Base64 conversion
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        // Strip the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64.split(',')[1];

        newFiles.push({
          name: file.name,
          mimeType: file.type,
          data: base64Data
        });
      } catch (err) {
        console.error("Error reading file:", file.name, err);
      }
    }

    onChange({ ...data, files: [...(data.files || []), ...newFiles] });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...data.files];
    updatedFiles.splice(index, 1);
    onChange({ ...data, files: updatedFiles });
  };

  const addLink = () => {
    if (tempLink.trim()) {
        onChange({ ...data, links: [...(data.links || []), tempLink.trim()] });
        setTempLink('');
    }
  };

  const removeLink = (index: number) => {
    const updatedLinks = [...(data.links || [])];
    updatedLinks.splice(index, 1);
    onChange({ ...data, links: updatedLinks });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4 text-red-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4 text-pink-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  const inputClasses = "w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm bg-white text-slate-900 placeholder-slate-400";

  const hasContent = 
    (data.files && data.files.length > 0) || 
    (data.topic && data.topic.length > 2) || 
    (data.context && data.context.length > 5) ||
    (data.subject && data.subject.length > 1) ||
    (data.gradeLevel && data.gradeLevel.length > 0) ||
    (data.standards && data.standards.length > 5) ||
    (data.unitName && data.unitName.length > 2);

  const handleGenerateClick = () => {
      // Phase 1: Content Check
      // If no file uploaded AND no sufficient manual details, shake the upload box.
      
      const hasSufficientManualInput = 
        (data.topic && data.topic.length > 2) || 
        (data.context && data.context.length > 5) ||
        (data.subject && data.subject.length > 1) ||
        (data.standards && data.standards.length > 5) ||
        (data.unitName && data.unitName.length > 2);

      if ((!data.files || data.files.length === 0) && !hasSufficientManualInput) {
          // Scroll up to show the upload box
          if (isDetailsOpen || window.scrollY > 200) {
              document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
          }
          
          setShowUploadShake(true);
          setTimeout(() => setShowUploadShake(false), 800);
          return;
      }

      // Phase 2: Strategy Check
      // If content exists but NO strategies selected, shake the suggestion box.
      if (selectedStrategyIds.length === 0) {
          if (strategiesRef.current) {
              strategiesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setShowStrategyShake(true);
          setTimeout(() => setShowStrategyShake(false), 800);
          return;
      }
      
      // All checks passed
      onSubmit();
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PRIMARY UPLOAD SECTION (HERO) */}
      <div 
        ref={uploadSectionRef}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          group relative rounded-2xl shadow-sm border-2 border-dashed transition-all duration-300 cursor-pointer mb-6 overflow-hidden
          ${showUploadShake ? 'animate-shake border-amber-300 bg-amber-50' : ''}
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg ring-2 ring-blue-200' 
            : data.files && data.files.length > 0 
                ? 'border-blue-400 bg-blue-50/30' 
                : (!showUploadShake ? 'border-slate-300 bg-white hover:border-blue-400 hover:shadow-md' : '')
          }
        `}
      >
        <div className="p-10 flex flex-col items-center justify-center text-center relative z-10">
            <div className={`
                p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110
                ${showUploadShake ? 'bg-amber-100 text-amber-600' : ''}
                ${!showUploadShake && isDragging ? 'bg-blue-200 text-blue-700 scale-110' : (!showUploadShake && data.files && data.files.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600')}
            `}>
                <Upload className="w-10 h-10" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${showUploadShake ? 'text-amber-800' : 'text-slate-800'}`}>
                {isDragging ? 'Drop Files Here' : 'Upload Lesson Plan & Materials'}
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                Drag & Drop files here, or click to select.<br/>
                Alternatively, fill in the "Manual Context & Details" section below.
            </p>
            
            <button type="button" className={`
                font-medium py-2 px-6 rounded-lg shadow-sm transition-colors z-10
                ${isDragging ? 'bg-blue-600 text-white border-transparent' : 'bg-white border border-slate-300 text-slate-700 group-hover:border-blue-400 group-hover:text-blue-600'}
            `}>
                Select Files
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.txt,.html,.md,.ppt,.pptx,image/*,audio/*,video/*"
                className="hidden" 
            />
        </div>

        {/* File Preview List inside Hero */}
        {data.files && data.files.length > 0 && (
            <div className="bg-white border-t border-slate-200 p-4 rounded-b-2xl relative z-20" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Attached Files ({data.files.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group/file hover:border-blue-300 transition-colors">
                            <div className="flex items-center overflow-hidden gap-3">
                                <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                    {getFileIcon(file.mimeType)}
                                </div>
                                <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
                            </div>
                            <button 
                                onClick={() => removeFile(idx)}
                                className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                title="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* SECONDARY MANUAL DETAILS (COLLAPSIBLE) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8" ref={detailsRef}>
          <button 
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
          >
              <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3 bg-blue-100 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Manual Context & Details</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Subject, Standards, Grade Level (Optional if included in file)</p>
                  </div>
              </div>
              <div className={`transform transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
          </button>
          
          {isDetailsOpen && (
              <div className="p-6 bg-white animate-in slide-in-from-top-2">
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Subject</label>
                            <input 
                                type="text" 
                                name="subject"
                                value={data.subject}
                                onChange={handleChange}
                                placeholder="Enter Subject..."
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Grade Level</label>
                            <input 
                                type="text" 
                                name="gradeLevel"
                                value={data.gradeLevel}
                                onChange={handleChange}
                                placeholder="Enter Grade Level..."
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Unit Name</label>
                            <input 
                                type="text" 
                                name="unitName"
                                value={data.unitName}
                                onChange={handleChange}
                                placeholder="Enter Unit Name..."
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Topic</label>
                            <input 
                                type="text" 
                                name="topic"
                                value={data.topic}
                                onChange={handleChange}
                                placeholder="Enter Specific Topic..."
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Standards</label>
                        <textarea 
                            name="standards"
                            value={data.standards}
                            onChange={handleChange}
                            rows={2}
                            placeholder="List applicable standards..."
                            className={inputClasses}
                        />
                    </div>

                    {/* LINKS SECTION */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Reference Links</label>
                        <div className="flex gap-2 mb-2">
                             <div className="relative flex-1">
                                <Globe className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={tempLink}
                                    onChange={(e) => setTempLink(e.target.value)}
                                    placeholder="Paste URL (YouTube, Website)..."
                                    className={`${inputClasses} pl-9`}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                                />
                             </div>
                             <button 
                                type="button"
                                onClick={addLink}
                                disabled={!tempLink.trim()}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg px-3 transition-colors disabled:opacity-50 flex items-center"
                                title="Add Link"
                             >
                                <Plus className="w-5 h-5" />
                             </button>
                        </div>
                        
                        {/* Link List */}
                        {data.links && data.links.length > 0 && (
                            <ul className="space-y-2 mt-3">
                                {data.links.map((link, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                        <div className="flex items-center truncate mr-2">
                                            <LinkIcon className="w-3.5 h-3.5 text-blue-500 mr-2 flex-shrink-0" />
                                            <span className="truncate text-blue-600 underline" title={link}>{link}</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => removeLink(idx)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                            title="Remove Link"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Additional Context</label>
                        <textarea 
                            name="context"
                            value={data.context}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Any specific class needs, details about the uploaded files..."
                            className={inputClasses}
                        />
                    </div>
                 </div>
              </div>
          )}
      </div>

      {/* AI STRATEGY RECOMMENDER SECTION */}
      <div 
        ref={strategiesRef}
        className={`mb-6 pt-4 border-t border-slate-200 rounded-lg p-4 transition-all duration-300 ${showStrategyShake ? 'animate-shake bg-amber-50 border border-amber-300' : 'bg-transparent border-transparent'}`}
      >
          <div className="mb-4">
              <h3 className={`text-lg font-bold flex items-center ${showStrategyShake ? 'text-amber-800' : 'text-slate-800'}`}>
                  <Lightbulb className={`w-5 h-5 mr-2 ${showStrategyShake ? 'text-amber-600' : 'text-yellow-500'}`} />
                  Need help deciding strategies?
              </h3>
              <p className={`${showStrategyShake ? 'text-amber-700 font-medium' : 'text-slate-500'} text-sm mt-1`}>
                  Describe your specific goals or leave blank to let AI find opportunities in your lesson.
              </p>
          </div>

          <div className="flex gap-2 mb-4">
             <input
                type="text"
                value={suggestionPurpose}
                onChange={(e) => setSuggestionPurpose(e.target.value)}
                placeholder="E.g., Focus on student engagement..."
                className={`flex-1 ${inputClasses}`}
             />
             <button 
                  onClick={() => onGetSuggestions(suggestionPurpose)}
                  disabled={!hasContent}
                  className={`
                      flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                      ${!hasContent 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : isSuggesting
                              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' // Cancel style
                              : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm'
                      }
                      ${showStrategyShake && !isSuggesting ? 'ring-2 ring-amber-200 border-amber-300 text-amber-800' : ''}
                  `}
              >
                  {isSuggesting ? (
                      <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                      </>
                  ) : (
                      <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Suggest Strategies
                      </>
                  )}
              </button>
          </div>

          {suggestions.length > 0 && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4 duration-500 mt-4 mb-8">
                  {suggestions.map((suggestion) => {
                      const isSelected = selectedStrategyIds.includes(suggestion.id);
                      return (
                          <div key={suggestion.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-blue-300 transition-colors">
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 flex items-center mb-1">
                                      {suggestion.label}
                                      {isSelected && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Selected</span>}
                                  </h4>
                                  <p className="text-sm text-slate-600 mb-2 font-medium">
                                      Why: <span className="font-normal italic text-slate-500">{suggestion.rationale}</span>
                                  </p>
                                  {/* Render action if available (new type definition required) */}
                                  {(suggestion as any).action && (
                                      <p className="text-sm text-slate-600">
                                          <span className="font-bold text-blue-600">Action:</span> {(suggestion as any).action}
                                      </p>
                                  )}
                              </div>
                              <button 
                                  onClick={() => onSelectStrategy(suggestion.id)}
                                  className={`
                                      flex-shrink-0 px-4 py-2 rounded-md text-sm font-bold transition-all h-fit mt-1
                                      ${isSelected
                                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                      }
                                  `}
                              >
                                  {isSelected ? (
                                      <span className="flex items-center"><Check className="w-4 h-4 mr-2" /> Added</span>
                                  ) : (
                                      <span className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Select</span>
                                  )}
                              </button>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>

      {/* GENERATE BUTTON */}
      <button 
          onClick={handleGenerateClick}
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-bold text-lg transition-all transform duration-200
              ${isLoading
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }
          `}
      >
          {isLoading ? (
              <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing & Generating Plan...
              </>
          ) : (
              <span className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Customized Lesson Plan
                  {selectedStrategies.length > 0 && <span className="ml-2 text-blue-200 text-sm font-normal">({selectedStrategies.length} Strategies)</span>}
              </span>
          )}
      </button>

    </div>
  );
};
