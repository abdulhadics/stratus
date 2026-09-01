'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { AvatarGateModal } from '@/components/ui/AvatarGateModal';

interface ChatMessage {
  role: 'john' | 'user';
  text: string;
}

type ChatStep = 'greeting' | 'question' | 'gate' | 'connecting' | 'live' | 'ended';

export function AvatarChatWidget() {
  const [step, setStep] = useState<ChatStep>('greeting');
  const [userName, setUserName] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'john',
      text: "Hi, I'm John, an AI assistant for STRATUS. I can answer your questions, day or night. What's your name?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveAvatarError, setLiveAvatarError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when step changes
  useEffect(() => {
    if (step === 'greeting' || step === 'question') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [step]);

  // Check if already verified on mount
  useEffect(() => {
    const verified = localStorage.getItem('stratus_avatar_verified');
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

  const addMessage = useCallback((role: 'john' | 'user', text: string) => {
    setMessages((prev) => [...prev, { role, text }]);
  }, []);

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');

    if (step === 'greeting') {
      // User typed their name
      setUserName(text);
      addMessage('user', text);
      setTimeout(() => {
        addMessage('john', `Nice to meet you, ${text}. What would you like to know?`);
        setStep('question');
      }, 600);
    } else if (step === 'question') {
      // User typed their question — CAPTURE IT, DO NOT ANSWER
      setUserQuestion(text);
      addMessage('user', text);
      setTimeout(() => {
        addMessage(
          'john',
          "Great question. To give you a real answer and make sure I don't lose you, I just need to grab your name, phone, and email, then a quick code to confirm it's really you. Takes 30 seconds."
        );
        setStep('gate');
        // Auto-open the gate modal after a brief pause
        setTimeout(() => setIsGateOpen(true), 800);
      }, 600);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleVerified = async () => {
    setIsVerified(true);
    setIsGateOpen(false);
    setStep('connecting');
    setIsConnecting(true);
    addMessage('john', 'Verified! Let me pull up your answer...');

    try {
      // Call LiveAvatar API to create session
      const res = await fetch('/api/liveavatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sandbox: true, 
          mode: 'FULL',
          question: userQuestion 
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.livekit_url && data.data?.livekit_client_token) {
        // Connect to LiveKit room for live avatar streaming
        await connectToLiveKit(data.data.livekit_url, data.data.livekit_client_token);
        setStep('live');
      } else {
        let errMsg = data.error || 'Could not start avatar session.';
        try {
          const parsed = typeof errMsg === 'string' ? JSON.parse(errMsg) : errMsg;
          if (parsed?.message) errMsg = parsed.message;
        } catch {}
        console.error('[STRATUS] LiveAvatar session failed:', errMsg);
        setLiveAvatarError(errMsg);
        // Fallback: show text response
        addMessage('john', `I'd love to discuss "${userQuestion}" in detail. Let me connect you with our team for a proper walkthrough.`);
        setStep('ended');
      }
    } catch (err) {
      console.error('[STRATUS] LiveAvatar connection error:', err);
      setLiveAvatarError('Connection failed. Please try again.');
      addMessage('john', `I'd love to discuss "${userQuestion}" with you. Let me connect you with our team for a proper walkthrough.`);
      setStep('ended');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToLiveKit = async (url: string, token: string) => {
    try {
      const { Room, RoomEvent, Track } = await import('livekit-client');
      const room = new Room();

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current);
          videoRef.current.play().catch(console.error);
        }
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.attach(audioRef.current);
          audioRef.current.play().catch(console.error);
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        setStep('ended');
        addMessage('john', "The LiveAvatar session has ended. (Note: Sandbox sessions are limited to 1 minute). If you'd like to continue, please book a discovery call.");
      });

      await room.connect(url, token);

      // Publish user's microphone
      await room.localParticipant.setMicrophoneEnabled(true).catch((err) => {
        console.error('Microphone permission denied or failed:', err);
        addMessage('john', 'Microphone access is required to speak with the avatar.');
      });
    } catch (err) {
      console.error('[STRATUS] LiveKit connection failed:', err);
      throw err;
    }
  };

  const scrollToBooking = () => {
    document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPlaceholder = () => {
    if (step === 'greeting') return 'Type your name...';
    if (step === 'question') return 'Ask me anything about STRATUS...';
    return '';
  };

  const showInput = step === 'greeting' || step === 'question';

  return (
    <div className="flex flex-col h-full rounded-xl border border-accent/30 bg-bg-elevated overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-surface">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
            <span className="text-accent text-sm font-bold">J</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-bg-surface" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">John</p>
          <p className="text-[10px] text-text-dimmed leading-tight">AI Assistant · STRATUS</p>
        </div>
        <div className="ml-auto px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-mono uppercase tracking-wider border border-accent/20">
          AI Disclosure
        </div>
      </div>

      {/* Live Avatar Video (always rendered to ensure refs exist for LiveKit, hidden via CSS) */}
      <div className={`relative w-full flex-1 bg-black ${step === 'live' ? 'flex flex-col items-center justify-center' : 'hidden'}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <audio ref={audioRef} autoPlay />
        
        {/* Overlays */}
        <div className="absolute top-4 right-4 px-2 py-1 rounded bg-emerald-500/90 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-emerald-500/20 z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          LIVE
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-bg-surface/90 border border-border backdrop-blur-md shadow-xl z-10 text-xs text-text-primary flex items-center gap-2">
           <svg className="w-3 h-3 text-emerald-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.87 3.13 7 7 7v3h4v-3c3.87 0 7-3.13 7-7h-2z"/></svg>
           Avatar is listening... Speak now!
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px] ${step === 'live' ? 'hidden' : 'block'}`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-bg-surface text-text-primary rounded-bl-md border border-border'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Connecting indicator */}
        {isConnecting && (
          <div className="flex justify-start">
            <div className="bg-bg-surface text-text-secondary px-3.5 py-2.5 rounded-2xl rounded-bl-md border border-border text-[13px]">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {liveAvatarError && (
          <div className="bg-error-muted border border-error/20 rounded-lg p-2 text-[11px] text-error text-center">
            {liveAvatarError}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {showInput && (
        <div className="border-t border-border p-3 bg-bg-surface">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={getPlaceholder()}
              className="flex-1 px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-dimmed focus:border-accent focus:outline-none transition-colors"
              autoComplete="off"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-4"
            >
              →
            </Button>
          </div>
        </div>
      )}

      {/* Gate button (when gate step is active but modal not yet open) */}
      {step === 'gate' && !isGateOpen && (
        <div className="border-t border-border p-3 bg-bg-surface">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGateOpen(true)}
            className="w-full"
          >
            Verify & Get Your Answer →
          </Button>
        </div>
      )}

      {/* Post-conversation CTA */}
      {step === 'ended' && (
        <div className="border-t border-border p-3 bg-bg-surface">
          <Button
            variant="primary"
            size="sm"
            onClick={scrollToBooking}
            className="w-full"
          >
            Book a Discovery Call →
          </Button>
        </div>
      )}

      {/* OTP Gate Modal */}
      <AvatarGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onVerified={handleVerified}
        initialQuestion={userQuestion}
        visitorName={userName}
      />
    </div>
  );
}
