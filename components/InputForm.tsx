
import React, { useRef, useState } from 'react';
import { LessonInput, StrategyNode, ReferenceFile } from '../types';
import { Sparkles, Loader2, Upload, Link as LinkIcon, FileText, X, Video, Music, Image as ImageIcon, Plus, Globe } from 'lucide-react';

interface InputFormProps {
  selectedStrategies: StrategyNode[];
  onSubmit: () => void;
  isLoading: boolean;
  data: LessonInput;
  onChange: (data: LessonInput) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ selectedStrategies, onSubmit, isLoading, data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempLink, setTempLink] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PRIMARY UPLOAD SECTION (HERO) */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          group relative rounded-2xl shadow-sm border-2 border-dashed transition-all duration-300 cursor-pointer mb-6 overflow-hidden
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg ring-2 ring-blue-200' 
            : data.files && data.files.length > 0 
                ? 'border-blue-400 bg-blue-50/30' 
                : 'border-slate-300 bg-white hover:border-blue-400 hover:shadow-md'
          }
        `}
      >
        <div className="p-10 flex flex-col items-center justify-center text-center relative z-10">
            <div className={`
                p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110
                ${isDragging ? 'bg-blue-200 text-blue-700 scale-110' : (data.files && data.files.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600')}
            `}>
                <Upload className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
                {isDragging ? 'Drop Files Here' : 'Upload Lesson Plan & Materials'}
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                Drag & Drop files here, or click to select.<br/>
                Upload your lesson plan PDF here, along with any supporting images, audio, or video.
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

      {/* SECONDARY MANUAL DETAILS (PERMANENTLY VISIBLE) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="w-full flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3 bg-blue-100 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Manual Context & Details</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Subject, Standards, Grade Level (Optional if included in file)</p>
                  </div>
              </div>
          </div>
          
          <div className="p-6 bg-white">
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
      </div>

      {/* GENERATE BUTTON */}
      <button 
          onClick={onSubmit}
          disabled={isLoading || selectedStrategies.length === 0}
          className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-bold text-lg transition-all transform duration-200
              ${isLoading || selectedStrategies.length === 0
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
          ) : selectedStrategies.length === 0 ? (
              <span className="flex items-center">
                  Select at least one Strategy to Begin
              </span>
          ) : (
              <span className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Plan with {selectedStrategies.length} Strateg{selectedStrategies.length === 1 ? 'y' : 'ies'}
              </span>
          )}
      </button>
    </div>
  );
};
