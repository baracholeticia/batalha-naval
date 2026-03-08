class RewardService {
  constructor(playerRepo) {
    this.playerRepo = playerRepo;
    this.acertosSeguidos = {};
  }

  registrarJogada(playerId, result) {
    if (result.status === 'hit' || result.status === 'sunk') {
      this.acertosSeguidos[playerId] =
        (this.acertosSeguidos[playerId] || 0) + 1;

      if (this.acertosSeguidos[playerId] === 7) {
        this._concederPorId(playerId, 'Capitão');
      }

      if (this.acertosSeguidos[playerId] === 8) {
        this._concederPorId(playerId, 'Capitão de Mar e Guerra');
      }
    } else {
      this.acertosSeguidos[playerId] = 0;
    }
  }

  verificarFimDeJogo(winner, inicioPartida) {
    const duracao = Date.now() - inicioPartida;
    if (duracao <= 5 * 60 * 1000) {
      this._conceder(winner.login, 'Marinheiro');
    }

    const perdeuNavio = winner.board.ships.some(s => s.isSunk());
    if (!perdeuNavio) {
      this._conceder(winner.login, 'Almirante');
    }

    delete this.acertosSeguidos[winner.id];
  }

  _conceder(login, medalha) {
    const player = this.playerRepo.findByLogin(login);
    if (!player) return;

    if (!player.medalhas.includes(medalha)) {
      player.medalhas.push(medalha);
      this.playerRepo.update(player);
    }
  }

  _concederPorId(playerId, medalha) {
    const player = this.playerRepo.getAll().find(p => p.id === playerId);
    if (player) {
      this._conceder(player.login, medalha);
    }
  }
}

module.exports = RewardService;