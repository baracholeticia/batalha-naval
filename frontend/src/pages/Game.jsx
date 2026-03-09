import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Board from '../components/Board';
import { mapBackendToFrontendBoard } from '../utils/BoardMapper';
import './Game.css';
import '../components/Ship.css';
import hitAudio from '../assets/hit.mp3';
import missAudio from '../assets/miss.mp3';
import soundtrackAudio from '../assets/soundtrack.mp3';
import mute from '../assets/volume-mute.png';
import volume from '../assets/volume.png';

const somHit = new Audio(hitAudio);
const somMiss = new Audio(missAudio);
somHit.volume = 0.5; 
somMiss.volume = 0.5;

export default function Game() {
  const navigate = useNavigate();
  const gameId = localStorage.getItem('currentGameId');

  const prevOpponentBoard = useRef(Array(100).fill('empty'));
  const [gameState, setGameState] = useState(null);
  const [playerBoard, setPlayerBoard] = useState(Array(100).fill('empty'));
  const [opponentBoard, setOpponentBoard] = useState(Array(100).fill('empty'));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [aiAnimatingIndex, setAiAnimatingIndex] = useState(null); 
  const prevPlayerBoard = useRef(Array(100).fill('empty'));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedMoveShip, setSelectedMoveShip] = useState('');
  
  const [campaignStage] = useState(() => {
    return parseInt(localStorage.getItem('campaignStage')) || 1;
  });
  
  const [isMuted, setIsMuted] = useState(false);

  const trilhaSonoraRef = useRef(null);

  useEffect(() => {
    trilhaSonoraRef.current = new Audio(soundtrackAudio);
    trilhaSonoraRef.current.loop = true;
    trilhaSonoraRef.current.volume = 0.1;

    return () => {
      if (trilhaSonoraRef.current) {
        trilhaSonoraRef.current.pause();
        trilhaSonoraRef.current.currentTime = 0;
      }
    };
  }, []); 

  useEffect(() => {
    if (trilhaSonoraRef.current) {
      trilhaSonoraRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const startMusic = () => {
    if (trilhaSonoraRef.current && trilhaSonoraRef.current.paused) {
      trilhaSonoraRef.current.play().catch(() => console.log("Aguardando interação..."));
    }
  };

  //cronometro
  useEffect(() => {
    let interval;
    if (gameState?.state === 'playing') {
      interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState?.state]);

  const formatTime = (timeInSeconds) => {
    const m = String(Math.floor(timeInSeconds / 60)).padStart(2, '0');
    const s = String(timeInSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  //polling do back
  const fetchGameState = async () => {
    if (!gameId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/game/${gameId}`);
      if (!res.ok) throw new Error("Erro ao buscar jogo");
      const data = await res.json();
      
      setGameState(data);

      const myData = data.players[0]; 
      const oppData = data.players[1];

      if (myData) setPlayerBoard(mapBackendToFrontendBoard(myData, false));
      if (oppData) setOpponentBoard(mapBackendToFrontendBoard(oppData, true));

      setIsMyTurn(data.currentPlayerId === myData?.id);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGameState(); 
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayerAttack = async (idx) => {
    startMusic();
    if (!isMyTurn || gameState?.state !== 'playing') return;

    if (opponentBoard[idx] !== 'empty' && opponentBoard[idx] !== 'hidden') {
      console.warn("posição já bombardeada.");
      return; 
    }

    setAnimatingIndex(idx);
    const row = Math.floor(idx / 10);
    const col = idx % 10;

    try {
      await fetch(`http://localhost:3000/api/game/${gameId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, col })
      });
      
      setTimeout(() => {
          setAnimatingIndex(null);       
          fetchGameState();       
      }, 500); 

    } catch (error) {
      console.error(error);
      alert("Erro ao atacar!");
    }
  };

  //efeito sonoro player
  useEffect(() => {
    if (!gameState || gameState.state !== 'playing') {
      prevOpponentBoard.current = opponentBoard;
      return;
    }

    const prev = prevOpponentBoard.current;
    const current = opponentBoard;

    const changedIndex = current.findIndex((cell, i) => prev[i] !== cell);

    if (changedIndex !== -1) {
      const estadoAntigo = prev[changedIndex];
      const estadoNovo = current[changedIndex];
      

      if (estadoAntigo !== 'empty' || (estadoNovo !== 'empty' && estadoNovo !== 'hidden')) {
        if (estadoNovo.includes('hit') || estadoNovo.includes('sunk')) {
          somHit.currentTime = 0;
          somHit.play().catch(e => console.log("Erro no áudio:", e));
        } else if (estadoNovo.includes('water') || estadoNovo.includes('miss')) {
          somMiss.currentTime = 0;
          somMiss.play().catch(e => console.log("Erro no áudio:", e));
        }
      }
    }

    prevOpponentBoard.current = current;
  }, [opponentBoard, gameState]);

  //efeito sonoro ia
  useEffect(() => {
    if (!gameState || gameState.state !== 'playing') {
      prevPlayerBoard.current = playerBoard;
      return;
    }

    const prev = prevPlayerBoard.current;
    const current = playerBoard;

    const changedIndex = current.findIndex((cell, i) => prev[i] !== cell);

    if (changedIndex !== -1) {
      const estadoNovo = current[changedIndex];

      if (estadoNovo !== 'ship' && estadoNovo !== 'empty') {
        
        if (estadoNovo.includes('hit') || estadoNovo.includes('sunk')) {
            somHit.currentTime = 0;
            somHit.play().catch(e => console.log("Erro no áudio:", e));
        } else if (estadoNovo.includes('water') || estadoNovo.includes('miss')) {
            somMiss.currentTime = 0;
            somMiss.play().catch(e => console.log("Erro no áudio:", e));
        }
        
        setAiAnimatingIndex(changedIndex);
        setTimeout(() => {
          setAiAnimatingIndex(null);
        }, 500);
      }
    }

    prevPlayerBoard.current = current;
  }, [playerBoard, gameState]);

  const handleMoveShip = async (direction) => {
    if (!selectedMoveShip) {
        alert("Selecione um navio para mover!");
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/api/game/${gameId}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shipId: selectedMoveShip, direction })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Movimento inválido");
        fetchGameState();

        setSelectedMoveShip('');
    } catch (error) {
        alert(error.message);
    }
  };

  const handleNextCampaignStage = () => {
    localStorage.setItem('campaignStage', campaignStage + 1);
    navigate('/placement/campanha'); 
  };

  const handleMyBoardClick = (idx) => {
    if (gameState?.gameMode !== 'dinamico') return;
    
    const row = Math.floor(idx / 10);
    const col = idx % 10;

    const clickedShip = myData?.ships.find(ship => {
      for (let i = 0; i < ship.size; i++) {
          let sr = ship.row;
          let sc = ship.col;
          if (ship.orientation === 'horizontal') sc += i;
          else sr += i;
          
          if (sr === row && sc === col) return true;
      }
      return false;
    });

    if (clickedShip && !clickedShip.sunk) {
        setSelectedMoveShip(clickedShip.id);
    }
  };

  const getHighlightedPlayerBoard = () => {
    const boardCopy = [...playerBoard];
    if (!selectedMoveShip || !myData?.ships) return boardCopy;

    const ship = myData.ships.find(s => s.id === selectedMoveShip);
    if (!ship) return boardCopy;

    for (let i = 0; i < ship.size; i++) {
        let r = ship.row;
        let c = ship.col;
        if (ship.orientation === 'horizontal') c += i;
        else r += i;
        
        const idx = r * 10 + c;
        if (boardCopy[idx]) {
           boardCopy[idx] = boardCopy[idx] + ' selected-ship-active';
        }
    }
    return boardCopy;
  };

  const handleEndGame = () => {
    localStorage.removeItem('currentGameId');
    localStorage.setItem('campaignStage', 1); 
    navigate('/home');
  };

  if (!gameState) return <div style={{textAlign: 'center', padding: '50px'}}>📡 Conectando com o Quartel General...</div>;

  const myData = gameState.players[0];
  const enemyData = gameState.players[1];
  const didIWin = enemyData?.ships.every(s => s.sunk);
  const gameStatus = gameState.state === 'game_over' ? (didIWin ? 'won' : 'lost') : 'playing';

  const finalPlayerBoard = getHighlightedPlayerBoard();

  return (
    <div className="game-layout">
      <Header />
      <main className="game-content">
        <div className="game-timer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <div>Tempo de Batalha: <span>{formatTime(timeElapsed)}</span></div>

          <button 
            className="drawn-btn" 
            onClick={() => setIsMuted(!isMuted)}
            style={{ 
              padding: '0px 0px', 
              fontSize: '20px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <img src={mute} alt="Mudo"></img> : <img src={volume} alt="Volume"></img>}
          </button>
        </div>
        <div className="boards-container">
          <section className="board-section">
            <div className="section-header">
               <h1>Sua Frota {gameState.gameMode === 'campanha' && `- Fase ${campaignStage}`}</h1>
            </div>
            <Board 
               isOpponent={false} 
               cells={finalPlayerBoard} 
               animatingIndex={aiAnimatingIndex} 
               onCellClick={handleMyBoardClick}
            />
            
            {gameState.gameMode === 'dinamico' && (
              <div className="drawn-card dynamic-panel" style={{marginTop: '20px'}}>
                <h3>Mover Navio (1 por turno)</h3>
                <div className="dynamic-controls">
                  <select value={selectedMoveShip} onChange={(e) => setSelectedMoveShip(e.target.value)}>
                    <option value="">Selecione um navio...</option>
                    {myData?.ships.filter(s => !s.sunk).map(s => (
                        <option key={s.id} value={s.id}>{s.type} ({s.size} casas)</option>
                    ))}
                  </select>
                  <div className="dynamic-arrows">
                    <button className="drawn-btn" disabled={myData?.hasMovedThisTurn || !isMyTurn} onClick={() => handleMoveShip('left')}>⭠</button>
                    <button className="drawn-btn" disabled={myData?.hasMovedThisTurn || !isMyTurn} onClick={() => handleMoveShip('up')}>⭡</button>
                    <button className="drawn-btn" disabled={myData?.hasMovedThisTurn || !isMyTurn} onClick={() => handleMoveShip('down')}>⭣</button>
                    <button className="drawn-btn" disabled={myData?.hasMovedThisTurn || !isMyTurn} onClick={() => handleMoveShip('right')}>⭢</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="board-section">
            <div className="section-header">
               <h1>Águas Inimigas</h1>
            </div>
            <Board 
               isOpponent={true} 
               cells={opponentBoard} 
               onCellClick={handlePlayerAttack} 
               animatingIndex={animatingIndex} 
            />
          </section>
        </div>

        <div className="turn-row">
          <div className={`turn-indicator ${isMyTurn ? 'player-turn' : 'enemy-turn'}`}>
            <h2>{isMyTurn ? "Sua vez, atire!" : "Vez do adversário"}</h2>
          </div>
        </div>
      </main>

      {gameStatus !== 'playing' && (
        <div className="game-over-overlay">
          {gameStatus === 'won' && gameState.gameMode === 'campanha' && campaignStage < 3 ? (
            <div className="drawn-card game-over-modal modal-campaign">
              <h1 className="modal-title text-blue">FASE {campaignStage} CONCLUÍDA!</h1>
              <p className="game-over-desc">Prepare-se para reposicionar sua frota contra a próxima IA.</p>
              <button className="drawn-btn yellow-btn game-over-btn" onClick={handleNextCampaignStage}>
                Reposicionar Navios e Avançar
              </button>
            </div>
          ) : (
            <div className="drawn-card game-over-modal">
              <h1 className={`modal-title ${gameStatus === 'won' ? 'text-blue' : 'text-red'}`}>
                {gameStatus === 'won' ? 'VITÓRIA!' : 'DERROTA!'}
              </h1>
              <p className="game-over-desc">
                {gameStatus === 'won' ? 'Você afundou todos os navios inimigos!' : 'Seus navios afundaram!'}
              </p>
              <div className="game-over-stats">
                <span>⏱ Duração: <strong>{formatTime(timeElapsed)}</strong></span>
              </div>
              <button className="drawn-btn white-btn game-over-btn" onClick={handleEndGame}>
                Voltar ao Menu Principal
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="game-footer">
         <div className="cheatsheet">
           <div className="cheatsheet-title">Navios</div>
           <div className="fleet-list">
             <div className="ship-item">Porta Aviões (2x) <div className="ship-blocks p6"></div></div>
             <div className="ship-item">Navio de Guerra (2x) <div className="ship-blocks p4"></div></div>
             <div className="ship-item">Encouraçado (1x) <div className="ship-blocks p3"></div></div>
             <div className="ship-item">Submarino (1x) <div className="ship-blocks p1"></div></div>
           </div>
         </div>
       </footer>
    </div>
  );
}