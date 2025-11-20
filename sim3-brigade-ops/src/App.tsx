import React, { useState, useEffect, useRef } from 'react';
import { BrigadeEngine } from './game/BrigadeEngine';
import { BrigadeMap } from './components/BrigadeMap';
import { BrigadeHUD } from './components/BrigadeHUD';
import { CompanyPanel } from './components/CompanyPanel';
import { BrigadeLog } from './components/BrigadeLog';
import { CommandType } from '@shared/types';
import './styles/index.css';

function App() {
  const engineRef = useRef<BrigadeEngine>(new BrigadeEngine());
  const [state, setState] = useState(engineRef.current.getState());
  const [pendingOrder, setPendingOrder] = useState<{ companyId: string; type: CommandType } | null>(null);

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
    // Check if clicking on a company
    const clickedCompany = state.friendlyCompanies.find(c => {
      const dx = c.position.x - x;
      const dy = c.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 15;
    });

    if (clickedCompany) {
      engineRef.current.selectCompany(clickedCompany.id);
      setPendingOrder(null);
    } else if (pendingOrder) {
      // Issue the pending order to the target position
      engineRef.current.issueOrder(pendingOrder.companyId, pendingOrder.type, { x, y });
      setPendingOrder(null);
    } else if (state.selectedCompany) {
      // Default to move order
      engineRef.current.issueOrder(state.selectedCompany, CommandType.MOVE, { x, y });
    }
  };

  const handleSelectCompany = (id: string) => {
    engineRef.current.selectCompany(id);
    setPendingOrder(null);
  };

  const handleOrder = (companyId: string, orderType: CommandType) => {
    if (orderType === CommandType.DEFEND) {
      // Defend at current position
      const company = state.friendlyCompanies.find(c => c.id === companyId);
      if (company) {
        engineRef.current.issueOrder(companyId, orderType, company.position);
      }
    } else {
      // Set pending order - user needs to click map for target
      setPendingOrder({ companyId, type: orderType });
    }
  };

  const handleSpeedChange = (speed: number) => {
    engineRef.current.setGameSpeed(speed);
  };

  const handlePause = () => {
    engineRef.current.togglePause();
  };

  return (
    <div className="app">
      <BrigadeHUD
        state={state}
        onSpeedChange={handleSpeedChange}
        onPause={handlePause}
      />

      {pendingOrder && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff9800',
          color: '#000',
          padding: '5px 15px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 100
        }}>
          Click map to set {pendingOrder.type} destination
        </div>
      )}

      <div className="main-content">
        <div className="left-panel">
          <CompanyPanel
            companies={state.friendlyCompanies}
            selectedCompany={state.selectedCompany}
            onSelect={handleSelectCompany}
            onOrder={handleOrder}
          />
        </div>

        <div className="center-panel">
          <BrigadeMap
            state={state}
            onMapClick={handleMapClick}
          />
          <BrigadeLog log={state.log} />
        </div>
      </div>
    </div>
  );
}

export default App;
