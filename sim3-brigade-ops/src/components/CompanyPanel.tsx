import React from 'react';
import { Company, CompanyType, CompanyStatus } from '../game/BrigadeEngine';
import { CommandType } from '@shared/types';

interface Props {
  companies: Company[];
  selectedCompany: string | null;
  onSelect: (id: string) => void;
  onOrder: (companyId: string, orderType: CommandType) => void;
}

export const CompanyPanel: React.FC<Props> = ({ companies, selectedCompany, onSelect, onOrder }) => {
  const getTypeColor = (type: CompanyType) => {
    switch (type) {
      case CompanyType.ARMOR: return '#ff9800';
      case CompanyType.INFANTRY: return '#2196f3';
      case CompanyType.MECHANIZED: return '#9c27b0';
      case CompanyType.RECON: return '#4caf50';
      case CompanyType.ARTILLERY: return '#f44336';
      case CompanyType.LOGISTICS: return '#795548';
      case CompanyType.ENGINEER: return '#607d8b';
      case CompanyType.HQ: return '#ffc107';
    }
  };

  const getStatusText = (status: CompanyStatus) => {
    switch (status) {
      case CompanyStatus.IDLE: return 'IDLE';
      case CompanyStatus.MOVING: return 'MOVING';
      case CompanyStatus.ATTACKING: return 'ATTACK';
      case CompanyStatus.DEFENDING: return 'DEFEND';
      case CompanyStatus.RETREATING: return 'RETREAT';
      case CompanyStatus.RESUPPLYING: return 'RESUPPLY';
      case CompanyStatus.DESTROYED: return 'DESTROYED';
      case CompanyStatus.OUT_OF_CONTACT: return 'NO CONTACT';
    }
  };

  const activeCompanies = companies.filter(c => c.status !== CompanyStatus.DESTROYED);
  const selected = companies.find(c => c.id === selectedCompany);

  return (
    <div style={{ padding: '10px', backgroundColor: '#1a1a2e', color: '#fff', height: '100%', overflow: 'auto' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>COMPANIES</h3>

      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
        {activeCompanies.map(company => (
          <div
            key={company.id}
            onClick={() => onSelect(company.id)}
            style={{
              padding: '6px',
              marginBottom: '3px',
              backgroundColor: selectedCompany === company.id ? '#3a3a5e' : '#2a2a4e',
              border: selectedCompany === company.id ? '1px solid #4caf50' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: getTypeColor(company.type) }}>{company.designation}</span>
              <span style={{ fontSize: '8px', color: '#888' }}>{getStatusText(company.status)}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '3px', fontSize: '9px' }}>
              <span style={{ color: company.strength > 50 ? '#4caf50' : '#ff9800' }}>STR:{Math.floor(company.strength)}</span>
              <span style={{ color: company.ammunition > 30 ? '#aaa' : '#f44336' }}>AMO:{Math.floor(company.ammunition)}</span>
              <span style={{ color: company.fuel > 30 ? '#aaa' : '#ff9800' }}>FUL:{Math.floor(company.fuel)}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>{selected.designation}</h4>

          <div style={{ fontSize: '10px', marginBottom: '10px' }}>
            <div>Type: <span style={{ color: getTypeColor(selected.type) }}>{selected.type}</span></div>
            <div>Strength: {Math.floor(selected.strength)}%</div>
            <div>Morale: {Math.floor(selected.morale)}%</div>
            <div>Combat Eff: {Math.floor(selected.combatEffectiveness)}%</div>
            <div>Position: {Math.floor(selected.position.x)}, {Math.floor(selected.position.y)}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <button
              onClick={() => onOrder(selected.id, CommandType.MOVE)}
              style={{ padding: '5px 10px', fontSize: '9px', backgroundColor: '#2196f3', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              MOVE
            </button>
            <button
              onClick={() => onOrder(selected.id, CommandType.ATTACK)}
              style={{ padding: '5px 10px', fontSize: '9px', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              ATTACK
            </button>
            <button
              onClick={() => onOrder(selected.id, CommandType.DEFEND)}
              style={{ padding: '5px 10px', fontSize: '9px', backgroundColor: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              DEFEND
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
