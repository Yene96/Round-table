import { useState } from 'react';
import type { AIEntity } from '@/types';
import { Zap, Brain, Clock, Sparkles } from 'lucide-react';

interface SidebarProps {
  entities: AIEntity[];
  onToggleEntity: (id: string) => void;
  onHoverEntity: (id: string | null) => void;
  hoveredEntity: string | null;
}

export default function Sidebar({ entities, onToggleEntity, onHoverEntity, hoveredEntity }: SidebarProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const activeCount = entities.filter(e => e.isActive).length;
  const hoveredData = entities.find(e => e.id === hoveredEntity);

  return (
    <div className="relative h-full flex">
      {/* Main Sidebar */}
      <div className="w-20 h-full glass-panel flex flex-col items-center py-6 gap-4 z-10">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 0, 85, 0.15))',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
          }}>
            <Brain className="w-6 h-6 text-[#00F0FF]" />
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-[9px] font-mono-data text-[#5A6782]">{activeCount} ACTIVE</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-[rgba(255,255,255,0.08)]" />

        {/* AI Entity Avatars */}
        <div className="flex-1 flex flex-col items-center gap-3 py-2">
          {entities.map((entity) => (
            <button
              key={entity.id}
              onClick={() => onToggleEntity(entity.id)}
              onMouseEnter={() => {
                onHoverEntity(entity.id);
                setShowAnalysis(true);
              }}
              onMouseLeave={() => {
                onHoverEntity(null);
                setShowAnalysis(false);
              }}
              className="relative group"
            >
              <div
                className={`w-12 h-12 rounded-full overflow-hidden transition-all duration-300 ${
                  entity.isActive
                    ? 'ring-2 scale-100 opacity-100'
                    : 'ring-0 scale-90 opacity-40 grayscale'
                }`}
                style={{
                  outline: entity.isActive ? `2px solid ${entity.colorHex}` : 'none',
                  boxShadow: entity.isActive
                    ? `0 0 15px ${entity.colorHex}40, 0 0 30px ${entity.colorHex}20`
                    : 'none',
                }}
              >
                <img
                  src={entity.avatar}
                  alt={entity.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {entity.isTyping && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: entity.colorHex }}
                />
              )}
              {entity.isActive && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#050510]"
                  style={{ backgroundColor: entity.colorHex }}
                />
              )}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[rgba(16,20,40,0.9)] border border-[rgba(255,255,255,0.1)] text-xs text-[#E0E8FF] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {entity.name}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom status */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-px bg-[rgba(255,255,255,0.08)]" />
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#00F0FF]" />
            <span className="text-[9px] font-mono-data text-[#5A6782]">LIVE</span>
          </div>
        </div>
      </div>

      {/* Analysis Panel (slides in on hover) */}
      {showAnalysis && hoveredData && (
        <div
          className="absolute left-20 top-0 h-full w-72 glass-panel border-l-0 z-20 overflow-y-auto scrollbar-thin"
          style={{
            animation: 'slide-up-fade 0.2s ease-out',
          }}
          onMouseEnter={() => setShowAnalysis(true)}
          onMouseLeave={() => {
            setShowAnalysis(false);
            onHoverEntity(null);
          }}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full overflow-hidden" style={{ outline: `2px solid ${hoveredData.colorHex}` }}>
                <img src={hoveredData.avatar} alt={hoveredData.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E0E8FF]">{hoveredData.name}</h3>
                <p className="text-xs font-mono-data" style={{ color: hoveredData.colorHex }}>
                  {hoveredData.personality}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#5A6782] leading-relaxed mb-5">
              {hoveredData.description}
            </p>

            {/* Stats */}
            <div className="space-y-3 mb-5">
              <StatBar label="Accuracy" value={hoveredData.accuracy} color={hoveredData.colorHex} icon={<Brain className="w-3 h-3" />} />
              <StatBar label="Speed" value={hoveredData.speed} color={hoveredData.colorHex} icon={<Clock className="w-3 h-3" />} />
              <StatBar label="Creativity" value={hoveredData.creativity} color={hoveredData.colorHex} icon={<Sparkles className="w-3 h-3" />} />
            </div>

            {/* Specialties */}
            <div>
              <h4 className="text-[10px] font-mono-data text-[#5A6782] uppercase tracking-wider mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-1.5">
                {hoveredData.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono-data"
                    style={{
                      backgroundColor: `${hoveredData.colorHex}15`,
                      color: hoveredData.colorHex,
                      border: `1px solid ${hoveredData.colorHex}30`,
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Toggle button */}
            <button
              onClick={() => onToggleEntity(hoveredData.id)}
              className="w-full mt-5 py-2 rounded-lg text-xs font-mono-data uppercase tracking-wider transition-all"
              style={{
                backgroundColor: hoveredData.isActive ? `${hoveredData.colorHex}20` : 'transparent',
                color: hoveredData.isActive ? hoveredData.colorHex : '#5A6782',
                border: `1px solid ${hoveredData.isActive ? hoveredData.colorHex : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {hoveredData.isActive ? 'Deactivate' : 'Activate'} Entity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span style={{ color: `${color}CC` }}>{icon}</span>
          <span className="text-[10px] font-mono-data text-[#5A6782] uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[10px] font-mono-data" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
