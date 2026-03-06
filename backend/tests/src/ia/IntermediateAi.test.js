import IntermediateAI from '../../../src/ai/IntermediateAI.js';

describe('Testes da IntermediateAI (Nova Arquitetura Visual)', () => {
    let ai;
    let mockBoardView;
    let mockOpponentBoard;

    beforeEach(() => {
        ai = new IntermediateAI('cpu-2', 'Capitão');
        mockBoardView = Array(10).fill(null).map(() => Array(10).fill('WATER'));
        mockOpponentBoard = {
            attacks: [], 
            getBoardView: () => mockBoardView 
        };
    });

    test('Modo Caça: Deve atirar aleatoriamente na água se não houver HITs visíveis', () => {
        const move = ai.getBestMove(mockOpponentBoard);

        expect(move).toHaveProperty('row');
        expect(move).toHaveProperty('col');
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(10);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(10);
    });

    test('Modo Alvo: Deve focar estritamente nos vizinhos ao ver um HIT no mapa', () => {
        mockBoardView[5][5] = 'HIT';
        mockOpponentBoard.attacks.push('5,5'); 

        const nextMove = ai.getBestMove(mockOpponentBoard);

        // As únicas opções válidas vizinhas da água são a cruz direta
        const isAdjacent = 
            (nextMove.row === 4 && nextMove.col === 5) || 
            (nextMove.row === 6 && nextMove.col === 5) || 
            (nextMove.row === 5 && nextMove.col === 4) || 
            (nextMove.row === 5 && nextMove.col === 6);   

        expect(isAdjacent).toBe(true);
    });

    test('Modo Alvo (Canto): Não deve tentar atirar fora do mapa se o HIT for na borda', () => {
        mockBoardView[0][0] = 'HIT';
        mockOpponentBoard.attacks.push('0,0');

        const nextMove = ai.getBestMove(mockOpponentBoard);

        const isAdjacentAndValid = 
            (nextMove.row === 0 && nextMove.col === 1) || 
            (nextMove.row === 1 && nextMove.col === 0);

        expect(isAdjacentAndValid).toBe(true);
    });

    test('Ignorar Afundados: Não deve focar em células ao redor de um navio SUNK', () => {
        mockBoardView[2][2] = 'SUNK';
        mockOpponentBoard.attacks.push('2,2');
        let foundNonAdjacent = false;
        
        for(let i = 0; i < 20; i++) {
            const move = ai.getBestMove(mockOpponentBoard);
            const isNeighbor = Math.abs(move.row - 2) + Math.abs(move.col - 2) === 1;

            if (!isNeighbor) {
                foundNonAdjacent = true;
                break; 
            }
        }

        expect(foundNonAdjacent).toBe(true);
    });

    test('Fim de Jogo: Deve retornar null se o tabuleiro estiver completamente explorado', () => {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                mockOpponentBoard.attacks.push(`${r},${c}`);
                mockBoardView[r][c] = 'MISS';
            }
        }

        const move = ai.getBestMove(mockOpponentBoard);
        
        expect(move).toBeNull();
    });
});