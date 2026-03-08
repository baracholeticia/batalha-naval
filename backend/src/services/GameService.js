class GameService {
  constructor(playerRepo) {
    this.playerRepo = playerRepo;
  }

  finalizarPartida(loginVencedor, loginPerdedor) {
    const vencedor = this.playerRepo.findByLogin(loginVencedor);
    const perdedor = this.playerRepo.findByLogin(loginPerdedor);

    if (!vencedor || !perdedor) return;

    vencedor.estatisticas.partidas++;
    vencedor.estatisticas.vitorias++;

    perdedor.estatisticas.partidas++;
    perdedor.estatisticas.derrotas++;

    this._calcularTaxas(vencedor);
    this._calcularTaxas(perdedor);

    this.playerRepo.update(vencedor);
    this.playerRepo.update(perdedor);
  }

  _calcularTaxas(player) {
    const total = player.estatisticas.partidas;

    player.estatisticas.taxaVitoria =
      total > 0 ? player.estatisticas.vitorias / total : 0;

    player.estatisticas.taxaDerrota =
      total > 0 ? player.estatisticas.derrotas / total : 0;
  }
}

module.exports = GameService;