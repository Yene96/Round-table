import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface TerminalTextProps {
  phrases: string[];
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function TerminalText({ phrases, className = '' }: TerminalTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const iterationRef = useRef(0);
  const cycleTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const phrase = phrases[currentIndex];
    if (!phrase) return;

    iterationRef.current = 0;
    const duration = 3;

    const tween = gsap.to({}, {
      duration,
      onUpdate: function () {
        const progress = this.progress();
        const phraseLength = phrase.length;
        const targetIteration = Math.floor(progress * phraseLength);

        if (targetIteration > iterationRef.current) {
          iterationRef.current = targetIteration;
        }

        let result = '';
        for (let i = 0; i < phraseLength; i++) {
          if (i < Math.floor(progress * phraseLength)) {
            result += phrase[i];
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplayText(result);
      },
      onComplete: () => {
        setDisplayText(phrase);
      },
    });

    return () => {
      tween.kill();
    };
  }, [currentIndex, phrases]);

  useEffect(() => {
    cycleTweenRef.current = gsap.to({}, {
      duration: 4,
      repeat: -1,
      onRepeat: () => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
      },
    });

    return () => {
      cycleTweenRef.current?.kill();
    };
  }, [phrases.length]);

  return (
    <span className={`font-mono-data tracking-wider ${className}`}>
      {displayText || phrases[0]}
    </span>
  );
}
