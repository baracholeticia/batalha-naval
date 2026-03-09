import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Board from '../components/Board';
import { createEmptyBoard, generateRandomBoard, FLEET, canPlaceShip, placeShipManual } from '../utils/GameLogic';
import './Placement.css';

export default function Placement() {
  const { mode } = useParams();
  const navigate = useNavigate();
  
  const [cells, setCells] = useState(createEmptyBoard());
  const [placedShips, setPlacedShips] = useState([]); 
  const [selectedShipId, setSelectedShipId] = useState(null);
  const [isHorizontal, setIsHorizontal] = useState(true);

  const handleSelectShip = (shipId) => {
    if (placedShips.includes(shipId)) {
      const newBoard = cells.map(cell => cell.includes(shipId) ? 'empty' : cell);
      setCells(newBoard);
      setPlacedShips(prev => prev.filter(id => id !== shipId));
      setSelectedShipId(shipId);
    } else {
      setSelectedShipId(shipId);
    }
  };

  const handleCellClick = (idx) => {
    if (!selectedShipId) return; 

    const shipToPlace = FLEET.find(s => s.id === selectedShipId);
    
    if (canPlaceShip(cells, idx, shipToPlace.size, isHorizontal)) {
      const newBoard = placeShipManual(cells, idx, shipToPlace.size, isHorizontal, 'myship', shipToPlace.id);
      setCells(newBoard);
      setPlacedShips([...placedShips, shipToPlace.id]);
      setSelectedShipId(null);
    } else {
      alert("Posição inválida ou fora dos limites!");
    }
  };

  const handleRandomize = () => {
    setCells(generateRandomBoard(false));
    setPlacedShips(FLEET.map(s => s.id)); 
    setSelectedShipId(null);
  };

  const handleClear = () => {
    setCells(createEmptyBoard());
    setPlacedShips([]);
    setSelectedShipId(null);
  };

  const handleStartBattle = async () => {
    if (placedShips.length < FLEET.length) {
      alert("Você precisa posicionar todos os navios primeiro!");
      return;
    }

    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    
    const shipsData = FLEET.map(ship => {
      const firstIdx = cells.findIndex(c => c.includes(ship.id));
      return {
        type: ship.size,
        size: ship.size,
        row: Math.floor(firstIdx / 10),
        col: firstIdx % 10,
        orientation: (cells[firstIdx + 1] && cells[firstIdx + 1].includes(ship.id)) ? 'horizontal' : 'vertical'
      };
    });

    let currentAiLevel = 1;
    if (mode === 'campanha') {
      currentAiLevel = parseInt(localStorage.getItem('campaignStage')) || 1;
    } else {
      currentAiLevel = parseInt(localStorage.getItem('aiLevel')) || 1;
    }

    try {
      const response = await fetch('http://localhost:3000/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'IA',
          gameMode: mode,
          aiLevel: currentAiLevel, 
          loginPlayer1: loggedUser.login,
          ships: shipsData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao iniciar jogo");

      localStorage.setItem('currentGameId', data.gameId);
      navigate('/game');

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="placement-layout">
      <Header />
      <main className="placement-container">
        <header className="placement-header">
          <h1>Posicione sua Frota</h1>
          <p>Modo selecionado: <strong>{mode}</strong></p>
        </header>

        <div className="placement-content">
          <div className="placement-top">
            <section className="board-section">
              <Board isOpponent={false} cells={cells} onCellClick={handleCellClick} />
            </section>

            <section className="controls-section">
              <div className="drawn-card controls-card">
                <h2>Comandos</h2>
                <div className="button-group">
                  <button 
                    className={`drawn-btn action-btn ${isHorizontal ? 'blue-btn' : 'yellow-btn'}`} 
                    onClick={() => setIsHorizontal(!isHorizontal)}
                  >
                    <span></span> Rotação: {isHorizontal ? 'Horizontal' : 'Vertical'}
                  </button>
                  <button className="drawn-btn yellow-btn action-btn" onClick={handleRandomize}>
                    <span></span> Distribuição Aleatória
                  </button>
                  <button className="drawn-btn red-btn action-btn" onClick={handleClear}>
                    <span></span> Limpar Tabuleiro
                  </button>
                </div>

                <button 
                  className={`drawn-btn start-battle-btn ${placedShips.length === FLEET.length ? 'green-btn' : 'white-btn'}`} 
                  onClick={handleStartBattle}
                >
                  INICIAR BATALHA
                </button>
              </div>
            </section>
          </div>

          <section className="fleet-panel-section">
            <div className="drawn-card fleet-panel">
              <h3>Selecione um navio para posicionar:</h3>
              <div className="fleet-list-horizontal">
                {FLEET.map(ship => {
                  const isPlaced = placedShips.includes(ship.id);
                  const isSelected = selectedShipId === ship.id;
                  const sizeClass = ship.size === 6 ? 'p6' : ship.size === 4 ? 'p4' : ship.size === 3 ? 'p3' : 'p1';

                  return (
                    <div 
                      key={ship.id} 
                      className={`ship-select-item-horiz ${isPlaced ? 'placed' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectShip(ship.id)}
                    >
                      <span className="ship-name-label">{ship.name}</span>
                      <div className={`ship-blocks ${sizeClass}`}></div>
                      {isPlaced && <div className="placed-overlay">Reposicionar</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}