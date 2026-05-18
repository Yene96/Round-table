interface TypingIndicatorProps {
  color: string;
  name: string;
}

export default function TypingIndicator({ color, name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}40`,
            animationDelay: '0ms',
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}40`,
            animationDelay: '150ms',
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}40`,
            animationDelay: '300ms',
          }}
        />
      </div>
      <span
        className="text-xs font-mono-data uppercase tracking-wider"
        style={{ color: `${color}CC` }}
      >
        {name} is synthesizing...
      </span>
    </div>
  );
}
