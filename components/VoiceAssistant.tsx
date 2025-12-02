import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, X, Loader2, Radio } from 'lucide-react';
import { LessonInput } from '../types';

interface VoiceAssistantProps {
  apiKey: string;
  currentInput: LessonInput;
  currentPlan: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ apiKey, currentInput, currentPlan }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const cleanupAudio = () => {
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
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
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

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Build Contextual System Instruction
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

        INSTRUCTIONS:
        1. Keep responses concise, conversational, and encouraging.
        2. If the user asks about the plan, refer to the "CONTENT OF GENERATED PLAN" section above.
        3. If the user changes the plan or inputs, you will receive a system update message.
      `;

      // Connect to Gemini Live
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: {
             parts: [{ text: systemContext }]
          }
        },
        callbacks: {
          onopen: () => {
            console.log("Session opened");
            setIsConnecting(false);
            setIsActive(true);
            setIsSpeaking(false);
            
            // Setup Input Processing
            if (!inputContextRef.current || !streamRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            // Use ScriptProcessor for raw PCM access
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
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
                        mimeType: "audio/pcm;rate=16000",
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
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsSpeaking(true);
              const ctx = audioContextRef.current;
              
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
            
            if (msg.serverContent?.interrupted) {
                 scheduledSourcesRef.current.forEach(s => {
                     try { s.stop(); } catch(e) {}
                 });
                 scheduledSourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
                 setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log("Session closed");
            setIsActive(false);
          },
          onerror: (err) => {
            console.error("Session error", err);
            setError("Connection failed");
            setIsActive(false);
          }
        }
      });

      const session = await sessionPromiseRef.current;
      currentSessionRef.current = session;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to start audio");
      setIsConnecting(false);
      cleanupAudio();
    }
  };

  const disconnect = () => {
    setIsActive(false);
    cleanupAudio();
  };

  // Watch for Plan Generation and update the session if active
  useEffect(() => {
    if (isActive && currentSessionRef.current && currentPlan && currentPlan !== prevPlanRef.current) {
        const updateMessage = `
[SYSTEM EVENT]
The teacher has just generated or updated the lesson plan on screen.
NEW PLAN CONTENT:
${currentPlan}
`;
        try {
            currentSessionRef.current.send({ parts: [{ text: updateMessage }] });
        } catch (e) {
            console.warn("Failed to send context update to voice session", e);
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
        className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
            isActive 
            ? 'bg-red-100 text-red-600 ring-2 ring-red-500 ring-opacity-50' 
            : 'hover:bg-slate-100 text-slate-600'
        }`}
        title={isActive ? "Stop Voice Assistant" : "Start Voice Assistant"}
      >
        {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
        ) : isActive ? (
            <Mic className="w-5 h-5" />
        ) : (
            <MicOff className="w-5 h-5" />
        )}
      </button>

      {/* Status Popover */}
      {(isActive || isConnecting) && (
         <div className="absolute top-full right-0 mt-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 w-80 overflow-hidden animate-in slide-in-from-top-2">
             <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center">
                 <div className="flex items-center space-x-2">
                     <span className={`relative flex h-2.5 w-2.5`}>
                       <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSpeaking ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                       <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSpeaking ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                     </span>
                     <span className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                        {isConnecting ? "Connecting..." : isSpeaking ? "AI Speaking" : "Listening..."}
                     </span>
                 </div>
                 <button onClick={disconnect} className="text-slate-400 hover:text-slate-600">
                     <X className="w-4 h-4" />
                 </button>
             </div>
             
             <div className="p-4">
                <div className="h-12 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
                    {isSpeaking ? (
                        <div className="flex items-end justify-center space-x-1 h-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: '0.3s' }}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 text-slate-400">
                            <Radio className="w-4 h-4 animate-pulse" />
                            <span className="text-xs">Listening...</span>
                        </div>
                    )}
                </div>
                
                <div className="mt-3 text-xs text-slate-500 text-center">
                    The AI can see your plan and inputs. <br/>Speak to discuss ideas.
                </div>
             </div>
         </div>
      )}
      
      {error && (
          <div className="absolute top-full right-0 mt-2 bg-red-100 text-red-800 text-xs px-3 py-1 rounded-md border border-red-200 whitespace-nowrap">
              {error}
          </div>
      )}
    </div>
  );
};