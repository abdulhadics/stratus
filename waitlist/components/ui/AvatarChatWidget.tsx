'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

type AvatarStatus = 'idle' | 'connecting' | 'live' | 'error' | 'ended';

export function AvatarChatWidget() {
  const [status, setStatus] = useState<AvatarStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusText, setStatusText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<any>(null);
  const hasStarted = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        try { roomRef.current.disconnect(); } catch {}
      }
    };
  }, []);

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

  const connectToLiveKit = async (url: string, token: string) => {
    const { Room, RoomEvent, Track } = await import('livekit-client');
    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
        videoRef.current.play().catch(console.error);
      }
      if (track.kind === Track.Kind.Audio && audioRef.current) {
        track.attach(audioRef.current);
        audioRef.current.muted = false;
        audioRef.current.play().catch(console.error);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      setStatus('ended');
    });

    await room.connect(url, token);
    await room.startAudio().catch(console.error);

    await room.localParticipant.setMicrophoneEnabled(true).catch((err) => {
      console.error('Microphone permission denied:', err);
      setErrorMsg('Microphone access is required to speak with John.');
    });
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
            status === 'live' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          }`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">John</p>
          <p className="text-[10px] text-text-dimmed leading-tight">
            {status === 'live' ? 'Live · Speaking' : status === 'connecting' ? 'Connecting...' : status === 'error' ? 'Offline' : 'Session ended'}
          </p>
        </div>
        <div className="ml-auto px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-mono uppercase tracking-wider border border-accent/20">
          AI Disclosure
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center min-h-[400px]">
        
        {/* Video + Audio (always rendered) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full object-contain ${status === 'live' ? 'block' : 'hidden'}`}
        />
        <audio ref={audioRef} autoPlay />

        {/* Live Overlays */}
        {status === 'live' && (
          <>
            <div className="absolute top-4 right-4 px-2 py-1 rounded bg-emerald-500/90 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-emerald-500/20 z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-bg-surface/90 border border-border backdrop-blur-md shadow-xl z-10 text-xs text-text-primary flex items-center gap-2">
              <svg className="w-3 h-3 text-emerald-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.87 3.13 7 7 7v3h4v-3c3.87 0 7-3.13 7-7h-2z"/>
              </svg>
              Speak to John — he's listening
            </div>
          </>
        )}

        {/* Idle State */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center gap-6 z-10 p-8 text-center bg-bg-surface/80 rounded-2xl border border-accent/20 backdrop-blur-sm max-w-md w-full">
            <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]">
              <span className="text-accent text-3xl font-bold">J</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Speak with John</h3>
              <p className="text-text-dimmed text-sm mb-6">Start a live voice conversation to get answers about STRATUS instantly.</p>
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
    </div>
  );
}
