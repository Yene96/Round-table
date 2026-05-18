import { useEffect, useRef } from 'react';
import type { Message, AIEntity } from '@/types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './effects/TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatPanelProps {
  messages: Message[];
  entities: AIEntity[];
  isProcessing: boolean;
}

export default function ChatPanel({ messages, entities, isProcessing }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, messages]);

  const typingEntities = entities.filter(e => e.isTyping && e.isActive);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 glass-panel border-b-0 border-t-0 border-x-0" style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#E0E8FF] font-fluid-title tracking-wide">
              Collective Consciousness
            </h2>
            <p className="text-[10px] font-mono-data text-[#5A6782] mt-0.5">
              {entities.filter(e => e.isActive).length} ENTITIES ACTIVE // {messages.length} MESSAGES EXCHANGED
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
              }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                <span className="text-[9px] font-mono-data text-[#00F0FF] uppercase tracking-wider">Processing</span>
              </div>
            )}
            <div className="flex -space-x-1.5">
              {entities.filter(e => e.isActive).map(e => (
                <div
                  key={e.id}
                  className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-[#050510]"
                >
                  <img src={e.avatar} alt={e.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div
              className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(255, 0, 85, 0.1))',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.08)',
              }}
            >
              <div className="w-12 h-12 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(0, 240, 255, 0.3), transparent)',
                filter: 'blur(8px)',
              }} />
            </div>
            <h3 className="text-lg font-fluid-title text-[#E0E8FF] mb-2">The Roundtable Awaits</h3>
            <p className="text-xs text-[#5A6782] max-w-xs leading-relaxed">
              Pose a question to the collective. Each AI entity will analyze, debate, and synthesize a unified perspective.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={msg.id} message={msg} index={idx} />
            ))}
            {typingEntities.map(e => (
              <TypingIndicator key={e.id} color={e.colorHex} name={e.shortName} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}
