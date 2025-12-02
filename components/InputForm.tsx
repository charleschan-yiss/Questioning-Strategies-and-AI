import React from 'react';
import { LessonInput, StrategyNode } from '../types';
import { Sparkles, Loader2 } from 'lucide-react';

interface InputFormProps {
  selectedStrategy: StrategyNode | null;
  onSubmit: () => void;
  isLoading: boolean;
  data: LessonInput;
  onChange: (data: LessonInput) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ selectedStrategy, onSubmit, isLoading, data, onChange }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
        Lesson Context
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input 
                    required
                    type="text" 
                    name="subject"
                    value={data.subject}
                    onChange={handleChange}
                    placeholder="e.g. Science, History, Bible"
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                <input 
                    required
                    type="text" 
                    name="gradeLevel"
                    value={data.gradeLevel}
                    onChange={handleChange}
                    placeholder="e.g. 5th Grade, HS Sophomore"
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
                <input 
                    required
                    type="text" 
                    name="unitName"
                    value={data.unitName}
                    onChange={handleChange}
                    placeholder="e.g. Ecosystems, Ancient Rome"
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specific Lesson Topic</label>
                <input 
                    required
                    type="text" 
                    name="topic"
                    value={data.topic}
                    onChange={handleChange}
                    placeholder="e.g. Food Webs, The Fall of Rome"
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Standards / I Can Statements</label>
            <textarea 
                name="standards"
                value={data.standards}
                onChange={handleChange}
                rows={2}
                placeholder="List applicable standards..."
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Context (Optional)</label>
            <textarea 
                name="context"
                value={data.context}
                onChange={handleChange}
                rows={2}
                placeholder="Any specific class needs, previous lessons, or materials available..."
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 border text-sm"
            />
        </div>

        <div className="pt-2">
            <button 
                type="submit" 
                disabled={isLoading || !selectedStrategy}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-colors
                    ${isLoading || !selectedStrategy 
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }
                `}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Plan...
                    </>
                ) : !selectedStrategy ? (
                    "Select a Strategy from Sidebar to Begin"
                ) : (
                    `Generate Plan using ${selectedStrategy.label}`
                )}
            </button>
        </div>
      </form>
    </div>
  );
};