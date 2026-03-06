import BaseAI from './BaseAI.js';
    export default class AdvancedAI extends BaseAI {
        constructor() {
            super("advanced-ai");
        }
       
        getBestMove(opponentBoard) {
            const boardView = opponentBoard.getBoardView(true);
            
            //Descobre os tamanhos dos navios que o oponente AINDA tem vivos.
            const remainingShipsSizes = opponentBoard.ships
                .filter(ship => !ship.isSunk())
                .map(ship => ship.size);

            const availableMoves = this._getAvailableMoves(opponentBoard);
            if (availableMoves.length === 0) return null;

            // Cria o Mapa de Calor 
            const probabilityMap = Array(10).fill(null).map(() => Array(10).fill(0));

            //Calcula a probabilidade de cada célula baseada nos navios restantes
            for (const shipSize of remainingShipsSizes) {
                for (let r = 0; r < 10; r++) {
                    for (let c = 0; c <= 10 - shipSize; c++) {
                        if (this._isValidPlacement(boardView, r, c, shipSize, 'horizontal')) {
                            this._applyProbability(probabilityMap, boardView, r, c, shipSize, 'horizontal');
                        }
                    }
                }

                for (let r = 0; r <= 10 - shipSize; r++) {
                    for (let c = 0; c < 10; c++) {
                        if (shipSize === 1) continue; 
                        
                        if (this._isValidPlacement(boardView, r, c, shipSize, 'vertical')) {
                            this._applyProbability(probabilityMap, boardView, r, c, shipSize, 'vertical');
                        }
                    }
                }
            }

            //Encontra a célula com a maior probabilidade
            let maxProb = -1;
            let bestMoves = [];

            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    // A IA só pode disparar na "água" que ainda não explorou
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

            // Sorteia entre os melhores alvos se houver empate 
            if (bestMoves.length > 0) {
                const randomIndex = Math.floor(Math.random() * bestMoves.length);
                return bestMoves[randomIndex];
            }

            //Volta a ser aleatória se o mapa quebrar
            const fallbackIndex = Math.floor(Math.random() * availableMoves.length);
            return availableMoves[fallbackIndex];
        }

        // Heurísticas

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

        _applyProbability(probMap, boardView, row, col, size, orientation) {
            let hitCount = 0;
            
            // Quantos acertos ('HIT') essa posição simulada cruzou?
            for (let i = 0; i < size; i++) {
                const r = orientation === 'vertical' ? row + i : row;
                const c = orientation === 'horizontal' ? col + i : col;
                if (boardView[r][c] === 'HIT') {
                    hitCount++;
                }
            }

            let weight = 1;
            
            if (hitCount > 0) {
                // Se cruzou um acerto recente, o peso é multiplicado drasticamente!
                weight = Math.pow(500, hitCount); 
            }

            // Distribui o peso cálculado nas células que ainda são 'WATER' nessa linha
            for (let i = 0; i < size; i++) {
                const r = orientation === 'vertical' ? row + i : row;
                const c = orientation === 'horizontal' ? col + i : col;
                
                if (boardView[r][c] === 'WATER') {
                    let finalWeight = weight;
                    // regra do "Tabuleiro de Xadrez"
                    if (weight === 1 && (r + c) % 2 === 0) {
                        finalWeight += 0.5;
                    }

                    probMap[r][c] += finalWeight;
                }
            }
        }
    }
    
