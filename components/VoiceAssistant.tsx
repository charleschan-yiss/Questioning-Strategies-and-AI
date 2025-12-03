
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, X, Loader2, Radio, MessageSquare, Copy, Check, VolumeX, Volume2, AlertCircle, Trash2 } from 'lucide-react';
import { LessonInput } from '../types';

interface VoiceAssistantProps {
  apiKey: string;
  currentInput: LessonInput;
  currentPlan: string;
  currentPlanId: string | null;
}

interface TranscriptItem {
  id: string;
  role: 'user' | 'agent';
  text: string;
  isPartial?: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ apiKey, currentInput, currentPlan, currentPlanId }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // User mic mute state
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Transcript State
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Session Refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentSessionRef = useRef<any>(null);

  // Audio Playback State
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Track previous plan length to detect generation events
  const prevPlanRef = useRef<string>("");
  
  // Keep alive interval
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persistence Key
  const storageKey = `yiss_voice_chat_${currentPlanId || 'draft'}`;

  // Load chat history when switching plans
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            setTranscripts(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse chat history", e);
            setTranscripts([]);
        }
    } else {
        setTranscripts([]);
    }
  }, [currentPlanId, storageKey]);

  // Auto-save chat history on change
  useEffect(() => {
    if (transcripts.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(transcripts));
    }
  }, [transcripts, storageKey]);

  const clearHistory = () => {
    if (window.confirm("Clear voice chat history for this plan?")) {
        setTranscripts([]);
        localStorage.removeItem(storageKey);
    }
  };

  const cleanupAudio = () => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);

    // Stop all scheduled sources
    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    scheduledSourcesRef.current.clear();

    // Close inputs
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    // Close contexts
    if (inputContextRef.current) {
      try { inputContextRef.current.close(); } catch(e) {}
      inputContextRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }

    // Close session
    if (currentSessionRef.current) {
        currentSessionRef.current = null;
    }
    sessionPromiseRef.current = null;
  };

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    // DO NOT CLEAR TRANSCRIPTS HERE to preserve history
    setIsMuted(false);

    try {
      // 1. Initialize Audio Contexts immediately on user gesture
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass();
      const outputCtx = new AudioContextClass();
      
      // Resume immediately to unlock audio on browsers like Chrome/Safari
      await inputCtx.resume();
      await outputCtx.resume();

      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;
      
      const inputRate = inputCtx.sampleRate;

      // 2. Request Mic Permission explicitly first to catch denial early
      if (!navigator.mediaDevices) {
          throw new Error("Microphone access not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to API
      const ai = new GoogleGenAI({ apiKey });
      
      // Start Keep-Alive to prevent AudioContext suspension
      keepAliveRef.current = setInterval(() => {
         if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
             audioContextRef.current.resume();
         }
      }, 1000);

      // PREPARE HISTORY FOR CONTEXT
      // Limit to last 10 messages to avoid context overflow, although models handle large context well.
      const historyContext = transcripts.slice(-10).map(t => 
        `${t.role === 'agent' ? 'AI' : 'TEACHER'}: ${t.text}`
      ).join('\n');

      const systemContext = `
        You are a helpful teaching assistant for a teacher at YISS. 
        You help brainstorm lesson ideas, suggest questioning strategies, and discuss educational frameworks like CEL 5D+ and Biblical Integration. 
        
        VISUAL CONTEXT (What is on the teacher's screen):
        The teacher is currently working on:
        - Unit Name: ${currentInput.unitName || '(Empty)'}
        - Topic: ${currentInput.topic || '(Empty)'}
        - Grade Level: ${currentInput.gradeLevel || '(Empty)'}
        - Subject: ${currentInput.subject || '(Empty)'}
        - Standards: ${currentInput.standards || '(Empty)'}
        - Context Notes: ${currentInput.context || '(Empty)'}
        
        LESSON PLAN STATUS:
        ${currentPlan ? "A full lesson plan is currently displayed on screen." : "No lesson plan has been generated yet; the teacher is in the planning phase."}
        ${currentPlan ? `CONTENT OF GENERATED PLAN:\n${currentPlan}` : ""}

        PREVIOUS CONVERSATION HISTORY (Context for continuity):
        ${historyContext ? historyContext : "(No previous conversation)"}

        INSTRUCTIONS:
        1. Keep responses concise, conversational, and encouraging.
        2. If the user asks about the plan, refer to the "CONTENT OF GENERATED PLAN" section above.
        3. If the user asks for text to copy (e.g. "Write that down"), dictate it clearly. Your response is being transcribed so the user can see it.
      `;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          // CORRECTED CONFIGURATION
          outputAudioTranscription: {}, // Must be empty object to enable, no model name
          systemInstruction: systemContext, // Must be string, not object
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Puck"
              }
            }
          }
        },
        callbacks: {
          onopen: () => {
            console.log("Session opened");
            setIsConnecting(false);
            setIsActive(true);
            setIsSpeaking(false);
            
            if (!inputContextRef.current || !streamRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              // MUTE LOGIC: If muted, send silence or nothing
              if (isMuted) return;

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              const uint8 = new Uint8Array(pcmData.buffer);
              let binary = '';
              const len = uint8.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8[i]);
              }
              const b64Data = btoa(binary);

              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                   session.sendRealtimeInput({
                      media: {
                        mimeType: `audio/pcm;rate=${inputRate}`,
                        data: b64Data
                      }
                   });
                });
              }
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // HANDLE AUDIO OUTPUT
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsSpeaking(true);
              const ctx = audioContextRef.current;
              
              if (ctx.state === 'suspended') {
                  await ctx.resume();
              }
              
              const binaryString = atob(audioData);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const int16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(int16.length);
              for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768.0;
              }

              const buffer = ctx.createBuffer(1, float32.length, 24000); 
              buffer.getChannelData(0).set(float32);

              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);

              const currentTime = ctx.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              scheduledSourcesRef.current.add(source);
              source.onended = () => {
                scheduledSourcesRef.current.delete(source);
                if (scheduledSourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                }
              };
            }

            // HANDLE TEXT TRANSCRIPTION
            const outputTranscription = msg.serverContent?.outputTranscription?.text;
            if (outputTranscription) {
                setTranscripts(prev => {
                    const last = prev[prev.length - 1];
                    // If the last message was an agent partial, append to it
                    if (last && last.role === 'agent' && last.isPartial) {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, text: last.text + outputTranscription, isPartial: true } // still streaming
                        ];
                    }
                    // Otherwise start new bubble
                    return [...prev, { id: Date.now().toString(), role: 'agent', text: outputTranscription, isPartial: true }];
                });
            }

            // Mark turn complete
            if (msg.serverContent?.turnComplete) {
                setTranscripts(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'agent') {
                        return [...prev.slice(0, -1), { ...last, isPartial: false }];
                    }
                    return prev;
                });
            }
            
            if (msg.serverContent?.interrupted) {
                 scheduledSourcesRef.current.forEach(s => {
                     try { s.stop(); } catch(e) {}
                 });
                 scheduledSourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
                 setIsSpeaking(false);
            }
          },
          onclose: (e) => {
            console.log("Session closed", e);
            setIsActive(false);
          },
          onerror: (err) => {
            console.error("Session error", err);
            // Distinguish between mic denial and API/other errors if possible
            if (err.toString().includes('NotFoundError') || err.toString().includes('NotAllowedError')) {
                setError("Microphone permission denied.");
            } else {
                setError("Connection failed. Check network or API key.");
            }
            setIsActive(false);
          }
        }
      });

      const session = await sessionPromiseRef.current;
      currentSessionRef.current = session;

    } catch (e: any) {
      console.error(e);
      let errMsg = "Failed to start audio";
      if (e.message?.includes('denied') || e.name === 'NotAllowedError') {
          errMsg = "Microphone permission denied.";
      }
      setError(errMsg);
      setIsConnecting(false);
      cleanupAudio();
    }
  };

  const disconnect = () => {
    setIsActive(false);
    cleanupAudio();
  };

  const toggleMute = () => {
      setIsMuted(!isMuted);
  };
  
  // Ref for mute state to be accessible inside the audio callback closure
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
      isMutedRef.current = isMuted;
  }, [isMuted]);

  // Update the processor logic to use the ref
  useEffect(() => {
      if (processorRef.current) {
          processorRef.current.onaudioprocess = (e) => {
            if (isMutedRef.current) return; // Muted

            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            const uint8 = new Uint8Array(pcmData.buffer);
            let binary = '';
            const len = uint8.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8[i]);
            }
            const b64Data = btoa(binary);

            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                    // Re-check rate inside
                    if (inputContextRef.current) {
                         session.sendRealtimeInput({
                            media: {
                                mimeType: `audio/pcm;rate=${inputContextRef.current.sampleRate}`,
                                data: b64Data
                            }
                        });
                    }
                });
            }
          };
      }
  }, [isActive]); 

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (isActive && currentSessionRef.current && currentPlan && currentPlan !== prevPlanRef.current) {
        const updateMessage = `[SYSTEM EVENT] The teacher has just generated or updated the lesson plan.`;
        try {
            currentSessionRef.current.send({ parts: [{ text: updateMessage }] });
        } catch (e) {
            console.warn("Failed to send context update", e);
        }
    }
    prevPlanRef.current = currentPlan;
  }, [currentPlan, isActive]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div className="relative z-50">
      <button
        onClick={isActive ? disconnect : connect}
        disabled={isConnecting}
        className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center relative ${
            isActive 
            ? 'bg-red-100 text-red-600 ring-2 ring-red-500 ring-opacity-50 animate-pulse-slow' 
            : 'hover:bg-slate-100 text-slate-600'
        }`}
        title={isActive ? "Stop Voice Assistant" : "Start Voice Assistant"}
      >
        {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        ) : isActive ? (
            <Mic className="w-5 h-5" />
        ) : (
            <MicOff className="w-5 h-5" />
        )}
        
        {/* Status Indicator Dot */}
        {isActive && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
        )}
      </button>

      {/* Expanded Status Popover with Chat Log */}
      {(isActive || isConnecting) && (
         <div className="absolute top-full right-0 mt-3 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 w-96 overflow-hidden animate-in slide-in-from-top-2 flex flex-col max-h-[600px] ring-1 ring-slate-900/5">
             
             {/* Header */}
             <div className={`p-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0 transition-colors ${isConnecting ? 'bg-blue-50' : isSpeaking ? 'bg-green-50' : 'bg-white'}`}>
                 <div className="flex items-center space-x-3">
                     {isConnecting ? (
                         <div className="flex items-center text-blue-600">
                             <Loader2 className="w-4 h-4 animate-spin mr-2" />
                             <span className="text-sm font-bold">Connecting...</span>
                         </div>
                     ) : (
                         <div className="flex items-center">
                             <div className={`w-2 h-2 rounded-full mr-2 ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                             <span className="text-sm font-bold text-slate-700">
                                {isSpeaking ? "AI Speaking" : isMuted ? "Mic Muted" : "Listening..."}
                             </span>
                         </div>
                     )}
                 </div>
                 
                 <div className="flex items-center space-x-1">
                    {!isConnecting && (
                        <button 
                            onClick={toggleMute}
                            className={`p-2 rounded-lg transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 text-slate-500'}`}
                            title={isMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    )}
                    
                    {transcripts.length > 0 && (
                        <button 
                            onClick={clearHistory}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600"
                            title="Clear History"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    
                    <button onClick={disconnect} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                 </div>
             </div>
             
             {/* Visualizer / Waveform (Placeholder for active state) */}
             {!isConnecting && (
                 <div className="h-16 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                     {isSpeaking ? (
                         <div className="flex items-center space-x-1">
                             {[...Array(20)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className="w-1 bg-green-500 rounded-full animate-bounce" 
                                    style={{ 
                                        height: `${Math.random() * 20 + 10}px`, 
                                        animationDuration: `${Math.random() * 0.5 + 0.3}s`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                 ></div>
                             ))}
                         </div>
                     ) : isMuted ? (
                         <div className="text-xs text-red-400 font-medium flex items-center">
                             <VolumeX className="w-3 h-3 mr-1" /> Microphone is muted
                         </div>
                     ) : (
                         <div className="flex items-center space-x-1 opacity-30">
                             <div className="w-full h-0.5 bg-slate-400"></div>
                         </div>
                     )}
                 </div>
             )}
             
             {/* Transcript Area */}
             <div className="flex-1 overflow-y-auto p-4 bg-white min-h-[200px] custom-scrollbar space-y-4">
                {transcripts.length === 0 && !isConnecting ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 py-8">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p className="text-xs text-center">Start speaking to see the conversation...</p>
                    </div>
                ) : (
                    transcripts.map((t) => (
                        <div key={t.id} className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between w-full mb-1 px-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${t.role === 'agent' ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {t.role === 'agent' ? 'AI Assistant' : 'You'}
                                </span>
                                {t.role === 'agent' && !t.isPartial && (
                                    <button 
                                        onClick={() => copyToClipboard(t.text, t.id)}
                                        className="text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Copy text"
                                    >
                                        {copiedId === t.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                            <div className={`
                                p-3 rounded-2xl text-sm w-full border relative group
                                ${t.role === 'agent' 
                                    ? 'bg-slate-50 border-slate-100 text-slate-700 rounded-tl-none' 
                                    : 'bg-blue-50 border-blue-100 text-blue-900 rounded-tr-none'}
                            `}>
                                {t.text}
                                {t.isPartial && <span className="inline-block w-1.5 h-3 ml-1 bg-blue-400 animate-pulse"></span>}
                            </div>
                        </div>
                    ))
                )}
             </div>
         </div>
      )}
      
      {error && (
          <div className="absolute top-full right-0 mt-2 bg-red-100 text-red-800 text-xs px-3 py-2 rounded-lg border border-red-200 whitespace-nowrap shadow-lg flex items-center animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-3 h-3 mr-2" />
              {error}
          </div>
      )}
    </div>
  );
};
