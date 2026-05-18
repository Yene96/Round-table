import { useEffect, useRef, useState } from 'react';
import type { Message } from '@/types';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  index: number;
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const [visibleText, setVisibleText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (message.type === 'ai' && !hasAnimated.current) {
      hasAnimated.current = true;
      const text = message.content;
      const speed = 12; // ms per character
      let i = 0;

      const typeChar = () => {
        if (i < text.length) {
          // Sometimes type multiple chars at once for speed effect
          const chunk = Math.random() > 0.7 ? 2 : 1;
          i = Math.min(i + chunk, text.length);
          setVisibleText(text.substring(0, i));
          setTimeout(typeChar, speed + Math.random() * 8);
        } else {
          setIsComplete(true);
        }
      };

      const delay = index * 100;
      setTimeout(typeChar, delay);
    } else if (message.type === 'user') {
      setVisibleText(message.content);
      setIsComplete(true);
    }
  }, [message.content, message.type, index]);

  const displayContent = message.type === 'ai' ? visibleText : message.content;
  const isUser = message.type === 'user';

  return (
    <div
      ref={containerRef}
      className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        animation: 'slide-up-fade 0.4s ease-out forwards',
      }}
    >
      {!isUser && (
        <div className="flex-shrink-0 self-start mt-1">
          <div
            className="w-9 h-9 rounded-full overflow-hidden ring-1"
            style={{
              outline: `1px solid ${message.senderColor}40`,
              boxShadow: `0 0 10px ${message.senderColor}20`,
            }}
          >
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className={`max-w-[70%] ${isUser ? 'order-1' : ''}`}>
        {/* Sender name */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          {!isUser && (
            <span
              className="text-[10px] font-mono-data uppercase tracking-wider"
              style={{ color: message.senderColor }}
            >
              {message.senderName}
            </span>
          )}
          <span className="text-[9px] font-mono-data text-[#5A6782]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message bubble */}
        <div
          className={`relative px-4 py-3 rounded-xl ${
            isUser
              ? 'glass-panel glass-panel-hover'
              : 'glass-panel glass-panel-hover'
          }`}
          style={{
            borderLeft: !isUser ? `2px solid ${message.senderColor}60` : undefined,
            borderRight: isUser ? `2px solid rgba(0, 240, 255, 0.3)` : undefined,
          }}
        >
          <p className="text-sm leading-relaxed text-[#E0E8FF] whitespace-pre-wrap">
            {displayContent}
            {message.type === 'ai' && !isComplete && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#00F0FF] animate-pulse" style={{
                boxShadow: '0 0 6px rgba(0, 240, 255, 0.6)',
              }} />
            )}
          </p>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 self-start mt-1 order-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.05))',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            }}
          >
            <User className="w-4 h-4 text-[#00F0FF]" />
          </div>
        </div>
      )}
    </div>
  );
}
