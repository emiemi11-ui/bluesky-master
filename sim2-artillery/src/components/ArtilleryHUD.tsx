import React from 'react';
import { ArtilleryGameState } from '../game/ArtilleryEngine';

interface Props {
  state: ArtilleryGameState;
  onSpeedChange: (speed: number) => void;
  onPause: () => void;
}

export const ArtilleryHUD: React.FC<Props> = ({ state, onSpeedChange, onPause }) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTargets = state.targets.filter(t => !t.destroyed).length;
  const totalTargets = state.targets.length;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 20px',
      backgroundColor: '#0a0a1a',
      color: '#fff',
      borderBottom: '2px solid #333'
    }}>
      <div style={{ display: 'flex', gap: '30px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>TIME</div>
          <div style={{ fontSize: '18px', fontFamily: 'monospace' }}>{formatTime(state.gameTime)}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>TARGETS</div>
          <div style={{ fontSize: '18px' }}>
            <span style={{ color: '#ff6b6b' }}>{activeTargets}</span>
            <span style={{ color: '#666' }}>/{totalTargets}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>ROUNDS FIRED</div>
          <div style={{ fontSize: '18px' }}>{state.roundsFired}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>SCORE</div>
          <div style={{ fontSize: '18px', color: '#4caf50' }}>{state.score}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>WIND</div>
          <div style={{ fontSize: '14px' }}>{state.windSpeed} km/h @ {state.windDirection}°</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              style={{
                padding: '5px 10px',
                backgroundColor: state.gameSpeed === speed ? '#4caf50' : '#333',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {speed}x
            </button>
          ))}
        </div>

        <button
          onClick={onPause}
          style={{
            padding: '5px 15px',
            backgroundColor: state.isPaused ? '#ff9800' : '#666',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {state.isPaused ? 'RESUME' : 'PAUSE'}
        </button>
      </div>
    </div>
  );
};
