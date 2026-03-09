import GameEngine from './GameEngine.js';
import BasicAI from '../ai/BasicAI.js';
import IntermediateAI from '../ai/IntermediateAI.js';
import AdvancedAI from '../ai/AdvancedAI.js';

export default class CampaignManager {
    constructor(humanPlayer, engineOptions = {}) {
        this.humanPlayer = humanPlayer;
        this.currentLevel = 0; //indice do array (começa no 0, que é o Nível 1)
        this.isCampaignCompleted = false;
        
        this.engineOptions = engineOptions; 

        this.levels = [
            { 
                levelNumber: 1, 
                title: "Recruta",
                description: "Tiros aleatórios.",
                createAI: () => new BasicAI(2, "Recruta (IA Básica)") 
            },
            { 
                levelNumber: 2, 
                title: "Capitão",
                description: "Busca ativa em torno de acertos. ",
                createAI: () => new IntermediateAI(2, "Capitão (IA Intermediária)") 
            },
            { 
                levelNumber: 3, 
                title: "Almirante",
                description: "Probabilidade avançada.",
                createAI: () => new AdvancedAI(2, "Almirante (IA Avançada)") 
            }
        ];
        
        this.currentAI = null;
        this.activeGame = null;
    }

    startCurrentLevel() {
        if(this.isCampaignCompleted) {
            throw new Error("Campanha já foi completada.");
        }

        const currentLevelInfo = this.levels[this.currentLevel];
        this.currentAI = currentLevelInfo.createAI(); 

        this.activeGame = new GameEngine({
            gameMode: this.engineOptions.gameMode || 'classic',
            callbacks: {
                ...this.engineOptions.callbacks,
                onGameOver: (payload) => this._handleGameOver(payload)
            }
        });

        this.humanPlayer.setBoard(this.activeGame.players[0].board);
        this.currentAI.setBoard(this.activeGame.players[1].board);

        this.activeGame.players[0] = this.humanPlayer;
        this.activeGame.players[1] = this.currentAI;

        this._autoPlaceAIShips();

        return {
            engine: this.activeGame,
            levelInfo: currentLevelInfo
        };
    }

    _handleGameOver(payload) {
        const { winner } = payload;

        if (this.engineOptions.callbacks?.onGameOver) {
            this.engineOptions.callbacks.onGameOver(payload);
        }

        //e o humano ganhou, proximo nivel
        if (winner.id === this.humanPlayer.id) {
            this.currentLevel++;
            
            //verifica se a campanha acabou
            if (this.currentLevel >= this.levels.length) {
                this.isCampaignCompleted = true;
                if (this.engineOptions.callbacks?.onCampaignWon) {
                    this.engineOptions.callbacks.onCampaignWon();
                }
            }
        }
    }

    _autoPlaceAIShips() {
        this.activeGame.currentPlayerIndex = 1; 

        const botId = this.currentAI.id;
        const shipsToPlace = [...this.activeGame.remainingToPlace[botId]];
        
        shipsToPlace.forEach(shipDef => {
            let placed = false;
            //testa colocar o navio em posições aleatórias até coneguir colocar todos
            while (!placed) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';

                const result = this.activeGame.placeShipForCurrentPlayer(shipDef.size, row, col, orientation);
                if (result.success) {
                    placed = true;
                }
            }
        });

        this.activeGame.confirmSetupForCurrentPlayer();
        this.activeGame.currentPlayerIndex = 0; 
    }

    playComputerTurn() {
        if (!this.activeGame || this.activeGame.state !== 'playing') return;
        
        const currentPlayer = this.activeGame.getCurrentPlayer();
        
        //garante que é realmente a vez da ia
        if (currentPlayer.type !== 'computer') return; 

        const opponentBoard = this.activeGame.getOpponentPlayer().board;
        
        //escolhe o melhor move pra ia atual
        const move = currentPlayer.getBestMove(opponentBoard);
        const attackResult = this.activeGame.attack(move.row, move.col);

        //feedbacks pra ia (média e avançada)
        const status = attackResult.result.status;
        const isSunk = attackResult.result.status === 'sunk';
        currentPlayer.registerAttackResult(move.row, move.col, status, isSunk);

        return attackResult;
    }
}