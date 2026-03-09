import Player from '../game/Player.js';

export default class BaseAI extends Player {
    constructor(id, name, difficulty) {
        super(id, name, 'computer');
        this.difficulty = difficulty;
        this.lastHits = []; //memória para focar os ataques
    }

    //cada ia vai implementar o seu
    getBestMove(opponentBoard) {
        throw new Error("O método getBestMove deve ser implementado pelas subclasses.");
    }

    _getAvailableMoves(opponentBoard) {
        const moves = [];
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (!opponentBoard.attacks.includes(`${r},${c}`)) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }

    registerAttackResult(row, col, resultStatus, shipSunk) {
        if (resultStatus === 'hit') {
            this.lastHits.push({ row, col });
        } else if (resultStatus === 'sunk') {
            this.lastHits = []; // esquece os acertos antigos se já afundou o alvo
        }
    }
}