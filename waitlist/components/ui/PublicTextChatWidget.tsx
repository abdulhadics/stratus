'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Phone } from 'lucide-react';

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hi, this is Stratus. We are excited to meet you and explain to you how we are helping business owners! The best way to talk to the founder would be to apply and we're gonna book a consultation meeting to see if it's the best fit. I can answer up to 5 questions for you right now.",
};

export function PublicTextChatWidget() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (!isVerified && userMessageCount >= 5) {
      return;
    }

    if (isVerified && userMessageCount >= 15) {
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    setTimeout(() => {
      let aiResponse = "That's a great question about Stratus. We help automate and manage your CRM needs.";
      
      if (!isVerified && newCount === 5) {
        aiResponse = "You've reached your limit of 5 questions. Please verify your phone number to continue our discussion.";
      } else if (isVerified && newCount === 15) {
        aiResponse = "You've reached the maximum message limit. Please apply to talk to our CEO/Founder for further discussion.";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: aiResponse },
      ]);
    }, 1000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim().length > 7) {
      setIsVerified(true);
      setMessages((prev) => [
        ...prev,
        { id: 'verified', role: 'system', content: 'Phone verified successfully. You can now ask up to 10 more questions.' }
      ]);
    }
  };

  const needsVerification = !isVerified && userMessageCount >= 5;
  const isHardStopped = isVerified && userMessageCount >= 15;

  return (
    <div className="flex flex-col h-full w-full bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-bg-elevated flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-medium text-sm text-text-primary">Stratus Assistant</h3>
        </div>
        <div className="text-xs text-text-dimmed">
          {!isHardStopped && (
             isVerified ? `${15 - userMessageCount} left` : `${5 - userMessageCount} left`
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-secondary min-h-[300px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-none'
                  : msg.role === 'system'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mx-auto text-center'
                  : 'bg-bg-elevated text-text-primary border border-border rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-bg-surface border-t border-border">
        {needsVerification ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Lock size={16} />
              <span className="text-xs font-medium">Verification Required</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Enter phone number..."
                className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                required
              />
              <button
                type="submit"
                className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90"
              >
                Verify
              </button>
            </div>
          </form>
        ) : isHardStopped ? (
          <div className="text-center p-3 text-sm text-text-dimmed bg-bg-elevated rounded-lg">
            Chat ended. Please apply to speak with the founder.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-bg-elevated border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
