import React, { useRef, useEffect } from 'react';
import { ArtilleryGameState, ArtilleryType, ArtilleryStatus, Target, Impact, AmmoType } from '../game/ArtilleryEngine';

interface Props {
  state: ArtilleryGameState;
  onMapClick: (x: number, y: number) => void;
}

export const ArtilleryMap: React.FC<Props> = ({ state, onMapClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(0, 0, 1200, 800);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 1200; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = 0; y <= 800; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Draw range rings from batteries
    state.batteries.forEach(battery => {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(battery.position.x, battery.position.y, 500, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw targets
    state.targets.forEach(target => {
      if (target.destroyed) {
        ctx.fillStyle = '#333';
      } else {
        const damage = target.damageLevel / 100;
        ctx.fillStyle = `rgb(${Math.floor(255 * damage)}, ${Math.floor(100 * (1 - damage))}, 50)`;
      }

      // Target shape based on type
      ctx.beginPath();
      if (target.type === 'VEHICLES') {
        ctx.rect(target.position.x - target.size/2, target.position.y - target.size/2, target.size, target.size);
      } else if (target.type === 'FORTIFICATION') {
        ctx.moveTo(target.position.x, target.position.y - target.size/2);
        ctx.lineTo(target.position.x + target.size/2, target.position.y + target.size/2);
        ctx.lineTo(target.position.x - target.size/2, target.position.y + target.size/2);
        ctx.closePath();
      } else {
        ctx.arc(target.position.x, target.position.y, target.size/2, 0, Math.PI * 2);
      }
      ctx.fill();

      // Target label
      if (!target.destroyed) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(target.id.toUpperCase(), target.position.x - 8, target.position.y + target.size/2 + 12);
      }
    });

    // Draw impacts
    state.impacts.forEach(impact => {
      const age = (state.gameTime - impact.time) / 3000;
      const alpha = 1 - age;

      if (impact.type === AmmoType.HE) {
        ctx.fillStyle = `rgba(255, 150, 0, ${alpha})`;
      } else if (impact.type === AmmoType.SMOKE) {
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
      } else if (impact.type === AmmoType.ILLUMINATION) {
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(impact.position.x, impact.position.y, impact.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw batteries
    state.batteries.forEach(battery => {
      const isSelected = state.selectedBattery === battery.id;

      // Battery symbol
      ctx.fillStyle = isSelected ? '#00ff00' : '#0088ff';
      ctx.beginPath();
      ctx.rect(battery.position.x - 15, battery.position.y - 10, 30, 20);
      ctx.fill();

      // Artillery barrel
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(battery.position.x, battery.position.y);
      ctx.lineTo(battery.position.x, battery.position.y - 25);
      ctx.stroke();

      // Status indicator
      let statusColor = '#00ff00';
      if (battery.status === ArtilleryStatus.LOADING) statusColor = '#ffff00';
      if (battery.status === ArtilleryStatus.OUT_OF_AMMO) statusColor = '#ff0000';
      if (battery.status === ArtilleryStatus.DISABLED) statusColor = '#666';

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(battery.position.x + 20, battery.position.y - 15, 5, 0, Math.PI * 2);
      ctx.fill();

      // Battery designation
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(battery.designation.split(' ')[0], battery.position.x - 15, battery.position.y + 30);
    });

    // Draw fire missions
    state.missions.forEach(mission => {
      if (mission.status === 'COMPLETE' || mission.status === 'CANCELLED') return;

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(mission.targetPosition.x, mission.targetPosition.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target cross
      ctx.beginPath();
      ctx.moveTo(mission.targetPosition.x - 15, mission.targetPosition.y);
      ctx.lineTo(mission.targetPosition.x + 15, mission.targetPosition.y);
      ctx.moveTo(mission.targetPosition.x, mission.targetPosition.y - 15);
      ctx.lineTo(mission.targetPosition.x, mission.targetPosition.y + 15);
      ctx.stroke();
    });

  }, [state]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onMapClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={800}
      onClick={handleClick}
      style={{ border: '2px solid #333', cursor: 'crosshair' }}
    />
  );
};
