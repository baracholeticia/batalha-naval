import Ship from './Ship';
import './Cell.css';

export default function Cell({ state = 'empty', onClick, isAnimating }) {

  const [type, part] = state.split('-');
  
  const isShip = type === 'myship' || type === 'hit' || type === 'sunk';

  let shipStatus = 'intact';
  if (type === 'hit') shipStatus = 'hit';
  if (type === 'sunk') shipStatus = 'sunk';

  const displayPart = type === 'hit' ? 'unknown' : (part || 'single');

  const cssClass = type === 'oppship' ? 'empty' : type;

  return (
    <div className={`cell ${cssClass}`} onClick={onClick}>
      {isShip && <Ship part={displayPart} status={shipStatus} />}
      {isAnimating && <div className="explosion-effect"></div>}
    </div>
  );
}