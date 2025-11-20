import React, { useState } from 'react';
import { ArtilleryGameState, AmmoType, TargetType, ArtilleryPiece } from '../game/ArtilleryEngine';

interface Props {
  state: ArtilleryGameState;
  onCreateMission: (target: { x: number; y: number }, targetType: TargetType, ammoType: AmmoType, rounds: number, batteries: string[]) => void;
  onAdjust: (missionId: string, direction: 'ADD' | 'DROP' | 'LEFT' | 'RIGHT', meters: number) => void;
  onFireForEffect: (missionId: string) => void;
  onCancel: (missionId: string) => void;
  targetPosition: { x: number; y: number } | null;
}

export const FireControlPanel: React.FC<Props> = ({
  state,
  onCreateMission,
  onAdjust,
  onFireForEffect,
  onCancel,
  targetPosition
}) => {
  const [ammoType, setAmmoType] = useState<AmmoType>(AmmoType.HE);
  const [targetType, setTargetType] = useState<TargetType>(TargetType.TROOPS_IN_OPEN);
  const [rounds, setRounds] = useState(5);
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);

  const toggleBattery = (id: string) => {
    setSelectedBatteries(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleFire = () => {
    if (targetPosition && selectedBatteries.length > 0) {
      onCreateMission(targetPosition, targetType, ammoType, rounds, selectedBatteries);
    }
  };

  const activeMissions = state.missions.filter(m => m.status !== 'COMPLETE' && m.status !== 'CANCELLED');

  return (
    <div style={{ padding: '10px', backgroundColor: '#1a1a2e', color: '#fff', width: '300px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#ff6b6b' }}>FIRE CONTROL</h3>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '12px' }}>TARGET: {targetPosition ? `${Math.floor(targetPosition.x)}, ${Math.floor(targetPosition.y)}` : 'Click map'}</h4>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px' }}>AMMUNITION TYPE</label>
        <select
          value={ammoType}
          onChange={e => setAmmoType(e.target.value as AmmoType)}
          style={{ width: '100%', padding: '5px', backgroundColor: '#2a2a4e', color: '#fff', border: '1px solid #444' }}
        >
          <option value={AmmoType.HE}>HE (High Explosive)</option>
          <option value={AmmoType.SMOKE}>SMOKE</option>
          <option value={AmmoType.ILLUMINATION}>ILLUMINATION</option>
          <option value={AmmoType.WP}>WP (White Phosphorus)</option>
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px' }}>TARGET TYPE</label>
        <select
          value={targetType}
          onChange={e => setTargetType(e.target.value as TargetType)}
          style={{ width: '100%', padding: '5px', backgroundColor: '#2a2a4e', color: '#fff', border: '1px solid #444' }}
        >
          <option value={TargetType.TROOPS_IN_OPEN}>Troops in Open</option>
          <option value={TargetType.TROOPS_IN_COVER}>Troops in Cover</option>
          <option value={TargetType.VEHICLES}>Vehicles</option>
          <option value={TargetType.FORTIFICATION}>Fortification</option>
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px' }}>ROUNDS: {rounds}</label>
        <input
          type="range"
          min={1}
          max={20}
          value={rounds}
          onChange={e => setRounds(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px' }}>BATTERIES</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {state.batteries.map(bat => (
            <button
              key={bat.id}
              onClick={() => toggleBattery(bat.id)}
              style={{
                padding: '5px 8px',
                fontSize: '10px',
                backgroundColor: selectedBatteries.includes(bat.id) ? '#4caf50' : '#333',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {bat.designation.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleFire}
        disabled={!targetPosition || selectedBatteries.length === 0}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: targetPosition && selectedBatteries.length > 0 ? '#ff4444' : '#666',
          color: '#fff',
          border: 'none',
          cursor: targetPosition && selectedBatteries.length > 0 ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}
      >
        FIRE MISSION
      </button>

      {activeMissions.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>ACTIVE MISSIONS</h4>
          {activeMissions.map(mission => (
            <div key={mission.id} style={{ padding: '8px', backgroundColor: '#2a2a4e', marginBottom: '5px', fontSize: '10px' }}>
              <div><strong>{mission.id}</strong> - {mission.status}</div>
              <div>Rounds: {mission.roundsFired}/{mission.roundsOrdered}</div>
              <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                <button onClick={() => onAdjust(mission.id, 'ADD', 50)} style={{ padding: '3px 5px', fontSize: '9px' }}>+50m</button>
                <button onClick={() => onAdjust(mission.id, 'DROP', 50)} style={{ padding: '3px 5px', fontSize: '9px' }}>-50m</button>
                <button onClick={() => onAdjust(mission.id, 'LEFT', 50)} style={{ padding: '3px 5px', fontSize: '9px' }}>L50</button>
                <button onClick={() => onAdjust(mission.id, 'RIGHT', 50)} style={{ padding: '3px 5px', fontSize: '9px' }}>R50</button>
              </div>
              <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                <button onClick={() => onFireForEffect(mission.id)} style={{ padding: '3px 8px', fontSize: '9px', backgroundColor: '#ff4444' }}>FFE</button>
                <button onClick={() => onCancel(mission.id)} style={{ padding: '3px 8px', fontSize: '9px', backgroundColor: '#666' }}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
