import React from 'react';
import { BrigadeGameState } from '../game/BrigadeEngine';

interface Props {
  state: BrigadeGameState;
  onSpeedChange: (speed: number) => void;
  onPause: () => void;
}

export const BrigadeHUD: React.FC<Props> = ({ state, onSpeedChange, onPause }) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const activeCompanies = state.friendlyCompanies.filter(c => c.status !== 'DESTROYED').length;
  const totalCompanies = state.friendlyCompanies.length;

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
          <div style={{ fontSize: '16px', fontFamily: 'monospace' }}>{formatTime(state.gameTime)}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>COMPANIES</div>
          <div style={{ fontSize: '16px' }}>
            <span style={{ color: '#2196f3' }}>{activeCompanies}</span>
            <span style={{ color: '#666' }}>/{totalCompanies}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>OBJECTIVES</div>
          <div style={{ fontSize: '16px' }}>
            <span style={{ color: '#4caf50' }}>{state.objectivesHeld}</span>
            <span style={{ color: '#666' }}>/{state.objectives.length}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>CASUALTIES</div>
          <div style={{ fontSize: '16px', color: '#f44336' }}>{Math.floor(state.casualties)}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>ENEMY KIA</div>
          <div style={{ fontSize: '16px', color: '#4caf50' }}>{Math.floor(state.enemyCasualties)}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>SCORE</div>
          <div style={{ fontSize: '16px', color: '#ff9800' }}>{state.score}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#888' }}>SUPPLY</div>
          <div style={{ fontSize: '16px', color: state.supplyStatus > 50 ? '#4caf50' : '#ff9800' }}>{state.supplyStatus}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[1, 2, 4, 8].map(speed => (
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
