import React, { useRef, useEffect } from 'react';
import { BrigadeGameState, CompanyType, CompanyStatus } from '../game/BrigadeEngine';

interface Props {
  state: BrigadeGameState;
  onMapClick: (x: number, y: number) => void;
}

export const BrigadeMap: React.FC<Props> = ({ state, onMapClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, 1200, 800);

    // Draw fog of war
    for (let y = 0; y < 80; y++) {
      for (let x = 0; x < 120; x++) {
        if (!state.visibilityMap[y][x]) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(x * 10, y * 10, 10, 10);
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 1200; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = 0; y <= 800; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Draw supply depots
    state.supplyDepots.forEach(depot => {
      ctx.fillStyle = depot.isActive ? '#4caf50' : '#666';
      ctx.beginPath();
      ctx.rect(depot.position.x - 15, depot.position.y - 15, 30, 30);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Supply symbol
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('S', depot.position.x - 4, depot.position.y + 4);
    });

    // Draw objectives
    state.objectives.forEach(obj => {
      let color = '#888';
      if (obj.controlledBy === 'FRIENDLY') color = '#2196f3';
      if (obj.controlledBy === 'ENEMY') color = '#f44336';

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Capture progress
      if (obj.captureProgress > 0 && obj.captureProgress < 100) {
        ctx.strokeStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(obj.position.x, obj.position.y, obj.radius - 5, -Math.PI / 2, -Math.PI / 2 + (obj.captureProgress / 100) * Math.PI * 2);
        ctx.stroke();
      }

      // Objective name
      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.fillText(obj.name, obj.position.x - 20, obj.position.y + obj.radius + 12);
    });

    // Draw enemy companies (only if visible)
    state.enemyCompanies.forEach(company => {
      if (company.status === CompanyStatus.DESTROYED) return;
      if (!company.isVisible) return;

      ctx.fillStyle = '#f44336';
      ctx.beginPath();
      ctx.arc(company.position.x, company.position.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Type indicator
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      const typeChar = company.type === CompanyType.ARMOR ? 'A' : company.type === CompanyType.ARTILLERY ? 'R' : 'I';
      ctx.fillText(typeChar, company.position.x - 3, company.position.y + 3);
    });

    // Draw friendly companies
    state.friendlyCompanies.forEach(company => {
      if (company.status === CompanyStatus.DESTROYED) return;

      const isSelected = state.selectedCompany === company.id;

      // Company symbol
      let color = '#2196f3';
      if (company.status === CompanyStatus.ATTACKING) color = '#ff9800';
      if (company.status === CompanyStatus.DEFENDING) color = '#4caf50';
      if (company.combatEffectiveness < 50) color = '#ff5722';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(company.position.x, company.position.y, isSelected ? 15 : 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#fff' : '#000';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Type indicator
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      let typeChar = 'I';
      if (company.type === CompanyType.ARMOR) typeChar = 'A';
      if (company.type === CompanyType.MECHANIZED) typeChar = 'M';
      if (company.type === CompanyType.RECON) typeChar = 'R';
      if (company.type === CompanyType.ARTILLERY) typeChar = 'Y';
      if (company.type === CompanyType.LOGISTICS) typeChar = 'L';
      if (company.type === CompanyType.ENGINEER) typeChar = 'E';
      if (company.type === CompanyType.HQ) typeChar = 'H';
      ctx.fillText(typeChar, company.position.x - 3, company.position.y + 3);

      // Movement destination
      if (company.destination) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(company.position.x, company.position.y);
        ctx.lineTo(company.destination.x, company.destination.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Strength bar
      const barWidth = 20;
      const barHeight = 3;
      ctx.fillStyle = '#333';
      ctx.fillRect(company.position.x - barWidth/2, company.position.y + 15, barWidth, barHeight);
      ctx.fillStyle = company.strength > 50 ? '#4caf50' : company.strength > 25 ? '#ff9800' : '#f44336';
      ctx.fillRect(company.position.x - barWidth/2, company.position.y + 15, barWidth * (company.strength / 100), barHeight);
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
      style={{ border: '2px solid #333', cursor: 'pointer' }}
    />
  );
};
