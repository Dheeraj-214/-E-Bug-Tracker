import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const nav = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const onAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    nav('/');
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
    nav('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onAuth={onAuth} />} />
      <Route path="/" element={user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />} />
    </Routes>
  );
}