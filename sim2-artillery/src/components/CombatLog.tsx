import React, { useRef, useEffect } from 'react';
import { ArtilleryLogEntry } from '../game/ArtilleryEngine';

interface Props {
  log: ArtilleryLogEntry[];
  gameTime: number;
}

export const CombatLog: React.FC<Props> = ({ log, gameTime }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log.length]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = (type: ArtilleryLogEntry['type']) => {
    switch (type) {
      case 'fire': return '#ff6b6b';
      case 'impact': return '#ffa726';
      case 'mission': return '#42a5f5';
      case 'system': return '#66bb6a';
    }
  };

  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#0a0a1a',
      height: '150px',
      overflow: 'hidden'
    }}>
      <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>FIRE LOG</h4>
      <div
        ref={logRef}
        style={{
          height: '120px',
          overflowY: 'auto',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}
      >
        {log.slice(-50).map((entry, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>
            <span style={{ color: '#666' }}>[{formatTime(entry.time)}]</span>{' '}
            <span style={{ color: getColor(entry.type) }}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
