class PlayerRepository {
  constructor(storage) {
    this.storage = storage;
  }

  getAll() {
    return this.storage.read() || [];
  }

  saveAll(players) {
    this.storage.write(players);
  }

  findByLogin(login) {
    return this.getAll().find(p => p.login === login) || null;
  }

  create(login, nome) {
    const players = this.getAll();

    if (players.some(p => p.login === login)) {
      throw new Error('Login já existe');
    }

    const novo = {
      id: Date.now().toString(),
      login,
      nome,
      estatisticas: {
        partidas: 0,
        vitorias: 0,
        derrotas: 0,
        taxaVitoria: 0,
        taxaDerrota: 0
      },
      medalhas: []
    };

    players.push(novo);
    this.saveAll(players);
    return novo;
  }

  update(playerAtualizado) {
    const players = this.getAll();
    const index = players.findIndex(p => p.id === playerAtualizado.id);
    if (index !== -1) {
      players[index] = playerAtualizado;
      this.saveAll(players);
    }
  }
}

module.exports = PlayerRepository;