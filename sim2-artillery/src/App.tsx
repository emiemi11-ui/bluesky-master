import React, { useState, useEffect, useRef } from 'react';
import { ArtilleryEngine, AmmoType, TargetType } from './game/ArtilleryEngine';
import { ArtilleryMap } from './components/ArtilleryMap';
import { FireControlPanel } from './components/FireControlPanel';
import { BatteryStatus } from './components/BatteryStatus';
import { ArtilleryHUD } from './components/ArtilleryHUD';
import { CombatLog } from './components/CombatLog';
import './styles/index.css';

function App() {
  const engineRef = useRef<ArtilleryEngine>(new ArtilleryEngine());
  const [state, setState] = useState(engineRef.current.getState());
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let lastTime = performance.now();

    const gameLoop = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      engineRef.current.update(deltaTime);
      setState({ ...engineRef.current.getState() });

      requestAnimationFrame(gameLoop);
    };

    const animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleMapClick = (x: number, y: number) => {
    setTargetPosition({ x, y });
  };

  const handleCreateMission = (
    target: { x: number; y: number },
    targetType: TargetType,
    ammoType: AmmoType,
    rounds: number,
    batteries: string[]
  ) => {
    engineRef.current.createFireMission(target, targetType, ammoType, rounds, batteries);
    setTargetPosition(null);
  };

  const handleAdjust = (missionId: string, direction: 'ADD' | 'DROP' | 'LEFT' | 'RIGHT', meters: number) => {
    engineRef.current.adjustFire(missionId, { direction, meters });
  };

  const handleFireForEffect = (missionId: string) => {
    engineRef.current.fireForEffect(missionId);
  };

  const handleCancel = (missionId: string) => {
    engineRef.current.cancelMission(missionId);
  };

  const handleSelectBattery = (id: string) => {
    engineRef.current.selectBattery(id);
  };

  const handleSpeedChange = (speed: number) => {
    engineRef.current.setGameSpeed(speed);
  };

  const handlePause = () => {
    engineRef.current.togglePause();
  };

  return (
    <div className="app">
      <ArtilleryHUD
        state={state}
        onSpeedChange={handleSpeedChange}
        onPause={handlePause}
      />

      <div className="main-content">
        <div className="left-panel">
          <BatteryStatus
            batteries={state.batteries}
            selectedBattery={state.selectedBattery}
            onSelect={handleSelectBattery}
          />
        </div>

        <div className="center-panel">
          <ArtilleryMap
            state={state}
            onMapClick={handleMapClick}
          />
          <CombatLog log={state.log} gameTime={state.gameTime} />
        </div>

        <div className="right-panel">
          <FireControlPanel
            state={state}
            onCreateMission={handleCreateMission}
            onAdjust={handleAdjust}
            onFireForEffect={handleFireForEffect}
            onCancel={handleCancel}
            targetPosition={targetPosition}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
