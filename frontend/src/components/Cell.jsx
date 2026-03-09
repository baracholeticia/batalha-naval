import Ship from './Ship';
import './Cell.css';

export default function Cell({ state = 'empty', onClick, isAnimating }) {


  const [baseState, ...extraClassesArr] = state.split(' ');
  const extraClasses = extraClassesArr.join(' ');  
  const [type, part] = baseState.split('-');
  
  const isShip = type === 'myship' || type === 'hit' || type === 'sunk';

  let shipStatus = 'intact';
  if (type === 'hit') shipStatus = 'hit';
  if (type === 'sunk') shipStatus = 'sunk';

  const displayPart = type === 'hit' ? 'unknown' : (part || 'single');

  const cssClass = type === 'oppship' ? 'empty' : type;

  return (
    <div className={`cell ${cssClass} ${extraClasses}`} onClick={onClick}>
      {isShip && <Ship part={displayPart} status={shipStatus} />}
      {isAnimating && <div className="explosion-effect"></div>}
    </div>
  );
}