import React, { useRef, useEffect } from 'react';
import { BrigadeLogEntry } from '../game/BrigadeEngine';

interface Props {
  log: BrigadeLogEntry[];
}

export const BrigadeLog: React.FC<Props> = ({ log }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log.length]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getColor = (type: BrigadeLogEntry['type'], priority: BrigadeLogEntry['priority']) => {
    if (priority === 'critical') return '#f44336';
    if (priority === 'high') return '#ff9800';

    switch (type) {
      case 'combat': return '#ff6b6b';
      case 'movement': return '#90caf9';
      case 'supply': return '#a5d6a7';
      case 'intel': return '#ce93d8';
      case 'objective': return '#fff59d';
      case 'system': return '#80deea';
    }
  };

  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#0a0a1a',
      height: '150px',
      overflow: 'hidden'
    }}>
      <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>OPERATIONS LOG</h4>
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
            <span style={{ color: getColor(entry.type, entry.priority) }}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
