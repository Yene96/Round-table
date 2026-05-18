import { Activity, Wifi, Cpu, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const latencyTimer = setInterval(() => {
      setLatency(8 + Math.floor(Math.random() * 15));
    }, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(latencyTimer);
    };
  }, []);

  return (
    <div className="h-12 glass-panel flex items-center justify-between px-6 z-10" style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-fluid-title text-[#E0E8FF] tracking-wide">
          Aetheria
        </h1>
        <span className="text-[10px] font-mono-data text-[#5A6782]">//</span>
        <span className="text-[10px] font-mono-data text-[#00F0FF] uppercase tracking-wider">
          Synthetic Symposium
        </span>
      </div>

      {/* Center: Status */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#00F0FF]" />
          <span className="text-[10px] font-mono-data text-[#5A6782] uppercase tracking-wider">System Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-mono-data text-[#5A6782] uppercase tracking-wider">
            Latency: <span className="text-emerald-400">{latency}ms</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-[#F59E0B]" />
          <span className="text-[10px] font-mono-data text-[#5A6782] uppercase tracking-wider">
            Compute: <span className="text-[#F59E0B]">Optimal</span>
          </span>
        </div>
      </div>

      {/* Right: Clock */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-[#5A6782]" />
        <span className="text-[10px] font-mono-data text-[#5A6782]">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
