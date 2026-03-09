import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Auth.css'; 

export default function EditProfile() {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('loggedUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setName(user.nome || '');
      setUsername(user.login || '');
    } else {
      navigate('/login'); 
    }
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const userStr = localStorage.getItem('loggedUser');
    if (!userStr) return;
    const loggedUser = JSON.parse(userStr);

    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLogin: loggedUser.login,
          novoNome: name,
          novoLogin: username,
          novaSenha: password
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Erro ao atualizar o perfil');

      localStorage.setItem('loggedUser', JSON.stringify(data.user));
      
      alert('Perfil atualizado com sucesso!');
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="home-layout">
      <Header />
      <main className="auth-page" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="auth-card">
          <h1 className="auth-title">Editar Perfil</h1>
          <p className="auth-subtitle">Atualize seus dados de comandante</p>
          
          <form onSubmit={handleUpdate} className="auth-form">
            <div className="input-group">
              <label>Nome</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Seu nome" 
                required
              />
            </div>

            <div className="input-group">
              <label>Username (Login)</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Novo username" 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Nova Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Nova senha" 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="auth-submit-btn white-btn" onClick={() => navigate('/home')}>
                Cancelar
              </button>
              <button type="submit" className="auth-submit-btn blue-btn">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}