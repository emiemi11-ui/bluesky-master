import React from 'react';
import { MilitaryUnit } from '@shared/types';
import { getNATOSymbol } from '@shared/constants/nato';

interface UnitPanelProps {
  unit: MilitaryUnit | null;
  onOrderClick: (orderType: string) => void;
}

export const UnitPanel: React.FC<UnitPanelProps> = ({ unit, onOrderClick }) => {

  if (!unit) {
    return (
      <div className="bg-military-gray border-l-4 border-military-navy text-white p-4 w-80 h-full">
        <div className="text-center text-gray-500 mt-20">
          <div className="text-4xl mb-4">⌖</div>
          <div className="text-sm uppercase">No Unit Selected</div>
          <div className="text-xs text-gray-600 mt-2">
            Click on a unit to view details
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENGAGING': return 'text-red-400';
      case 'MOVING': return 'text-green-400';
      case 'RETREATING': return 'text-yellow-400';
      case 'DESTROYED': return 'text-gray-600';
      case 'PINNED': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 uppercase">{label}</span>
        <span className="font-bold">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-black/50 border border-gray-700">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-military-gray border-l-4 border-military-navy text-white p-4 w-80 h-full overflow-y-auto">
      {/* Unit header */}
      <div className="border-b-2 border-military-gold pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-friendly border-2 border-white w-12 h-12 flex items-center justify-center text-2xl font-bold">
            {getNATOSymbol(unit.type)}
          </div>
          <div>
            <div className="text-xl font-bold">{unit.designation}</div>
            <div className="text-xs text-gray-400 uppercase">{unit.type} - {unit.size}</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase mb-1">Status</div>
        <div className={`text-lg font-bold ${getStatusColor(unit.status)}`}>
          {unit.status}
        </div>
      </div>

      {/* Personnel */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase mb-1">Personnel/Equipment</div>
        <div className="text-2xl font-bold">
          {unit.count} / {unit.maxCount}
        </div>
        <div className="text-xs text-gray-500">
          {((unit.count / unit.maxCount) * 100).toFixed(0)}% strength
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <StatBar
          label="Morale"
          value={unit.morale}
          color={unit.morale > 70 ? 'bg-green-500' : unit.morale > 40 ? 'bg-yellow-500' : 'bg-red-500'}
        />
        <StatBar
          label="Ammunition"
          value={unit.ammunition}
          color={unit.ammunition > 50 ? 'bg-blue-500' : unit.ammunition > 25 ? 'bg-yellow-500' : 'bg-red-500'}
        />
        <StatBar
          label="Fuel"
          value={unit.fuel}
          color={unit.fuel > 50 ? 'bg-cyan-500' : unit.fuel > 25 ? 'bg-yellow-500' : 'bg-red-500'}
        />
      </div>

      {/* Capabilities */}
      <div className="mb-4 border-t border-gray-700 pt-3">
        <div className="text-xs text-gray-400 uppercase mb-2">Capabilities</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-500">Speed</div>
            <div className="font-bold">{unit.speed} km/h</div>
          </div>
          <div>
            <div className="text-gray-500">Firepower</div>
            <div className="font-bold">{unit.firepower}</div>
          </div>
          <div>
            <div className="text-gray-500">Armor</div>
            <div className="font-bold">{unit.armor}</div>
          </div>
          <div>
            <div className="text-gray-500">Range</div>
            <div className="font-bold">{unit.weaponRange}m</div>
          </div>
        </div>
      </div>

      {/* Current order */}
      {unit.currentOrder && (
        <div className="mb-4 border-t border-gray-700 pt-3">
          <div className="text-xs text-gray-400 uppercase mb-1">Current Order</div>
          <div className="bg-black/30 border border-military-gold px-3 py-2">
            <div className="font-bold text-military-gold">{unit.currentOrder.type}</div>
            <div className="text-xs text-gray-400">Priority: {unit.currentOrder.priority}</div>
          </div>
        </div>
      )}

      {/* Commands - only for friendly units */}
      {unit.team === 'FRIENDLY' && unit.status !== 'DESTROYED' && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-gray-400 uppercase mb-2">Issue Orders</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOrderClick('MOVE')}
              className="bg-military-navy hover:bg-military-navy/70 border-2 border-military-gold px-3 py-2 text-sm font-bold transition-colors"
            >
              ➜ MOVE
            </button>
            <button
              onClick={() => onOrderClick('ATTACK')}
              className="bg-red-800 hover:bg-red-700 border-2 border-red-400 px-3 py-2 text-sm font-bold transition-colors"
            >
              ⚔ ATTACK
            </button>
            <button
              onClick={() => onOrderClick('DEFEND')}
              className="bg-blue-800 hover:bg-blue-700 border-2 border-blue-400 px-3 py-2 text-sm font-bold transition-colors"
            >
              🛡 DEFEND
            </button>
            <button
              onClick={() => onOrderClick('RETREAT')}
              className="bg-yellow-700 hover:bg-yellow-600 border-2 border-yellow-400 px-3 py-2 text-sm font-bold transition-colors"
            >
              ← RETREAT
            </button>
            <button
              onClick={() => onOrderClick('HOLD')}
              className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-400 px-3 py-2 text-sm font-bold transition-colors col-span-2"
            >
              ■ HOLD POSITION
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
