import AdvancedAI from '../../../src/ai/AdvancedAI.js';

describe('Testes da AdvancedAI', () => {
    let ai;
    let mockBoardView;
    let mockOpponentBoard;

    beforeEach(() => {
        ai = new AdvancedAI('cpu-3', 'Almirante');

        mockBoardView = Array(10).fill(null).map(() => Array(10).fill('WATER'));

        mockOpponentBoard = {
            attacks: [],
            ships: [
                { size: 5, isSunk: () => false }, // Porta-aviões
                { size: 4, isSunk: () => false }, // Encouraçado
                { size: 3, isSunk: () => false }  // Cruzador
            ],

            getBoardView: () => mockBoardView
        };
    });

    test('Modo Caça (Paridade): Deve priorizar o padrão de tabuleiro de xadrez no início', () => {
        const move = ai.getBestMove(mockOpponentBoard);

        expect(move).toHaveProperty('row');
        expect(move).toHaveProperty('col');

        
        const isParitySquare = (move.row + move.col) % 2 === 0;
        expect(isParitySquare).toBe(true);
    });

    test('Modo Alvo: Deve focar agressivamente em células adjacentes a um HIT', () => {
        mockOpponentBoard.attacks.push('5,5');
        mockBoardView[5][5] = 'HIT';

        const move = ai.getBestMove(mockOpponentBoard);

        // Por causa do peso multiplicador de 500x, a próxima jogada deve 
        // obrigatoriamente estar na mesma linha ou coluna do HIT.
        // Os alvos mais prováveis serão as cruzes diretas (4,5), (6,5), (5,4) ou (5,6)
        const isAdjacent = 
            (move.row === 4 && move.col === 5) || 
            (move.row === 6 && move.col === 5) || 
            (move.row === 5 && move.col === 4) || 
            (move.row === 5 && move.col === 6);

        expect(isAdjacent).toBe(true);
    });

    test('Modo Alinhamento: Deve atirar nas pontas se encontrar dois HITs seguidos', () => {
        // Simulamos acertos em (5,5) e (5,6) - um navio na horizontal
        mockOpponentBoard.attacks.push('5,5');
        mockOpponentBoard.attacks.push('5,6');
        mockBoardView[5][5] = 'HIT';
        mockBoardView[5][6] = 'HIT';

        const move = ai.getBestMove(mockOpponentBoard);

        // O peso será de 250.000x na linha 5. A IA DEVE atirar nas pontas conhecidas:
        // ou em (5,4) à esquerda, ou em (5,7) à direita.
        const isFollowingLine = 
            (move.row === 5 && move.col === 4) || 
            (move.row === 5 && move.col === 7);

        expect(isFollowingLine).toBe(true);
    });

    test('Reset de Caça: Deve ignorar navios SUNK e voltar a atirar em mar aberto', () => {
        // Simulamos um Cruzador (tamanho 3) afundado
        mockOpponentBoard.attacks.push('2,2', '2,3', '2,4');
        mockBoardView[2][2] = 'SUNK';
        mockBoardView[2][3] = 'SUNK';
        mockBoardView[2][4] = 'SUNK';

        // Atualizamos a lista de navios para dizer que um de tamanho 3 afundou
        mockOpponentBoard.ships[2].isSunk = () => true;

        const move = ai.getBestMove(mockOpponentBoard);

        // A IA não deve tentar atirar nas pontas (2,1) ou (2,5) porque o navio já afundou.
        // Ela deve ignorar essa linha e atirar num lugar que faça sentido matemático global.
        const isShootingAtDeadEnds = 
            (move.row === 2 && move.col === 1) || 
            (move.row === 2 && move.col === 5);

        expect(isShootingAtDeadEnds).toBe(false);
    });

    test('Fim de Jogo: Deve retornar null se o tabuleiro estiver completamente cheio', () => {
        // Preenche o tabuleiro inteiro com 'MISS'
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