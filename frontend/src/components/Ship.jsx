// src/components/Ship.jsx
import './Ship.css';

export default function Ship({ part = 'single', status = 'intact' }) {
  // part: 'left', 'right', 'top', 'bottom', 'body', 'single'
  // status: 'intact' (preto), 'hit' (branco), 'sunk' (vermelho)
  return (
    <div className={`ship-shape ${part} ${status}`}></div>
  );
}