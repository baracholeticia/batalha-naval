import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Game from './pages/Game';
import Rules from './pages/Rules';
import Placement from './pages/Placement';
import Ranking from './pages/Ranking';
import EditProfile from './pages/EditProfile';

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('loggedUser');
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/*rotas protegidas*/}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/ranking" element={<PrivateRoute><Ranking /></PrivateRoute>} />
        <Route path="/rules/:mode" element={<PrivateRoute><Rules /></PrivateRoute>} />
        <Route path="/placement/:mode" element={<PrivateRoute><Placement /></PrivateRoute>} />
        <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}