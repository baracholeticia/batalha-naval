import Cell from './Cell';
import './Board.css';

export default function Board({ isOpponent, cells, onCellClick }) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  return (
    <div className={`board-wrapper ${isOpponent ? 'red-theme' : 'blue-theme'}`}>
      <div className="board-header">
        <div className="corner-empty"></div>
        {numbers.map(num => <div key={num} className="coord-label">{num}</div>)}
      </div>
      <div className="board-body">
        <div className="board-sidebar">
          {letters.map(letter => <div key={letter} className="coord-label">{letter}</div>)}
        </div>
        <div className="board-grid">
          {/* O tabuleiro agora renderiza o array "cells" que vem de fora */}
          {cells.map((state, i) => (
            <Cell key={i} state={state} onClick={() => onCellClick && onCellClick(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}