'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hi, I'm an AI assistant for STRATUS. Our founder, Adam Koubi, combined ten years in real estate and home services with a background in technology to build this. We run six systems in the background so tradespeople like you can focus on the work, not the admin. What's the biggest thing eating your time right now?",
};

export function PublicTextChatWidget() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (userMessageCount >= 15) {
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);
    setIsLoading(true);

    let aiResponse = "";
    
    if (newCount === 15) {
      aiResponse = "That's all 15 — appreciate you taking the time. If you're serious about getting your ops dialed in, book a free discovery call and let's talk through your setup. No pressure, just clarity.";
    } else {
      // Call OpenAI API
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        });
        const data = await res.json();
        
        if (res.ok && data.content) {
          aiResponse = data.content;
        } else {
          aiResponse = "I'm having trouble connecting right now. Please try again later.";
        }
      } catch (err) {
        console.error("Chat API Error:", err);
        aiResponse = "I'm having trouble connecting right now. Please try again later.";
      }
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'assistant', content: aiResponse },
    ]);
    setIsLoading(false);
  };

  const isHardStopped = userMessageCount >= 15;

  return (
    <div className="flex flex-col h-full w-full bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-bg-elevated flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-medium text-sm text-text-primary">Stratus Assistant</h3>
        </div>
        <div className="text-xs text-text-dimmed">
          {!isHardStopped && `${15 - userMessageCount} left`}
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
        {isHardStopped ? (
          <div className="text-center p-3 text-sm text-text-dimmed bg-bg-elevated rounded-lg border border-border">
            Chat ended. Book a free discovery call to keep the conversation going.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Thinking..." : "Ask a question..."}
              disabled={isLoading}
              className="flex-1 bg-bg-elevated border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
