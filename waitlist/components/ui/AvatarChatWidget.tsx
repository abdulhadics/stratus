'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, Mic, Volume2, Square, Sparkles, PhoneOff } from 'lucide-react';

type AvatarStatus = 'idle' | 'connecting' | 'live' | 'error' | 'ended';

interface Transcription {
  role: 'john' | 'user';
  text: string;
}

const FAREWELL_REGEX = /\b(bye|goodbye|bye-bye|byebye|see you|see ya|cya|take care|have a good day|have a great day|talk later|talk to you later|exit|quit|end call|hang up)\b/i;

export function AvatarChatWidget() {
  const [status, setStatus] = useState<AvatarStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusText, setStatusText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [inputText, setInputText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);
  const shouldEndSessionRef = useRef(false);
  const endTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasStarted = useRef(false);

  // Stop & disconnect session cleanly
  const endSession = useCallback(async () => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    shouldEndSessionRef.current = false;

    const currentSessionId = sessionIdRef.current;
    sessionIdRef.current = null;

    if (roomRef.current) {
      try {
        roomRef.current.localParticipant?.tracks?.forEach((publication: any) => {
          try { publication.track?.stop(); } catch {}
        });
        roomRef.current.disconnect();
      } catch (e) {
        console.error('[STRATUS LIVEAVATAR] Disconnect error:', e);
      }
      roomRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    hasStarted.current = false;
    setIsSpeaking(false);
    setIsListening(false);
    setStatus('ended');

    // Notify backend to stop session on LiveAvatar to release credits
    if (currentSessionId) {
      try {
        fetch(`/api/liveavatar?session_id=${currentSessionId}`, {
          method: 'DELETE',
        }).catch(() => {});
      } catch {}
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (endTimeoutRef.current) {
        clearTimeout(endTimeoutRef.current);
      }
      if (roomRef.current) {
        try { roomRef.current.disconnect(); } catch {}
      }
    };
  }, []);

  const sendCommand = useCallback((eventType: string, extra: Record<string, any> = {}) => {
    if (!roomRef.current) return;
    try {
      const payload = {
        event_id: Math.random().toString(36).substring(2, 11),
        event_type: eventType,
        session_id: roomRef.current.name || undefined,
        source_event_id: null,
        ...extra,
      };
      const data = new TextEncoder().encode(JSON.stringify(payload));
      // reliable: true ensures command is delivered even with packet loss
      roomRef.current.localParticipant.publishData(data, { topic: 'agent-control', reliable: true });
      console.log('[STRATUS LIVEAVATAR] Sent command:', eventType, extra);
    } catch (e) {
      console.error('[STRATUS LIVEAVATAR] Error sending command:', e);
    }
  }, []);

  const connectToLiveKit = async (url: string, token: string) => {
    const { Room, RoomEvent, Track } = await import('livekit-client');
    const room = new Room();
    roomRef.current = room;

    // Track audio/video subscriptions
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
        videoRef.current.play().catch(console.error);
      }
      if (track.kind === Track.Kind.Audio) {
        if (audioRef.current) {
          track.attach(audioRef.current);
          audioRef.current.muted = false;
          audioRef.current.volume = 1.0;
          audioRef.current.play().catch(console.error);
        }
        // Also attach via default helper to guarantee sound
        const attachedEl = track.attach();
        attachedEl.style.display = 'none';
        attachedEl.play().catch(console.error);
      }
    });

    // Listen for agent-response events (transcriptions, speak start/stop)
    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any, kind: any, topic?: string) => {
      if (topic !== 'agent-response') return;
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        console.log('[STRATUS LIVEAVATAR] Agent event:', data);

        if (data.event_type === 'avatar.speak_started') {
          setIsSpeaking(true);
        } else if (data.event_type === 'avatar.speak_ended') {
          setIsSpeaking(false);
          // If a farewell was initiated, gracefully end session after John finishes his goodbye sentence
          if (shouldEndSessionRef.current) {
            console.log('[STRATUS LIVEAVATAR] Avatar finished goodbye speech. Ending session in 1.5s...');
            setTimeout(() => {
              endSession();
            }, 1500);
          }
        } else if (data.event_type === 'user.speak_started') {
          setIsListening(true);
        } else if (data.event_type === 'user.speak_ended') {
          setIsListening(false);
        } else if (data.event_type === 'avatar.transcription' && data.text) {
          setTranscription({ role: 'john', text: data.text });
          // If John says goodbye, queue session termination
          if (FAREWELL_REGEX.test(data.text)) {
            console.log('[STRATUS LIVEAVATAR] Avatar farewell detected in transcription');
            shouldEndSessionRef.current = true;
          }
        } else if (data.event_type === 'user.transcription' && data.text) {
          setTranscription({ role: 'user', text: data.text });
          // If user says goodbye via mic, queue session termination
          if (FAREWELL_REGEX.test(data.text)) {
            console.log('[STRATUS LIVEAVATAR] User farewell detected in voice transcription:', data.text);
            shouldEndSessionRef.current = true;
            // Safety timeout: if avatar never speaks or speak_ended is missed, end after 8s
            if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
            endTimeoutRef.current = setTimeout(() => {
              endSession();
            }, 8000);
          }
        }
      } catch (e) {
        console.error('[STRATUS LIVEAVATAR] Error parsing agent response event:', e);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      setStatus('ended');
      setIsSpeaking(false);
      setIsListening(false);
    });

    await room.connect(url, token);
    await room.startAudio().catch(console.error);

    // Publish local microphone
    try {
      const { createLocalAudioTrack } = await import('livekit-client');
      const localTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      await room.localParticipant.publishTrack(localTrack);
      setIsListening(true);
    } catch (err) {
      console.warn('[STRATUS] createLocalAudioTrack failed, using setMicrophoneEnabled:', err);
      await room.localParticipant.setMicrophoneEnabled(true).catch((e: any) => {
        console.error('Microphone permission denied:', e);
        setErrorMsg('Microphone access is recommended to speak with John.');
      });
    }

    // The opening_text from the Context will auto-play when the agent joins.
    // We also send avatar.start_listening so the mic is active for voice conversation.
    // Wait for the agent participant to join before sending commands.
    let agentJoined = false;
    const { RoomEvent: RE } = await import('livekit-client');
    room.on(RE.ParticipantConnected, (participant: any) => {
      const identity = participant.identity || '';
      console.log('[STRATUS LIVEAVATAR] Participant joined:', identity);
      if (!agentJoined && (identity.toLowerCase().includes('agent') || identity.toLowerCase().includes('heygen') || identity.toLowerCase().includes('avatar'))) {
        agentJoined = true;
        setTimeout(() => {
          sendCommand('avatar.start_listening');
          setIsListening(true);
          console.log('[STRATUS LIVEAVATAR] Avatar agent joined - listening started');
        }, 800);
      }
    });

    // Fallback: if agent doesn't trigger ParticipantConnected within 4s, start anyway
    setTimeout(() => {
      if (!agentJoined) {
        console.log('[STRATUS LIVEAVATAR] Fallback: starting listening after timeout');
        sendCommand('avatar.start_listening');
        setIsListening(true);
      }
    }, 4000);
  };

  const startLiveAvatar = useCallback(async (useSandbox = false) => {
    if (hasStarted.current && !useSandbox) return;
    hasStarted.current = true;

    setStatus('connecting');
    setStatusText(useSandbox ? 'Falling back to sandbox mode...' : 'Starting avatar session...');

    try {
      const res = await fetch('/api/liveavatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sandbox: useSandbox, 
          mode: 'FULL' 
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.livekit_url && data.data?.livekit_client_token) {
        sessionIdRef.current = data.data.session_id || null;
        setStatusText('Connecting to live stream...');
        await connectToLiveKit(data.data.livekit_url, data.data.livekit_client_token);
        setStatus('live');
      } else {
        let errMsg = data.error || 'Could not start avatar session.';
        try {
          const parsed = typeof errMsg === 'string' ? JSON.parse(errMsg) : errMsg;
          if (parsed?.message) errMsg = parsed.message;
        } catch {}
        console.error('[STRATUS] LiveAvatar session failed:', errMsg);
        
        if (!useSandbox) {
          console.log('[STRATUS] Retrying with sandbox mode...');
          hasStarted.current = false;
          return startLiveAvatar(true);
        }

        setErrorMsg(errMsg);
        setStatus('error');
      }
    } catch (err) {
      console.error('[STRATUS] LiveAvatar connection error:', err);
      if (!useSandbox) {
          console.log('[STRATUS] Retrying with sandbox mode...');
          hasStarted.current = false;
          return startLiveAvatar(true);
      }
      setErrorMsg('Connection failed. Please try again.');
      setStatus('error');
    }
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !roomRef.current) return;

    setInputText('');
    setTranscription({ role: 'user', text });

    // Detect typed farewell
    if (FAREWELL_REGEX.test(text)) {
      console.log('[STRATUS LIVEAVATAR] User typed farewell:', text);
      shouldEndSessionRef.current = true;
      if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = setTimeout(() => {
        endSession();
      }, 8000);
    }

    // Send speak_response command so John's AI processes and speaks the answer
    sendCommand('avatar.speak_response', { text });
  };

  const handleInterrupt = () => {
    sendCommand('avatar.interrupt');
    setIsSpeaking(false);
  };

  const handleRetry = () => {
    hasStarted.current = false;
    setErrorMsg('');
    startLiveAvatar();
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-accent/30 bg-bg-elevated overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-surface">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
            <span className="text-accent text-sm font-bold">J</span>
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-surface ${
            status === 'live' ? (isSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-500') : status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          }`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">John</p>
          <p className="text-[10px] text-text-dimmed leading-tight">
            {status === 'live' 
              ? (isSpeaking ? 'John is speaking...' : 'Listening to you') 
              : status === 'connecting' ? 'Connecting...' 
              : status === 'error' ? 'Offline' 
              : 'Session ended'}
          </p>
        </div>

        {status === 'live' && (
          <div className="ml-auto flex items-center gap-2">
            {isSpeaking && (
              <button 
                onClick={handleInterrupt}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-text-dimmed hover:text-white text-xs border border-white/10 transition-colors"
                title="Interrupt John while speaking"
              >
                <Square className="w-3 h-3 fill-current" />
                Interrupt
              </button>
            )}
            <button
              onClick={endSession}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium border border-red-500/30 transition-colors"
              title="End conversation and close session"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              End Call
            </button>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center min-h-[350px]">
        {/* Video + Audio */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full object-contain bg-transparent ${status === 'live' ? 'block' : 'hidden'}`}
        />
        <audio ref={audioRef} autoPlay />

        {/* Live Subtitles / Transcription Overlay */}
        {status === 'live' && transcription && (
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
            <div className="max-w-xl mx-auto px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl text-center">
              <span className={`text-[11px] font-bold uppercase tracking-wider mr-2 ${
                transcription.role === 'john' ? 'text-accent' : 'text-emerald-400'
              }`}>
                {transcription.role === 'john' ? 'John:' : 'You:'}
              </span>
              <span className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                "{transcription.text}"
              </span>
            </div>
          </div>
        )}

        {/* Idle State */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center gap-6 z-10 p-8 text-center bg-bg-surface/90 rounded-2xl border border-accent/20 backdrop-blur-sm max-w-md w-full mx-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]">
              <span className="text-accent text-3xl font-bold">J</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Speak with John</h3>
              <p className="text-text-dimmed text-sm mb-6">Interactive voice avatar with full knowledge of STRATUS systems & operations.</p>
              <Button variant="primary" size="lg" className="w-full font-bold tracking-wide" onClick={() => startLiveAvatar()}>
                Start Conversation
              </Button>
            </div>
          </div>
        )}

        {/* Connecting State */}
        {status === 'connecting' && (
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center">
              <span className="text-accent text-2xl font-bold">J</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex gap-1 text-white text-lg">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </span>
              <p className="text-text-dimmed text-sm">{statusText}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 z-10 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white text-sm font-medium">Could not connect to John</p>
              <p className="text-text-dimmed text-xs max-w-sm">{errorMsg}</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleRetry} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {/* Ended State */}
        {status === 'ended' && (
          <div className="flex flex-col items-center gap-4 z-10 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center">
              <span className="text-accent text-2xl font-bold">J</span>
            </div>
            <p className="text-white text-sm font-medium">Session ended</p>
            <Button variant="primary" size="sm" onClick={handleRetry} className="mt-2">
              Start New Session
            </Button>
          </div>
        )}
      </div>

      {/* Live Interactive Footer (Mic status, Quick Prompts, Text input) */}
      {status === 'live' && (
        <div className="border-t border-border bg-bg-surface p-3 flex flex-col gap-2">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-text-dimmed text-[11px] flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-accent" /> Try asking:
            </span>
            <button
              onClick={() => handleSendMessage("What are the 6 systems in STRATUS?")}
              className="px-2.5 py-1 rounded-full bg-bg-elevated hover:bg-accent/10 hover:border-accent/30 border border-border text-text-secondary hover:text-accent transition-colors flex-shrink-0 text-xs"
            >
              "What are the 6 systems?"
            </button>
            <button
              onClick={() => handleSendMessage("Explain the pricing and guarantee.")}
              className="px-2.5 py-1 rounded-full bg-bg-elevated hover:bg-accent/10 hover:border-accent/30 border border-border text-text-secondary hover:text-accent transition-colors flex-shrink-0 text-xs"
            >
              "Explain pricing & guarantee"
            </button>
            <button
              onClick={() => handleSendMessage("How fast can you install this in my business?")}
              className="px-2.5 py-1 rounded-full bg-bg-elevated hover:bg-accent/10 hover:border-accent/30 border border-border text-text-secondary hover:text-accent transition-colors flex-shrink-0 text-xs"
            >
              "How fast is setup?"
            </button>
          </div>

          {/* Text input form (Both voice AND text supported) */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Speak into your mic or type a question for John..."
                className="w-full bg-bg-elevated border border-border rounded-lg pl-3 pr-9 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-dimmed focus:outline-none focus:border-accent transition-colors"
              />
              <div 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center"
                title={isListening ? 'Mic is listening' : 'Mic ready'}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-text-dimmed'}`} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-40 transition-opacity"
              title="Send text to John"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
