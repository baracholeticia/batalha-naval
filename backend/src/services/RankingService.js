export default class RankingService {
  constructor(playerRepo) {
    this.playerRepo = playerRepo;
  }

  gerarRanking() {
    const players = this.playerRepo.getAll();

    const ranking = players.map(p => {
      return {
        login: p.login,
        nome: p.nome,
        vitorias: p.estatisticas.vitorias,
        partidas: p.estatisticas.partidas,
        taxaVitoria: p.estatisticas.taxaVitoria
      };
    });

    ranking.sort((a, b) => {
      if (b.vitorias !== a.vitorias) {
        return b.vitorias - a.vitorias; 
      }
      return b.taxaVitoria - a.taxaVitoria;
    });

    ranking.forEach((jogador, index) => {
        jogador.posicao = index + 1;
    });

    return ranking;
  }
}