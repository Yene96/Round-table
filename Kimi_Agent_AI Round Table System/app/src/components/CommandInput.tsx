import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import TerminalText from './effects/TerminalText';

interface CommandInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  hasMessages: boolean;
}

const STATUS_PHRASES = [
  'AWAITING_INPUT()',
  'SYSTEM_READY()',
  'NEURAL_LINK_ACTIVE()',
  'QUANTUM_CHANNEL_OPEN()',
];

const PROCESSING_PHRASES = [
  'SYNTHESIZING_RESPONSES()',
  'MULTI_AGENT_CONSENSUS()',
  'QUANTUM_ENTANGLEMENT()',
  'COLLABORATIVE_INFERENCE()',
];

export default function CommandInput({ onSend, isProcessing, hasMessages }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSend(input.trim());
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Auto-focus on mount if no messages
  useEffect(() => {
    if (!hasMessages && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasMessages]);

  return (
    <div className="flex-shrink-0 px-6 pb-6 pt-2">
      <div
        className="glass-panel rounded-2xl p-1 transition-all duration-300"
        style={{
          boxShadow: isFocused
            ? '0 0 25px rgba(0, 240, 255, 0.1), inset 0 0 25px rgba(0, 240, 255, 0.02)'
            : '0 0 15px rgba(0, 240, 255, 0.03)',
          borderColor: isFocused ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[#00F0FF]" />
            <TerminalText
              phrases={isProcessing ? PROCESSING_PHRASES : STATUS_PHRASES}
              className="text-[10px] text-[#00F0FF]"
            />
          </div>
          <span className="text-[9px] font-mono-data text-[#5A6782]">
            {isProcessing ? '...' : 'READY'}
          </span>
        </div>

        {/* Input area */}
        <div className="flex items-end gap-2 px-3 pb-2 pt-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Pose your question to the collective..."
            disabled={isProcessing}
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#E0E8FF] placeholder:text-[#5A6782] resize-none outline-none py-2.5 px-2 max-h-[120px] scrollbar-thin disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
            style={{
              background: input.trim() && !isProcessing
                ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.05))'
                : 'rgba(255, 255, 255, 0.03)',
              border: input.trim() && !isProcessing
                ? '1px solid rgba(0, 240, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Send className="w-4 h-4 text-[#00F0FF]" />
          </button>
        </div>
      </div>

      {/* Hint text */}
      {!hasMessages && (
        <p className="text-center text-[10px] font-mono-data text-[#5A6782] mt-3">
          Press Enter to send // Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
