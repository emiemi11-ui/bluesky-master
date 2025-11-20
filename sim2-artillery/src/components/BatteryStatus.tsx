import React from 'react';
import { ArtilleryPiece, ArtilleryStatus, ArtilleryType } from '../game/ArtilleryEngine';

interface Props {
  batteries: ArtilleryPiece[];
  selectedBattery: string | null;
  onSelect: (id: string) => void;
}

export const BatteryStatus: React.FC<Props> = ({ batteries, selectedBattery, onSelect }) => {
  const getStatusColor = (status: ArtilleryStatus) => {
    switch (status) {
      case ArtilleryStatus.READY: return '#4caf50';
      case ArtilleryStatus.LOADING: return '#ff9800';
      case ArtilleryStatus.FIRING: return '#f44336';
      case ArtilleryStatus.OUT_OF_AMMO: return '#9e9e9e';
      case ArtilleryStatus.DISABLED: return '#424242';
      default: return '#fff';
    }
  };

  const getTypeName = (type: ArtilleryType) => {
    switch (type) {
      case ArtilleryType.HOWITZER_155MM: return '155mm';
      case ArtilleryType.HOWITZER_105MM: return '105mm';
      case ArtilleryType.MORTAR_120MM: return 'M120';
      case ArtilleryType.MORTAR_81MM: return 'M81';
      case ArtilleryType.MLRS: return 'MLRS';
    }
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#1a1a2e', color: '#fff' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>BATTERY STATUS</h3>

      {batteries.map(battery => (
        <div
          key={battery.id}
          onClick={() => onSelect(battery.id)}
          style={{
            padding: '8px',
            marginBottom: '5px',
            backgroundColor: selectedBattery === battery.id ? '#3a3a5e' : '#2a2a4e',
            border: selectedBattery === battery.id ? '1px solid #4caf50' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '11px' }}>{battery.designation}</strong>
            <span style={{
              fontSize: '9px',
              padding: '2px 6px',
              backgroundColor: getStatusColor(battery.status),
              borderRadius: '2px'
            }}>
              {battery.status}
            </span>
          </div>

          <div style={{ fontSize: '10px', marginTop: '5px', color: '#aaa' }}>
            {getTypeName(battery.type)} | Crew: {battery.crew}/{battery.maxCrew}
          </div>

          <div style={{ fontSize: '9px', marginTop: '5px' }}>
            <span style={{ color: '#ff6b6b' }}>HE:{battery.ammunition.HE}</span>{' '}
            <span style={{ color: '#aaa' }}>SM:{battery.ammunition.SMOKE}</span>{' '}
            <span style={{ color: '#fff59d' }}>IL:{battery.ammunition.ILLUMINATION}</span>{' '}
            <span style={{ color: '#ffab40' }}>WP:{battery.ammunition.WP}</span>
          </div>

          {battery.fatigue > 0 && (
            <div style={{ fontSize: '9px', marginTop: '3px' }}>
              <span style={{ color: '#ff9800' }}>Fatigue: {Math.floor(battery.fatigue)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
