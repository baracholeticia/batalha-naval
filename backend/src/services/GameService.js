import GameEngine from '../game/GameEngine.js';
import CampaignManager from '../game/CampaingManager.js';
import { randomUUID } from 'crypto';

export default class GameService {
    constructor(playerRepo) {
        this.playerRepo = playerRepo; 
        this.activeGames = new Map(); 
        this.campaignManagers = new Map();
    }

    createGame(mode = 'IA', gameMode = 'classic', aiLevel = 1, loginPlayer1, loginPlayer2) {
        const gameId = randomUUID();
        let engine = new GameEngine({ mode, gameMode });
        
        engine.loginPlayer1 = loginPlayer1;
        engine.loginPlayer2 = loginPlayer2;

        this.activeGames.set(gameId, engine);

        if (mode === 'IA') {
            const humanPlayer = engine.players[0];
            const campaign = new CampaignManager(humanPlayer, { mode, gameMode });
            campaign.currentLevel = aiLevel - 1; 
            const campaignResult = campaign.startCurrentLevel();
            engine = campaignResult.engine;
            engine.mode = mode;
            this.campaignManagers.set(gameId, campaign);
        }

        engine.loginPlayer1 = loginPlayer1;
        engine.loginPlayer2 = mode === 'IA' ? 'Computer' : loginPlayer2;

        this.activeGames.set(gameId, engine);
        return { gameId, gameState: engine.getPublicState() };
    }

    getGameState(gameId) {
        const game = this.activeGames.get(gameId);
        if (!game) throw new Error("Partida não encontrada!");
        return game.getPublicState();
    }

    // 1. Não se esqueça de adicionar o 'async' antes do nome da função!
    async processAttack(gameId, row, col) {
        const game = this.activeGames.get(gameId);
        if (!game) throw new Error("Partida não encontrada!");

        const humanResult = game.attack(row, col);

        if (game.mode === 'IA' && game.state === 'playing') {
            const campaign = this.campaignManagers.get(gameId);
            if (campaign) {
                while (game.state === 'playing' && game.getCurrentPlayer().type === 'computer') {

                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                    
                    campaign.playComputerTurn(); 
                }
            }
        }

        if (game.state === 'game_over') {
            this._lidarComFimDeJogo(game);
        } 

        return {
            humanAttack: humanResult,
            gameState: game.getPublicState()
        };
    }

    _lidarComFimDeJogo(game) {
      // Trava de segurança: Garante que só vai salvar a vitória UMA vez por partida
      if (game.gameOverProcessed) return;
      game.gameOverProcessed = true;

      const vencedorIndex = game.currentPlayerIndex;
      const perdedorIndex = 1 - game.currentPlayerIndex;

      const loginVencedor = vencedorIndex === 0 ? game.loginPlayer1 : game.loginPlayer2;
      const loginPerdedor = perdedorIndex === 0 ? game.loginPlayer1 : game.loginPlayer2;

      console.log(`\n🏆 FIM DE JOGO! Vencedor: ${loginVencedor} | Perdedor: ${loginPerdedor}`);

      this.finalizarPartida(loginVencedor, loginPerdedor);
  }

  finalizarPartida(loginVencedor, loginPerdedor) {
      const vencedor = this.playerRepo.findByLogin(loginVencedor);
      const perdedor = this.playerRepo.findByLogin(loginPerdedor);

      // Salva a vitória se o vencedor for um humano cadastrado
      if (vencedor) {
          vencedor.estatisticas.partidas++;
          vencedor.estatisticas.vitorias++;
          this._calcularTaxas(vencedor);
          this.playerRepo.update(vencedor);
          console.log(`📈 Estatísticas salvas com sucesso para: ${vencedor.login}`);
      }

      // Salva a derrota se o perdedor for um humano cadastrado
      if (perdedor) {
          perdedor.estatisticas.partidas++;
          perdedor.estatisticas.derrotas++;
          this._calcularTaxas(perdedor);
          this.playerRepo.update(perdedor);
          console.log(`📉 Estatísticas de derrota salvas para: ${perdedor.login}`);
      }
  }

  _calcularTaxas(player) {
    const total = player.estatisticas.partidas;

    player.estatisticas.taxaVitoria =
      total > 0 ? player.estatisticas.vitorias / total : 0;

    player.estatisticas.taxaDerrota =
      total > 0 ? player.estatisticas.derrotas / total : 0;
  }
}