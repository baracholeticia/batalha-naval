import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profileImg from '../assets/profile.png'; 
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  // Estado para controlar se o menu lateral está aberto ou fechado
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Função para alternar o menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="game-header">
        {/* Ícone de Menu Hambúrguer (agora tem onClick) */}
        <button className="hamburger-btn" onClick={toggleMenu} title="Menu Principal">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>

        <h2 className="header-title">Batalha Naval</h2>

        <button className="profile-btn" onClick={() => navigate('/profile')} title="Editar Perfil">
          <img src={profileImg} alt="Perfil" className="profile-img" />
        </button>
      </header>

      {/* --- MENU LATERAL (SIDEBAR) --- */}
      
      {/* 1. O fundo escuro que clica para fechar */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
      ></div>

      {/* 2. O painel do menu que desliza */}
      <aside className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Opções</h3>
          <button className="close-btn" onClick={toggleMenu}>✕</button>
        </div>
        
        <nav className="sidebar-nav">
          {/* Botão de Ranking */}
          <button 
            onClick={() => navigate('/ranking')} // Futuramente pode criar uma página Ranking.jsx
            className="drawn-btn yellow-btn"
          >
            Ranking de Jogadores
          </button>
          
          {/* Botão de Menu */}
          <button 
            onClick={() => navigate('/home')} 
            className="drawn-btn blue-btn"
          >
            Menu Principal
          </button>
          
          {/* Botão de Deslogar */}
          <button 
            onClick={() => navigate('/login')} 
            className="drawn-btn red-btn"
          >
            Deslogar
          </button>
        </nav>
      </aside>
    </>
  );
}