import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import hidden from '../assets/hidden.png'
import visible from '../assets/visible.png'

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, senha: password }) 
      });
      
      if (!response.ok) throw new Error('Credenciais inválidas');
      
      const data = await response.json();
      localStorage.setItem('loggedUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      navigate('/home'); 
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Batalha Naval</h1>
        <p className="auth-subtitle">Acesse sua conta para jogar</p>
        
        <form onSubmit={handleLogin} className="auth-form">
          
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Digite seu username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Senha</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha" 
                value={password} // Conectando ao estado
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ width: '100%', paddingRight: '40px' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <img src={hidden} alt=" " className="hidden" /> : <img src={visible} alt=" " className="visible" />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="auth-submit-btn blue">
            Entrar no Jogo
          </button>
        </form>

        <div className="auth-footer">
          <span>Não tem conta?</span>
          <button type="button" onClick={() => navigate('/register')} className="switch-page-btn">
            Registre-se aqui
          </button>
        </div>
      </div>
    </main>
  );
}