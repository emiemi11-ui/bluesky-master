# 🎖️ CAX MILITARY SIMULATORS
## Exerciții Asistate pe Calculator - Simulări Militare Tactice

### Lucrare de Licență - Academia Tehnică Militară "Ferdinand I"
**Student**: Stelea Emilia
**An Academic**: 2024-2025
**Tehnologii**: React + TypeScript + Canvas API

---

## 📋 DESPRE PROIECT

Acest proiect conține simulări militare tactice avansate create pentru demonstrarea practică a sistemelor CAX (Computer Assisted Exercises) folosite în antrenamentul militar modern.

### Obiective Academice

✅ Demonstrarea practică a sistemelor CAX
✅ Ilustrarea diferitelor nivele de comandă militară
✅ Exemplificarea calculelor militare realiste
✅ Prezentarea AI militare adaptive

---

## 🎮 SIMULĂRILE IMPLEMENTATE

### ✓ SIMULARE 1: TACTICAL COMMAND SIMULATOR
**Status**: ✅ **COMPLET**
**Nivel**: Companie (100-150 soldați)
**Complexitate**: ⭐⭐⭐⭐

**Caracteristici**:
- ✓ Hartă tactică 2D cu teren procedural variat
- ✓ 10+ unități militare controlabile (infanterie, tancuri, artilerie, recunoaștere)
- ✓ AI adversă adaptivă care învață din tacticile jucătorului
- ✓ Motor de luptă realist cu factori de mediu (vreme, teren, oră)
- ✓ 3 scenarii de misiune complete
- ✓ UI/HUD militar profesional
- ✓ Sistem de comenzi NATO
- ✓ Jurnal de luptă în timp real

---

## 🚀 INSTALARE ȘI RULARE

### Cerințe Sistem
- Node.js 18+ (Recomandat: 20.x)
- npm sau yarn
- 8GB RAM (recomandat)
- Browser modern (Chrome, Firefox, Edge)

### Instalare Dependințe

```bash
# Instalează dependințele pentru Simularea 1
cd sim1-tactical-command
npm install
```

### Rulare Simulare 1

```bash
# Din directorul sim1-tactical-command:
npm run dev
```

Aplicația va porni pe `http://localhost:3000`

### Build pentru Producție

```bash
npm run build
npm run preview
```

---

## 📖 GHID DE UTILIZARE

### Control Joc

**Selectare Unități**:
- Click stânga pe unitate → Selectează unitatea
- Unități friendly (albastre) pot fi controlate
- Unități enemy (roșii) nu pot fi controlate

**Comenzi Disponibile**:
1. **MOVE** - Mișcare la coordonate
2. **ATTACK** - Atac direct
3. **DEFEND** - Poziție defensivă
4. **RETREAT** - Retragere tactică
5. **HOLD** - Oprește și menține poziția

**Controale Joc**:
- **PAUSE**: Pauză/Resume simulare
- **1x/2x/4x**: Viteză simulare
- **ESC**: Anulează comandă în curs

---

## 🎯 SCENARII DE MISIUNE

### 1. OPERAȚIUNEA COBRA (OFFENSIVE - MEDIUM)
Capturează cele 3 dealuri strategice cu forțe combinate.

### 2. APĂRAREA PODULUI (DEFENSIVE - HARD)
Apără podul 30 de minute împotriva valurilor de atacuri.

### 3. NOAPTE ÎN INFERN (NIGHT OPS - EXTREME)
Operație nocturnă de infiltrare și distrugere depot muniție.

---

## 🧠 INTELIGENȚA ARTIFICIALĂ

AI-ul inamic folosește algoritmi tactici avansați cu 8 strategii diferite:
- Aggressive Assault (superioritate copleșitoare)
- Flanking Maneuver (atac pe flanc)
- Methodical Attack (avans gradual)
- Defensive Posture (apărare)
- Focus Fire (concentrare foc)
- Tactical Retreat (retragere)
- Hold Ground (menține poziția)
- Ambush (ambuscadă)

Pe dificultate HARD, AI-ul învață tacticile jucătorului și se adaptează!

---

## 📊 ARHITECTURĂ TEHNICĂ

```
sim1-tactical-command/
├── src/
│   ├── components/        # Componente React UI
│   │   ├── TacticalMap.tsx    # Hartă Canvas
│   │   ├── HUD.tsx            # Display informații
│   │   ├── UnitPanel.tsx      # Panou unități
│   │   └── CombatLog.tsx      # Jurnal luptă
│   ├── game/              # Logică joc
│   │   ├── GameEngine.ts      # Motor principal
│   │   ├── CombatEngine.ts    # Combat sistem
│   │   └── AIController.ts    # AI tactică
│   ├── missions/          # Scenarii
│   └── App.tsx            # App principal
```

---

## 🔧 TEHNOLOGII

- **React 18** - UI Framework
- **TypeScript 5** - Type Safety
- **Tailwind CSS 3** - Styling (paletă militară)
- **Canvas API** - Rendering 2D
- **Vite 5** - Build Tool

---

## 📝 FORMULE MILITARE

### Combat Power
```
Attack Power = Firepower × Count × Ammunition% ×
               Terrain Mod × Weather Mod × Morale Mod

Defense Power = Armor × Count × Terrain Mod × Elevation Mod
```

### Pierderi
```
Casualties = Count × (Enemy Power / Own Armor × 100) × Random(0.8-1.2)
```

---

## 🎨 PALETĂ MILITARĂ

```
Military Green: #2C5530
Navy Blue:      #1E3A5F
Gold:           #D4A853
Friendly:       #0066CC (Blue)
Enemy:          #CC0000 (Red)
```

---

## 🔜 DEZVOLTĂRI VIITOARE

### Simularea 1
- [ ] After Action Report detaliat
- [ ] Replay functionality
- [ ] Save/Load game state
- [ ] Sunet și efecte audio
- [ ] Mai multe misiuni

### Simularea 2 (Planificat)
Artillery Fire Control System cu calcule balistice complete

### Simularea 3 (Planificat)
Brigade Operations Map cu logistică și fog of war

---

## 📚 REFERINȚE

- FM 3-0: Operations (US Army)
- APP-6D: NATO Military Symbology
- CCTT, JANUS, BBS (military simulators)

---

## 📞 CONTACT

**Student**: Stelea Emilia
**Instituție**: Academia Tehnică Militară "Ferdinand I"
**An**: 2024-2025

---

## 📈 PROGRES PROIECT

| Simulare | Status | Progres |
|----------|--------|---------|
| Simulare 1: Tactical Command | ✅ Complete | 100% |
| Simulare 2: Artillery Control | 📝 Planned | 0% |
| Simulare 3: Brigade Operations | 📝 Planned | 0% |

---

*"The more you sweat in training, the less you bleed in battle."*

**Version**: 1.0.0
**Built with**: ⚛️ React + 📘 TypeScript + 🎨 Tailwind CSS
