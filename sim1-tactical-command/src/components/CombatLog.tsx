import React, { useEffect, useRef } from 'react';

interface CombatEvent {
  timestamp: number;
  type: string;
  description: string;
  unitId?: string;
}

interface CombatLogProps {
  events: CombatEvent[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ events }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `T+${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'ENGAGEMENT': return '⚔';
      case 'CASUALTIES': return '💥';
      case 'DESTROYED': return '☠';
      case 'OBJECTIVE': return '⚑';
      case 'MOVE': return '➜';
      default: return '•';
    }
  };

  return (
    <div className="bg-military-gray border-l-4 border-military-navy text-white p-4 w-96 h-full flex flex-col">
      <div className="border-b-2 border-military-gold pb-2 mb-3">
        <h2 className="text-lg font-bold uppercase">Combat Log</h2>
        <div className="text-xs text-gray-400">{events.length} events</div>
      </div>

      <div
        ref={logRef}
        className="flex-1 overflow-y-auto space-y-1 font-mono text-xs"
      >
        {events.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <div className="text-2xl mb-2">📋</div>
            <div>No events yet</div>
          </div>
        ) : (
          events.map((event, idx) => (
            <div
              key={idx}
              className="bg-black/30 border-l-2 border-military-gold px-2 py-1 hover:bg-black/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-military-gold">{getEventIcon(event.type)}</span>
                <div className="flex-1">
                  <div className="text-gray-400 text-[10px]">{formatTime(event.timestamp)}</div>
                  <div className="text-white">{event.description}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
