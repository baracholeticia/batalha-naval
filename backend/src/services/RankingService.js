class RankingService {
  constructor(playerRepo) {
    this.playerRepo = playerRepo;
  }

  gerarRanking() {
    const players = this.playerRepo.getAll();

    return players
      .sort((a, b) => {
        if (b.estatisticas.taxaVitoria !== a.estatisticas.taxaVitoria) {
          return b.estatisticas.taxaVitoria - a.estatisticas.taxaVitoria;
        }
        return b.estatisticas.vitorias - a.estatisticas.vitorias;
      })
      .map((p, index) => ({
        posicao: index + 1,
        nome: p.nome,
        vitorias: p.estatisticas.vitorias,
        taxaVitoria: p.estatisticas.taxaVitoria
      }));
  }
}

module.exports = RankingService;