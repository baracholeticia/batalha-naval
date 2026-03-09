import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Rules.css';
import classic from '../assets/anchor.png';
import dynamic from '../assets/wave.png';
import campaign from '../assets/helm.png';

export default function Rules() {
  const { mode } = useParams();
  const navigate = useNavigate();

  const rulesContent = {
    campanha: {
      title: "Modo Campanha",
      icon: <img src={campaign} alt=" " className="campaign" />,
      description: "Vença as três versões de IA disponíveis no jogo.",
      rules: [
        "A primeira batalha será contra a IA Básica (tiros aleatórios).",
        "A segunda será contra a IA Intermediária (busca em torno de acertos).",
        "A última batalha será contra a IA Avançada (probabilidade por célula).",
        "Se você perder uma batalha, a campanha acaba!"
      ]
    },
    classico: {
      title: "Modo Clássico",
      icon: <img src={classic} alt=" " className="classic"/>,
      description: "O tradicional jogo de Batalha Naval.",
      rules: [
        "Cada jogador distribui seus navios em seu tabuleiro.",
        "Em turnos alternados, lance bombas para acertar os navios adversários.",
        "Acertou? Jogue novamente até errar!"
      ]
    },
    dinamico: {
      title: "Modo Dinâmico",
      icon: <img src={dynamic} alt=" " className="dynamic"/>,
      description: "O mar está agitado! As posições não são fixas.",
      rules: [
        "A regra base é a mesma do modo clássico.",
        "Cada jogador pode mover um navio para alguma direção antes de lançar a bomba.",
        "Use isso para fugir de ataques ou reposicionar seus navios estrategicamente!"
      ]
    }
  };

  const content = rulesContent[mode] || rulesContent.classico;

  return (
    <div className="rules-layout">
      <Header />
      <main className="rules-container">
        <div className="drawn-card rules-card">
          <div className="rules-header">
            <span className="rules-icon">{content.icon}</span>
            <h1>{content.title}</h1>
          </div>
          
          <p className="rules-desc">{content.description}</p>
          
          <ul className="rules-list">
            {content.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>

          <div className="rules-actions">
            <button className="drawn-btn white-btn" onClick={() => navigate('/home')}>Voltar</button>
            <button className="drawn-btn yellow-btn huge-btn" onClick={() => navigate(`/placement/${mode}`)}>
              Preparar Navios
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}