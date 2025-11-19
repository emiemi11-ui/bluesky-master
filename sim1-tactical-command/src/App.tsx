import React, { useState, useEffect, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { TacticalMap } from './components/TacticalMap';
import { HUD } from './components/HUD';
import { UnitPanel } from './components/UnitPanel';
import { CombatLog } from './components/CombatLog';
import { MilitaryUnit, CommandType } from '@shared/types';
import { DEFAULT_MISSION, MISSIONS } from './missions/missions';

function App() {
  const [gameEngine] = useState(() => new GameEngine(DEFAULT_MISSION));
  const [gameState, setGameState] = useState(gameEngine.getState());
  const [selectedUnit, setSelectedUnit] = useState<MilitaryUnit | null>(null);
  const [orderMode, setOrderMode] = useState<string | null>(null);
  const [showMissionSelect, setShowMissionSelect] = useState(false);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      gameEngine.update(100); // Update every 100ms
      setGameState({ ...gameEngine.getState() });

      // Update selected unit
      if (selectedUnit) {
        const updated = gameEngine.getState().units.find(u => u.id === selectedUnit.id);
        setSelectedUnit(updated || null);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameEngine, selectedUnit]);

  const handleUnitClick = useCallback((unit: MilitaryUnit) => {
    if (unit.team === 'FRIENDLY') {
      setSelectedUnit(unit);
      setOrderMode(null);
    }
  }, []);

  const handleMapClick = useCallback((x: number, y: number) => {
    if (selectedUnit && orderMode && selectedUnit.team === 'FRIENDLY') {
      const order = {
        id: `order-${Date.now()}`,
        unitId: selectedUnit.id,
        type: orderMode as any,
        target: { x, y },
        priority: 2,
        status: 'PENDING' as const,
        issuedAt: Date.now()
      };

      gameEngine.issueOrder(selectedUnit.id, order);
      setOrderMode(null);
    } else {
      setSelectedUnit(null);
    }
  }, [selectedUnit, orderMode, gameEngine]);

  const handleOrderClick = useCallback((orderType: string) => {
    setOrderMode(orderType);
  }, []);

  const handlePause = useCallback(() => {
    gameEngine.setPaused(!gameState.isPaused);
  }, [gameEngine, gameState.isPaused]);

  const handleSpeed = useCallback((speed: number) => {
    gameEngine.setGameSpeed(speed);
  }, [gameEngine]);

  const restartMission = useCallback(() => {
    window.location.reload();
  }, []);

  // Count active units
  const friendlyUnits = gameState.units.filter(
    u => u.team === 'FRIENDLY' && u.status !== 'DESTROYED'
  ).length;

  const enemyUnits = gameState.units.filter(
    u => u.team === 'ENEMY' && u.status !== 'DESTROYED'
  ).length;

  // Check victory/defeat conditions
  const allObjectivesCompleted = gameState.objectives.every(
    obj => obj.controlledBy === 'FRIENDLY'
  );

  const gameOver = friendlyUnits === 0 || enemyUnits === 0 || allObjectivesCompleted;

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="bg-military-navy border-b-4 border-military-gold px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-military-gold">
              ⚔ TACTICAL COMMAND SIMULATOR
            </h1>
            <div className="text-sm text-gray-400">
              CAX Military Simulators - Academia Tehnică Militară
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMissionSelect(!showMissionSelect)}
              className="px-4 py-2 bg-military-green hover:bg-military-green/80 border-2 border-military-gold font-bold transition-colors"
            >
              📋 MISSIONS
            </button>
            <button
              onClick={restartMission}
              className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 border-2 border-yellow-400 font-bold transition-colors"
            >
              🔄 RESTART
            </button>
          </div>
        </div>
      </div>

      {/* Mission Selector */}
      {showMissionSelect && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-military-gray border-4 border-military-gold p-8 max-w-4xl">
            <h2 className="text-3xl font-bold text-military-gold mb-6">SELECT MISSION</h2>
            <div className="grid grid-cols-1 gap-4">
              {MISSIONS.map(mission => (
                <div
                  key={mission.id}
                  className="bg-black/50 border-2 border-military-navy p-4 hover:border-military-gold cursor-pointer transition-colors"
                  onClick={() => {
                    setShowMissionSelect(false);
                    // TODO: Load selected mission
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{mission.name}</h3>
                      <p className="text-gray-400 text-sm">{mission.description}</p>
                      <div className="mt-2 flex gap-4 text-xs">
                        <span className="text-military-gold">Type: {mission.type}</span>
                        <span className="text-gray-400">Duration: {Math.floor(mission.duration / 60)} min</span>
                        <span className={`font-bold ${
                          mission.difficulty === 'EASY' ? 'text-green-400' :
                          mission.difficulty === 'MEDIUM' ? 'text-yellow-400' :
                          mission.difficulty === 'HARD' ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {mission.difficulty}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-military-gold text-black font-bold">
                      DEPLOY →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMissionSelect(false)}
              className="mt-6 px-6 py-3 bg-red-700 hover:bg-red-600 border-2 border-red-400 font-bold"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* HUD */}
      <HUD
        elapsedTime={gameState.elapsedTime}
        objectives={gameState.objectives}
        friendlyUnits={friendlyUnits}
        enemyUnits={enemyUnits}
        isPaused={gameState.isPaused}
        gameSpeed={gameState.gameSpeed}
        onPause={handlePause}
        onSpeed={handleSpeed}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Map */}
        <div className="flex-1 flex items-center justify-center bg-black p-4">
          <TacticalMap
            units={gameState.units}
            terrain={gameState.terrain}
            objectives={gameState.objectives}
            onUnitClick={handleUnitClick}
            onMapClick={handleMapClick}
            selectedUnit={selectedUnit || undefined}
          />
        </div>

        {/* Right panel - Unit info */}
        <UnitPanel
          unit={selectedUnit}
          onOrderClick={handleOrderClick}
        />

        {/* Combat log */}
        <CombatLog events={gameState.combatLog} />
      </div>

      {/* Order mode indicator */}
      {orderMode && selectedUnit && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-military-gold text-black px-8 py-4 text-2xl font-bold border-4 border-black pointer-events-none">
          {orderMode} MODE - Click on map to set destination
          <div className="text-sm font-normal mt-2">
            Unit: {selectedUnit.designation} - Press ESC to cancel
          </div>
        </div>
      )}

      {/* Game Over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="bg-military-gray border-4 border-military-gold p-12 text-center">
            <h2 className="text-5xl font-bold mb-6">
              {allObjectivesCompleted ? (
                <span className="text-green-400">✓ VICTORY</span>
              ) : friendlyUnits === 0 ? (
                <span className="text-red-400">✗ DEFEAT</span>
              ) : (
                <span className="text-military-gold">MISSION COMPLETE</span>
              )}
            </h2>

            <div className="mb-8 text-lg">
              <div className="mb-2">Time: {Math.floor(gameState.elapsedTime / 60)}:{Math.floor(gameState.elapsedTime % 60).toString().padStart(2, '0')}</div>
              <div className="mb-2">Friendly Units: {friendlyUnits}</div>
              <div className="mb-2">Enemy Units: {enemyUnits}</div>
              <div className="mb-2">Objectives: {gameState.objectives.filter(o => o.controlledBy === 'FRIENDLY').length}/{gameState.objectives.length}</div>
            </div>

            <button
              onClick={restartMission}
              className="px-8 py-4 bg-military-gold text-black text-xl font-bold hover:bg-yellow-400 transition-colors"
            >
              RESTART MISSION
            </button>
          </div>
        </div>
      )}

      {/* ESC to cancel */}
      {orderMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 text-sm">
          Press ESC to cancel order
        </div>
      )}
    </div>
  );
}

export default App;
