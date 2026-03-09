import express from 'express';
import cors from 'cors';

// 1. IMPORTANDO SUAS CLASSES
import FileStorage from './persistence/FileStorage.js';
import PlayerRepository from './persistence/PlayerRepository.js';
import GameService from './services/GameService.js';
import RankingService from './services/RankingService.js';
import RewardService from './services/RewardService.js';

// 2. INICIALIZANDO OS SERVIÇOS
const storage = new FileStorage('./src/data/players.json');
const playerRepo = new PlayerRepository(storage);
const gameService = new GameService(playerRepo);
const rankingService = new RankingService(playerRepo);
const rewardService = new RewardService(playerRepo);

// 3. CONFIGURANDO O SERVIDOR EXPRESS
const app = express();
app.use(cors());
app.use(express.json());

// --- ROTAS DE AUTENTICAÇÃO E PERFIL ---
app.post('/api/register', (req, res) => {
    const { nome, login, senha } = req.body;
    try {
        const novo = playerRepo.create(login, nome, senha);
        res.status(201).json({ message: "Registrado com sucesso!", user: novo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/login', (req, res) => {
    const { login, senha } = req.body;
    try {
        const user = playerRepo.authenticate(login, senha);
        res.status(200).json({ message: "Logado!", user, token: "token-ficticio-123" });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// 🛠️ A ROTA DE EDITAR PERFIL QUE ESTAVA FALTANDO AQUI!
app.put('/api/profile', (req, res) => {
    const { currentLogin, novoNome, novoLogin, novaSenha } = req.body;
    try {
        const players = playerRepo.getAll();
        const index = players.findIndex(p => p.login === currentLogin);
        
        if (index === -1) throw new Error("Jogador não encontrado no banco de dados.");

        if (novoLogin !== currentLogin && players.some(p => p.login === novoLogin)) {
             throw new Error("Este username já está sendo usado.");
        }

        players[index].nome = novoNome || players[index].nome;
        players[index].login = novoLogin || players[index].login;
        if (novaSenha) players[index].senha = novaSenha;

        playerRepo.saveAll(players);

        const { senha: _, ...updatedUser } = players[index];
        res.status(200).json({ message: "Perfil atualizado!", user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/user/:login', (req, res) => {
    try {
        const user = playerRepo.findByLogin(req.params.login);
        if (!user) throw new Error("Usuário não encontrado");
        
        const { senha: _, ...safeUser } = user;
        res.status(200).json(safeUser);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


// --- ROTAS DE JOGO ---
app.post('/api/game/start', (req, res) => {
    const { mode, gameMode, aiLevel, loginPlayer1, ships } = req.body;
    try {
        const result = gameService.createGame(mode, gameMode, aiLevel, loginPlayer1, "Computer");
        const gameId = result.gameId;
        const gameEngine = gameService.activeGames.get(gameId);

        ships.forEach(s => {
            gameEngine.placeShipForCurrentPlayer(s.size, s.row, s.col, s.orientation);
        });
        
        gameEngine.confirmSetupForCurrentPlayer();

        res.status(201).json({ gameId, gameState: gameEngine.getPublicState() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/game/:id', (req, res) => {
    try {
        const state = gameService.getGameState(req.params.id);
        res.status(200).json(state);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.post('/api/game/:id/attack', (req, res) => {
    const { row, col } = req.body;
    try {
        const result = gameService.processAttack(req.params.id, row, col);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/game/:id/move', (req, res) => {
    const { shipId, direction } = req.body;
    try {
        const gameEngine = gameService.activeGames.get(req.params.id);
        if (!gameEngine) throw new Error("Partida não encontrada");
        
        const result = gameEngine.moveShip(shipId, direction);
        
        if (!result.success) throw new Error(result.detail || result.reason);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/ranking', (req, res) => {
    try {
        const ranking = rankingService.gerarRanking();
        res.status(200).json(ranking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. LIGANDO O SERVIDOR 
app.listen(3000);