import React from 'react';
import { Objective } from '@shared/types';

interface HUDProps {
  elapsedTime: number;
  objectives: Objective[];
  friendlyUnits: number;
  enemyUnits: number;
  isPaused: boolean;
  gameSpeed: number;
  onPause: () => void;
  onSpeed: (speed: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  elapsedTime,
  objectives,
  friendlyUnits,
  enemyUnits,
  isPaused,
  gameSpeed,
  onPause,
  onSpeed
}) => {

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedObjectives = objectives.filter(o => o.controlledBy === 'FRIENDLY').length;
  const forceRatio = friendlyUnits / (enemyUnits + 1);

  return (
    <div className="bg-military-gray border-b-4 border-military-gold text-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left section - Mission info */}
        <div className="flex gap-8">
          <div>
            <div className="text-xs text-gray-400 uppercase">Mission Time</div>
            <div className="text-2xl font-mono font-bold text-military-gold">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 uppercase">Objectives</div>
            <div className="text-2xl font-bold">
              <span className={completedObjectives === objectives.length ? 'text-green-400' : 'text-white'}>
                {completedObjectives}
              </span>
              <span className="text-gray-500">/{objectives.length}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 uppercase">Force Ratio</div>
            <div className={`text-2xl font-bold ${
              forceRatio > 1.5 ? 'text-green-400' :
              forceRatio > 1.0 ? 'text-yellow-400' :
              forceRatio > 0.7 ? 'text-orange-400' : 'text-red-400'
            }`}>
              {forceRatio.toFixed(2)}:1
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 uppercase">Units</div>
            <div className="text-lg">
              <span className="text-friendly font-bold">{friendlyUnits}</span>
              <span className="text-gray-500 mx-2">vs</span>
              <span className="text-enemy font-bold">{enemyUnits}</span>
            </div>
          </div>
        </div>

        {/* Right section - Controls */}
        <div className="flex gap-4 items-center">
          {/* Game speed */}
          <div className="flex gap-2">
            <div className="text-xs text-gray-400 uppercase mb-1">Speed</div>
            <div className="flex gap-1">
              {[1, 2, 4].map(speed => (
                <button
                  key={speed}
                  onClick={() => onSpeed(speed)}
                  className={`px-3 py-1 text-sm font-bold border-2 transition-colors ${
                    gameSpeed === speed
                      ? 'bg-military-gold text-black border-military-gold'
                      : 'bg-black/50 text-white border-military-navy hover:border-military-gold'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Pause button */}
          <button
            onClick={onPause}
            className={`px-6 py-2 font-bold text-lg border-2 transition-colors ${
              isPaused
                ? 'bg-green-600 text-white border-green-400 hover:bg-green-700'
                : 'bg-yellow-600 text-black border-yellow-400 hover:bg-yellow-700'
            }`}
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Objectives bar */}
      <div className="mt-3 flex gap-4">
        {objectives.map((obj, idx) => (
          <div
            key={obj.id}
            className={`flex-1 border-2 px-3 py-2 transition-all ${
              obj.controlledBy === 'FRIENDLY'
                ? 'bg-friendly/20 border-friendly'
                : obj.controlledBy === 'ENEMY'
                  ? 'bg-enemy/20 border-enemy'
                  : 'bg-gray-800 border-gray-600'
            }`}
          >
            <div className="text-xs font-bold uppercase">{obj.name}</div>
            <div className="text-[10px] text-gray-400">
              {obj.controlledBy === 'FRIENDLY' ? '✓ Secured' :
                obj.controlledBy === 'ENEMY' ? '✗ Enemy Held' : '○ Neutral'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
