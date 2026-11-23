'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Cpu,
  BrainCircuit,
  CornerDownLeft,
} from 'lucide-react';
import { useChat } from 'ai/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

export interface StudentData {
  name: string;
  registrationNumber: string;
  university: string;
  degree: string;
  batch: string;
  currentSemester: number;
  currentCgpa: number;
  activeBacklogs: number;
  coreStrengths: string[];
  areasForImprovement: string[];
}

export interface AiMentorConversationProps {
  studentData?: StudentData | null;
}

export default function AiMentorConversation({ studentData = null }: AiMentorConversationProps = {}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef(true);
  const recognitionRef = useRef<any>(null);

  // Initial welcome greeting customized to student's profile
  const initialGreeting = studentData
    ? `Hello ${studentData.name.split(' ')[0]}! I've loaded your academic profile. With a strong ${studentData.currentCgpa} CGPA and 0 backlogs, you're in great shape for placements. How can I assist you with your weak areas (${studentData.areasForImprovement.join(', ')}) or project prep today?`
    : `Hello Jagadeesh! I'm your AI Academic Mentor. How can I assist you with your academic progress or career planning today?`;

  // Configure DefaultChatTransport with Edge API endpoint & student data context
  const transport = React.useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/chat',
      body: { studentData },
    });
  }, [studentData]);

  // Initialize Vercel AI SDK useChat hook
  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat<UIMessage>({
    transport,
    messages: [
      {
        id: 'msg-welcome-init',
        role: 'assistant',
        parts: [{ type: 'text', text: initialGreeting }],
      },
    ],
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Helper to extract text content safely from both content and parts formats
  const extractMessageText = (msg: any): string => {
    if (typeof msg.content === 'string' && msg.content.trim()) {
      return msg.content;
    }
    if (Array.isArray(msg.parts)) {
      return msg.parts
        .map((p: any) => {
          if (typeof p === 'string') return p;
          if (p && typeof p.text === 'string') return p.text;
          return '';
        })
        .join('');
    }
    return '';
  };

  // Internal container scrolling only (never scrolls the page viewport)
  // Skips auto-scrolling on initial mount so user always lands squarely at the top of the dashboard
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Optional TTS when new assistant messages arrive
  useEffect(() => {
    if (!isTtsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && status === 'ready') {
      const text = extractMessageText(lastMsg).replace(/[*#_`]/g, '');
      if (text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, status, isTtsEnabled]);

  // Handle Form Submit
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setInput('');
    try {
      await sendMessage({ text });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Web Speech STT Recognition
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('STT Start Error:', e);
      setIsListening(false);
    }
  };

  // Quick Chips for Kiosk Touchscreen
  const quickChips = [
    `Tips for ${studentData?.areasForImprovement?.[0] || 'Operating Systems'}`,
    `Review my ${studentData?.currentCgpa || 7.5} CGPA & placement drives`,
    `Next.js & Cloud project recommendations`,
    `How to master ${studentData?.areasForImprovement?.[1] || 'Computer Networks'}`,
  ];

  return (
    <div className="relative w-full rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-indigo-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_40px_rgba(99,102,241,0.1)] flex flex-col h-[650px] overflow-hidden transition-all duration-300">
      
      {/* ── TOP HEADER / STATUS BAR ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">AI Academic Mentor</h3>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Grounded Session
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real-Time Edge Intelligence • 27&quot; Campus Kiosk Station
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-mono"
            >
              <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
              <span>Streaming...</span>
            </motion.div>
          )}

          {/* TTS Audio Toggle */}
          <button
            onClick={() => {
              if (isTtsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsTtsEnabled(!isTtsEnabled);
            }}
            title={isTtsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            className={`p-2.5 rounded-xl border transition-all ${
              isTtsEnabled
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── CONVERSATION STREAM AREA ── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const text = extractMessageText(message);
            if (!text && isStreaming) return null;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] mt-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600/90 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(37,99,235,0.25)] border border-blue-400/30 font-medium'
                      : 'bg-indigo-950/40 text-slate-200 rounded-tl-sm border border-indigo-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] mt-1">
                    <User className="w-4 h-4 text-blue-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Live Streaming Indicator Bubble */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-indigo-400 text-xs font-mono pl-11"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Generating empathetic response...</span>
          </motion.div>
        )}
      </div>

      {/* ── QUICK CHIPS CAROUSEL ── */}
      <div className="px-6 py-2 bg-slate-950/30 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            disabled={isStreaming}
            onClick={() => handleSend(chip)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/40 text-slate-300 hover:text-indigo-200 transition-all font-medium disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── INPUT / INTERACTION AREA ── */}
      <div className="p-4 bg-slate-950/60 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 relative"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
            className={`p-3 rounded-2xl border transition-all shrink-0 flex items-center justify-center ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : 'Ask your academic mentor anything...'}
            disabled={isStreaming}
            className="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 px-1">
          <span>{isListening ? '🎙️ Mic active - speak clearly into the kiosk microphone' : '💡 Touch suggestions or type with on-screen keyboard'}</span>
          <span>Latency: &lt;100ms Edge</span>
        </div>
      </div>

    </div>
  );
}
