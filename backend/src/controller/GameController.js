import { gameService } from '../index.js'; 

export default class GameController {
    
    static startGame(req, res) {
        try {
            const { mode, gameMode, aiLevel, loginPlayer1, loginPlayer2 } = req.body;

            const result = gameService.createGame(mode, gameMode, aiLevel, loginPlayer1, loginPlayer2);
            
            return res.status(201).json({
                message: "jogo iniciado",
                gameId: result.gameId,
                gameState: result.gameState
            });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static getState(req, res) {
        try {
            const { id } = req.params;
            const state = gameService.getGameState(id);
            
            return res.status(200).json(state);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    static async attack(req, res) {
        try {
            const { id } = req.params;
            const { row, col } = req.body; 

            if (row === undefined || col === undefined) {
                return res.status(400).json({ error: "Linha (row) e Coluna (col) são obrigatórios." });
            }
            const result = await gameService.processAttack(id, row, col); 
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}