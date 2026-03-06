import BaseAI from './BaseAI.js';

export default class IntermediateAI extends BaseAI {
    constructor() {
        super("intermediate-ai");
    }

    getBestMove(opponentBoard) {
        const availableMoves = this._getAvailableMoves(opponentBoard);
        if (availableMoves.length === 0) return null;
        const boardView = opponentBoard.getBoardView(true);
        const possibleTargets = this._getAdjacentTargetsFromBoard(boardView);

        if (possibleTargets.length > 0) {
            const randomIndex = Math.floor(Math.random() * possibleTargets.length);
            return possibleTargets[randomIndex];
        }

        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    _getAdjacentTargetsFromBoard(boardView) {
        const targets = [];
        const directions = [
            {r: -1, c: 0}, 
            {r: 1, c: 0},  
            {r: 0, c: -1}, 
            {r: 0, c: 1}   
        ];

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (boardView[r][c] === 'HIT') {
                    for (const dir of directions) {
                        const checkRow = r + dir.r;
                        const checkCol = c + dir.c;

                        if (checkRow >= 0 && checkRow < 10 && checkCol >= 0 && checkCol < 10) {
                            if (boardView[checkRow][checkCol] === 'WATER') {
                                const alreadyAdded = targets.some(t => t.row === checkRow && t.col === checkCol);
                                if (!alreadyAdded) {
                                    targets.push({ row: checkRow, col: checkCol });
                                }
                            }
                        }
                    }
                }
            }
        }

        return targets;
    }
}