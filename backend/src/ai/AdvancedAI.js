import BaseAI from './BaseAI.js';

export default class AdvancedAI extends BaseAI {
    constructor(id, name) {
        super(id, name, 'advanced');
    }

    getBestMove(opponentBoard) {
        const boardView = opponentBoard.getBoardView(true);
        
        const remainingShipsSizes = opponentBoard.ships
            .filter(ship => !ship.isSunk())
            .map(ship => ship.size);

        const availableMoves = this._getAvailableMoves(opponentBoard);
        if (availableMoves.length === 0) return null;

        const minShipSize = Math.min(...remainingShipsSizes);

        const probabilityMap = Array(10).fill(null).map(() => Array(10).fill(0));

        for (const shipSize of remainingShipsSizes) {
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c <= 10 - shipSize; c++) {
                    if (this._isValidPlacement(boardView, r, c, shipSize, 'horizontal')) {
                        this._applyProbability(probabilityMap, boardView, r, c, shipSize, 'horizontal', minShipSize);
                    }
                }
            }
            
            for (let r = 0; r <= 10 - shipSize; r++) {
                for (let c = 0; c < 10; c++) {
                    if (shipSize === 1) continue;
                    
                    if (this._isValidPlacement(boardView, r, c, shipSize, 'vertical')) {
                        this._applyProbability(probabilityMap, boardView, r, c, shipSize, 'vertical', minShipSize);
                    }
                }
            }
        }

        let maxProb = -1;
        let bestMoves = [];

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (boardView[r][c] === 'WATER') {
                    const cellProb = probabilityMap[r][c];
                    
                    if (cellProb > maxProb) {
                        maxProb = cellProb;
                        bestMoves = [{ row: r, col: c }];
                    } else if (cellProb === maxProb) {
                        bestMoves.push({ row: r, col: c });
                    }
                }
            }
        }

        if (bestMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * bestMoves.length);
            return bestMoves[randomIndex];
        }

        const fallbackIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[fallbackIndex];
    }

    _isValidPlacement(boardView, row, col, size, orientation) {
        for (let i = 0; i < size; i++) {
            const r = orientation === 'vertical' ? row + i : row;
            const c = orientation === 'horizontal' ? col + i : col;
            const cell = boardView[r][c];
            
            if (cell === 'SUNK' || cell === 'MISS') {
                return false;
            }
        }
        return true;
    }

    _applyProbability(probMap, boardView, row, col, size, orientation, minShipSize) {
        let hitCount = 0;
        
        for (let i = 0; i < size; i++) {
            const r = orientation === 'vertical' ? row + i : row;
            const c = orientation === 'horizontal' ? col + i : col;
            if (boardView[r][c] === 'HIT') {
                hitCount++;
            }
        }

        let weight = 1;
        
        if (hitCount > 0) {
            weight = Math.pow(500, hitCount); 
        }

        for (let i = 0; i < size; i++) {
            const r = orientation === 'vertical' ? row + i : row;
            const c = orientation === 'horizontal' ? col + i : col;
            
            if (boardView[r][c] === 'WATER') {
                let finalWeight = weight;
                
                if (weight === 1 && minShipSize > 1) {
                    if ((r + c) % 2 === 0) {
                        finalWeight += 0.5;
                    }
                }

                probMap[r][c] += finalWeight;
            }
        }
    }
}