import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
  
    const [playerName, setPlayerName] = useState('Carregando...');
    const [playerStats, setPlayerStats] = useState({ matches: 0, winRate: '0%', lossRate: '0%' });
    const [playerMedals, setPlayerMedals] = useState({
        almirante: false, capitaoGuerra: false, capitao: false, marinheiro: false
    });

    useEffect(() => {
        const userStr = localStorage.getItem('loggedUser');
        if (userStr) {
            const localUser = JSON.parse(userStr);

            fetch(`http://localhost:3000/api/user/${localUser.login}`)
                .then(res => res.json())
                .then(user => {
                    if (user.error) return; 

                    localStorage.setItem('loggedUser', JSON.stringify(user)); 
                    
                    setPlayerName(user.nome || user.login);

                    if (user.estatisticas) {
                        setPlayerStats({
                            matches: user.estatisticas.partidas || 0,
                            winRate: `${Math.round((user.estatisticas.taxaVitoria || 0) * 100)}%`,
                            lossRate: `${Math.round((user.estatisticas.taxaDerrota || 0) * 100)}%`
                        });
                    }

                    if (user.medalhas) {
                        setPlayerMedals({
                            almirante: user.medalhas.includes('Almirante'),
                            capitaoGuerra: user.medalhas.includes('Capitão de Mar e Guerra'),
                            capitao: user.medalhas.includes('Capitão'),
                            marinheiro: user.medalhas.includes('Marinheiro')
                        });
                    }
                })
                .catch(err => console.error("Erro ao atualizar dados:", err));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handlePlay = (modo, nivel) => {
        localStorage.setItem('aiLevel', nivel);
        navigate(`/rules/${modo}`);
    };

    return (
        <div className="home-layout">
        <Header />
        
        <main className="home-container">
            <div className="home-content">
            
            <section className="profile-section">
                
                <header className="welcome-header">
                <h1 className="welcome-title">Bem-vindo, <span>{playerName}</span>!</h1>
                </header>

                <div className="drawn-card stats-card">
                <h2>Estatísticas de Combate</h2>
                <div className="stats-grid">
                    <div className="stat-box">
                    <span className="stat-value">{playerStats.matches}</span>
                    <span className="stat-label">Partidas</span>
                    </div>
                    <div className="stat-box">
                    <span className="stat-value win">{playerStats.winRate}</span>
                    <span className="stat-label">Vitórias</span>
                    </div>
                    <div className="stat-box">
                    <span className="stat-value loss">{playerStats.lossRate}</span>
                    <span className="stat-label">Derrotas</span>
                    </div>
                </div>
                <button className="drawn-btn yellow-btn full-width" onClick={() => navigate('/ranking')}>
                    Ver Ranking Global
                </button>
                </div>

                <div className="drawn-card medals-card">
                <h2>Quadro de Medalhas</h2>
                <div className="medals-grid">
                    
                    <div className={`medal-item ${playerMedals.almirante ? 'earned' : 'locked'}`}>
                    <div className="info-wrapper">
                        <span className="medal-info">i</span>
                        <div className="info-popup">Vença sem perder navios.</div>
                    </div>
                    <span className="medal-icon">🎖️</span>
                    <span className="medal-name">Almirante</span>
                    </div>
                    
                    <div className={`medal-item ${playerMedals.capitaoGuerra ? 'earned' : 'locked'}`}>
                    <div className="info-wrapper">
                        <span className="medal-info">i</span>
                        <div className="info-popup">Acerte 8 tiros seguidos.</div>
                    </div>
                    <span className="medal-icon">⚓</span>
                    <span className="medal-name">Cap. de Guerra</span>
                    </div>
                    
                    <div className={`medal-item ${playerMedals.capitao ? 'earned' : 'locked'}`}>
                    <div className="info-wrapper">
                        <span className="medal-info">i</span>
                        <div className="info-popup">Acerte 7 tiros seguidos.</div>
                    </div>
                    <span className="medal-icon">⚔️</span>
                    <span className="medal-name">Capitão</span>
                    </div>
                    
                    <div className={`medal-item ${playerMedals.marinheiro ? 'earned' : 'locked'}`}>
                    <div className="info-wrapper">
                        <span className="medal-info">i</span>
                        <div className="info-popup">Vença em até 60 segundos.</div>
                    </div>
                    <span className="medal-icon">⏱️</span>
                    <span className="medal-name">Marinheiro</span>
                    </div>

                </div>
                </div>
            </section>

            <section className="play-section">
                <div className="drawn-card mode-card campaign">
                <h2>Modo Campanha</h2>
                <p>Enfrente 3 batalhas seguidas! Comece pela IA Básica e sobreviva até a Avançada.</p>
                
                <button className="drawn-btn blue-btn play-huge-btn" onClick={() => navigate('/rules/campanha')}>
                    Iniciar Campanha
                </button>
                </div>

                <div className="drawn-card mode-card">
                <h2>Modo Clássico</h2>
                <p>Batalha naval tradicional, afunde todos os navios inimigos.</p>
                <div className="ai-buttons-row">
                    <button className="drawn-btn pill-btn green-btn" onClick={() => handlePlay('classico', 1)}>Básica</button>
                    <button className="drawn-btn pill-btn yellow-btn" onClick={() => handlePlay('classico', 2)}>Média</button>
                    <button className="drawn-btn pill-btn red-btn" onClick={() => handlePlay('classico', 3)}>Difícil</button>
                </div>
                </div>

                <div className="drawn-card mode-card">
                <h2>Modo Dinâmico</h2>
                <p>Mova um navio em 1 casa por turno antes de atirar.</p>
                <div className="ai-buttons-row">
                    <button className="drawn-btn pill-btn green-btn" onClick={() => handlePlay('dinamico', 1)}>Básica</button>
                    <button className="drawn-btn pill-btn yellow-btn" onClick={() => handlePlay('dinamico', 2)}>Média</button>
                    <button className="drawn-btn pill-btn red-btn" onClick={() => handlePlay('dinamico', 3)}>Difícil</button>
                </div>
                </div>
            </section>

            </div>
        </main>
        </div>
    );
}