import React, { useRef, useEffect, useState } from 'react';
import { MilitaryUnit, TerrainCell, Objective } from '@shared/types';
import { getNATOSymbol, getAffiliationColor } from '@shared/constants/nato';

interface TacticalMapProps {
  units: MilitaryUnit[];
  terrain: TerrainCell[][];
  objectives: Objective[];
  onUnitClick: (unit: MilitaryUnit) => void;
  onMapClick: (x: number, y: number) => void;
  selectedUnit?: MilitaryUnit;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  units,
  terrain,
  objectives,
  onUnitClick,
  onMapClick,
  selectedUnit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw terrain
    renderTerrain(ctx, terrain);

    // Draw grid
    renderGrid(ctx);

    // Draw objectives
    objectives.forEach(obj => renderObjective(ctx, obj));

    // Draw units
    units.forEach(unit => renderUnit(ctx, unit, unit.id === selectedUnit?.id));

    // Draw movement paths
    units.forEach(unit => {
      if (unit.destination) {
        renderMovementPath(ctx, unit);
      }
    });

  }, [units, terrain, objectives, selectedUnit]);

  const renderTerrain = (ctx: CanvasRenderingContext2D, terrain: TerrainCell[][]) => {
    const cellSize = 20;

    for (let y = 0; y < terrain.length; y++) {
      for (let x = 0; x < terrain[y].length; x++) {
        const cell = terrain[y][x];

        // Color based on terrain type
        switch (cell.type) {
          case 'FOREST':
            ctx.fillStyle = '#2d5016';
            break;
          case 'URBAN':
            ctx.fillStyle = '#606060';
            break;
          case 'WATER':
            ctx.fillStyle = '#2a5a8a';
            break;
          case 'HILL':
            ctx.fillStyle = '#8b7355';
            break;
          case 'ROAD':
            ctx.fillStyle = '#505050';
            break;
          default:
            ctx.fillStyle = '#6b8e23';
        }

        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Draw elevation contours for hills
        if (cell.type === 'HILL') {
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  const renderGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 100;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }

    // Grid labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    for (let x = 0; x <= ctx.canvas.width; x += gridSize) {
      for (let y = gridSize; y <= ctx.canvas.height; y += gridSize) {
        const label = `${Math.floor(x / gridSize)}${String.fromCharCode(65 + Math.floor(y / gridSize) - 1)}`;
        ctx.fillText(label, x + 5, y - 5);
      }
    }
  };

  const renderUnit = (ctx: CanvasRenderingContext2D, unit: MilitaryUnit, isSelected: boolean) => {
    if (unit.status === 'DESTROYED') return;

    const x = unit.position.x;
    const y = unit.position.y;
    const size = 24;

    // NATO symbol background
    const color = getAffiliationColor(unit.team);
    ctx.fillStyle = color;
    ctx.strokeStyle = isSelected ? '#FFD700' : color;
    ctx.lineWidth = isSelected ? 3 : 2;

    // Draw frame
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // Draw unit symbol
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getNATOSymbol(unit.type), x, y);

    // Draw health bar
    const healthBarWidth = size;
    const healthBarHeight = 3;
    ctx.fillStyle = '#000';
    ctx.fillRect(x - healthBarWidth / 2, y + size / 2 + 2, healthBarWidth, healthBarHeight);

    const healthPercent = unit.count / unit.maxCount;
    ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
    ctx.fillRect(x - healthBarWidth / 2, y + size / 2 + 2, healthBarWidth * healthPercent, healthBarHeight);

    // Draw facing indicator
    const angle = unit.facing * Math.PI / 180;
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle - Math.PI / 2) * (size / 2 + 8),
      y + Math.sin(angle - Math.PI / 2) * (size / 2 + 8)
    );
    ctx.stroke();

    // Draw designation
    ctx.fillStyle = '#FFF';
    ctx.font = '10px monospace';
    ctx.fillText(unit.designation, x, y + size / 2 + 12);

    // Draw status indicator
    if (unit.status === 'ENGAGING') {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(x + size / 2, y - size / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (unit.status === 'MOVING') {
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(x + size / 2, y - size / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderObjective = (ctx: CanvasRenderingContext2D, objective: Objective) => {
    const x = objective.position.x;
    const y = objective.position.y;

    // Draw objective circle
    ctx.strokeStyle = objective.controlledBy === 'FRIENDLY' ? '#0066CC' :
      objective.controlledBy === 'ENEMY' ? '#CC0000' : '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, objective.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw objective marker
    ctx.fillStyle = objective.controlledBy === 'FRIENDLY' ? '#0066CC' :
      objective.controlledBy === 'ENEMY' ? '#CC0000' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw objective name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(objective.name, x, y - 60);
  };

  const renderMovementPath = (ctx: CanvasRenderingContext2D, unit: MilitaryUnit) => {
    if (!unit.destination) return;

    ctx.strokeStyle = getAffiliationColor(unit.team);
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(unit.position.x, unit.position.y);
    ctx.lineTo(unit.destination.x, unit.destination.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw destination marker
    ctx.fillStyle = getAffiliationColor(unit.team);
    ctx.beginPath();
    ctx.arc(unit.destination.x, unit.destination.y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a unit
    const clickedUnit = units.find(unit => {
      const dx = unit.position.x - x;
      const dy = unit.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedUnit) {
      onUnitClick(clickedUnit);
    } else {
      onMapClick(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border-4 border-military-navy bg-black cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />

      {/* Coordinates display */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs font-mono">
        Grid: {Math.floor(mousePos.x / 100)}{String.fromCharCode(65 + Math.floor(mousePos.y / 100))} |
        Coords: ({Math.floor(mousePos.x)}, {Math.floor(mousePos.y)})
      </div>
    </div>
  );
};
