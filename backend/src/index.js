const GameEngine = require('./game/GameEngine');

const FileStorage = require('./persistence/FileStorage');
const PlayerRepository = require('./persistence/PlayerRepository');

const GameService = require('./services/GameService');
const RankingService = require('./services/RankingService');
const RewardService = require('./services/RewardService');

const storage = new FileStorage('data/players.json');
const playerRepo = new PlayerRepository(storage);

const gameService = new GameService(playerRepo);
const rankingService = new RankingService(playerRepo);
const rewardService = new RewardService(playerRepo);

let inicioPartida = Date.now();

const engine = new GameEngine({
  callbacks: {

    onMoveResult: ({ playerId, result }) => {
      rewardService.registrarJogada(playerId, result);
    },

    onGameOver: ({ winner }) => {

      const loser = engine.players.find(p => p.id !== winner.id);

      if (!loser) return;

      gameService.finalizarPartida(winner.login, loser.login);

      rewardService.verificarFimDeJogo(winner, inicioPartida);

      inicioPartida = Date.now();
    }
  }
});

module.exports = {
  engine,
  rankingService,
  playerRepo
};