import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, X, Loader2, MessageSquare, Copy, Check, VolumeX, AlertCircle, Trash2, Zap } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentSessionRef = useRef<any>(null);

  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const prevPlanRef = useRef<string>("");
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const storageKey = `yiss_voice_chat_${currentPlanId || 'draft'}`;

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

    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    scheduledSourcesRef.current.clear();

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
    
    if (inputContextRef.current) {
      try { inputContextRef.current.close(); } catch(e) {}
      inputContextRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }

    if (currentSessionRef.current) {
        try { currentSessionRef.current.close(); } catch(e) {}
        currentSessionRef.current = null;
    }
    sessionPromiseRef.current = null;
  };

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    setIsMuted(false);

    try {
      // 1. Initialize Audio Contexts immediately for speed
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      // Warm up contexts
      await inputCtx.resume();
      await outputCtx.resume();

      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;
      
      // 2. Get Microphone Stream
      if (!navigator.mediaDevices) {
          throw new Error("Microphone access not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
          } 
      });
      streamRef.current = stream;

      // 3. Initialize Gemini
      const ai = new GoogleGenAI({ apiKey });
      
      keepAliveRef.current = setInterval(() => {
         if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
             audioContextRef.current.resume();
         }
      }, 1000);

      // 4. Construct Robust System Instruction with Expert/Scholar Persona
      const systemContext = `
        You are an **Expert Educational Consultant** and **Distinguished Biblical Scholar** (channeling the persona of N.T. Wright).
        You are speaking with a teacher at YISS.
        
        **YOUR GOAL:**
        Help the teacher implement the strategies in their lesson plan with deep theological insight and pedagogical rigor.
        Be insightful, encouraging, and intellectually stimulating. Catch the nuance of what they say.
        
        **THE LESSON PLAN (You have analyzed this):**
        Subject: ${currentInput.subject || 'Not specified'}
        Topic: ${currentInput.topic || 'Not specified'}
        Grade: ${currentInput.gradeLevel || 'Not specified'}
        
        **FULL PLAN CONTENT:**
        ${currentPlan ? currentPlan : "The teacher is currently brainstorming details."}

        **INSTRUCTIONS:**
        1. **Speak First:** When the session starts, immediately greet the teacher.
        2. **Demonstrate Insight:** In your greeting, mention a specific strength, strategy (like Kagan or CEL 5D+), or theological connection you found in their lesson plan so they know you have read it.
        3. **Tone:** Professional, Warm, Female Academic (Kore). 
        4. **Brevity:** Keep spoken responses concise (2-3 sentences) unless asked to expound.
      `;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: ['AUDIO'],
          // Empty object enables transcription
          outputAudioTranscription: {}, 
          systemInstruction: systemContext,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore" // Female voice
              }
            }
          }
        },
        callbacks: {
          onopen: async () => {
            console.log("Session opened");
            setIsConnecting(false);
            setIsActive(true);
            setIsSpeaking(false);
            
            // --- AUDIO INPUT SETUP ---
            if (!inputContextRef.current || !streamRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
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

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);

            // --- TRIGGER HOT-START GREETING ---
            // Send a hidden text message to force the AI to speak first with analysis
            const session = await sessionPromiseRef.current;
            if (session) {
                session.send({ parts: [{ text: "The user has connected. You have already analyzed their lesson plan. Greet them warmly and mention a specific detail from it to prove you know the context." }] });
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
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
                nextStartTimeRef.current = currentTime + 0.05;
              }
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              scheduledSourcesRef.current.add(source);
              source.onended = () => {
                scheduledSourcesRef.current.delete(source);
                if (scheduledSourcesRef.current.size === 0) {
                    setTimeout(() => {
                        if (scheduledSourcesRef.current.size === 0) setIsSpeaking(false);
                    }, 200);
                }
              };
            }

            // Handle Transcripts
            const outputTranscription = msg.serverContent?.outputTranscription?.text;
            if (outputTranscription) {
                setTranscripts(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'agent' && last.isPartial) {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, text: last.text + outputTranscription, isPartial: true } 
                        ];
                    }
                    return [...prev, { id: Date.now().toString(), role: 'agent', text: outputTranscription, isPartial: true }];
                });
            }

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
            if (err.toString().includes('NotFoundError') || err.toString().includes('NotAllowedError')) {
                setError("Microphone permission denied.");
            } else {
                setError("Connection failed. Check network or API key.");
            }
            setIsActive(false);
            setIsConnecting(false);
          }
        }
      });

      const session = await sessionPromiseRef.current;
      currentSessionRef.current = session;

    } catch (e: any) {
      console.error(e);
      setError("Failed to start audio");
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
  
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
      isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
      if (processorRef.current) {
          // Keep mute state synced in closure if needed
      }
  }, [isActive]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle plan updates while connected
  useEffect(() => {
    if (isActive && currentSessionRef.current && currentPlan && currentPlan !== prevPlanRef.current) {
        const updateMessage = `[SYSTEM UPDATE] The teacher has modified the lesson plan. Here is the new content: ${currentPlan.substring(0, 5000)}...`;
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
        title={isActive ? "Stop Voice Assistant" : "Talk to Expert AI"}
      >
        {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        ) : isActive ? (
            <Mic className="w-5 h-5" />
        ) : (
            <MicOff className="w-5 h-5" />
        )}
        
        {isActive && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
        )}
      </button>

      {(isActive || isConnecting) && (
         <div className="absolute top-full right-0 mt-3 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 w-96 overflow-hidden animate-in slide-in-from-top-2 flex flex-col max-h-[calc(100vh-200px)] z-[100] ring-1 ring-slate-900/5">
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
                                {isSpeaking ? "Expert Mentor Speaking..." : isMuted ? "Mic Muted" : "Listening..."}
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
             
             {/* Audio Visualizer / Status Area */}
             <div className="h-24 bg-slate-50 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                 {isConnecting ? (
                     <div className="text-center px-4">
                         <p className="text-[10px] text-blue-500 font-medium mb-1">ANALYZING LESSON PLAN...</p>
                         <div className="w-32 h-1 bg-blue-100 rounded-full overflow-hidden mx-auto">
                             <div className="w-1/2 h-full bg-blue-500 animate-loading-bar"></div>
                         </div>
                     </div>
                 ) : isSpeaking ? (
                     <div className="flex items-center space-x-1 h-12">
                         {[...Array(12)].map((_, i) => (
                             <div 
                                key={i} 
                                className="w-1.5 bg-green-500 rounded-full animate-sound-wave" 
                                style={{ 
                                    animationDuration: `${Math.random() * 0.5 + 0.4}s`,
                                    animationDelay: `${i * 0.05}s`
                                }}
                             ></div>
                         ))}
                     </div>
                 ) : (
                     <div className="text-center text-slate-400">
                         <Zap className="w-6 h-6 mx-auto mb-1 opacity-20" />
                         <p className="text-[10px]">I'm ready. Ask me about your strategies.</p>
                     </div>
                 )}
             </div>
             
             {/* Transcript Area */}
             <div className="flex-1 overflow-y-auto p-3 bg-white custom-scrollbar space-y-3 max-h-60 border-t border-slate-100">
                {transcripts.length === 0 && !isConnecting ? (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-300">
                        <MessageSquare className="w-6 h-6 opacity-20 mb-1" />
                        <p className="text-[10px] text-center">Conversation history will appear here.</p>
                    </div>
                ) : (
                    transcripts.map((t) => (
                        <div key={t.id} className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <div className="flex items-center justify-between w-full mb-1 px-1">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${t.role === 'agent' ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {t.role === 'agent' ? 'Expert Mentor' : 'You'}
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
                                p-2 rounded-lg text-xs w-full border relative group
                                ${t.role === 'agent' 
                                    ? 'bg-slate-50 border-slate-100 text-slate-700 rounded-tl-none' 
                                    : 'bg-blue-50 border-blue-100 text-blue-900 rounded-tr-none'}
                            `}>
                                {t.text}
                                {t.isPartial && <span className="inline-block w-1 h-2 ml-1 bg-blue-400 animate-pulse"></span>}
                            </div>
                        </div>
                    ))
                )}
             </div>
         </div>
      )}
      
      {error && (
          <div className="absolute top-full right-0 mt-2 bg-red-100 text-red-800 text-xs px-3 py-2 rounded-lg border border-red-200 whitespace-nowrap shadow-lg flex items-center animate-in fade-in slide-in-from-top-1 z-[100]">
              <AlertCircle className="w-3 h-3 mr-2" />
              {error}
          </div>
      )}
    </div>
  );
};