import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Loader2, Bot, User } from 'lucide-react';
import { ChatMessage, LessonInput } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentInput: LessonInput;
  currentPlan: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, currentInput, currentPlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you refine your lesson plan or brainstorm ideas. What are you thinking about?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !process.env.API_KEY) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct a context-aware prompt
      const contextPrompt = `
        Current Lesson Context:
        Subject: ${currentInput.subject}
        Topic: ${currentInput.topic}
        Grade: ${currentInput.gradeLevel}
        
        Generated Plan (if any):
        ${currentPlan ? currentPlan.substring(0, 1000) + '...' : 'No plan generated yet.'}

        User Question: ${userMsg}

        You are a helpful teaching assistant. specific, practical, and brief.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextPrompt
      });

      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-blue-600 text-white">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">AI Lesson Assistant</h3>
        </div>
        <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
            }`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your lesson..."
            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2 border bg-white text-slate-900 placeholder-slate-400"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};