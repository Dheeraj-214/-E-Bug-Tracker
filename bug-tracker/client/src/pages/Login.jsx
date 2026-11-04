import { useState } from 'react';
import api from '../api';

export default function Login({ onAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(isRegister ? '/auth/register' : '/auth/login', form);
      onAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="auth-box">
      <h2>🐞 Bug Tracker</h2>
      <h3>{isRegister ? 'Create account' : 'Login'}</h3>
      <form onSubmit={submit}>
        {isRegister && <input name="name" placeholder="Name" onChange={change} required />}
        <input name="email" type="email" placeholder="Email" onChange={change} required />
        <input name="password" type="password" placeholder="Password" onChange={change} required />
        {error && <p className="error">{error}</p>}
        <button>{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p className="link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'New here? Register'}
      </p>
    </div>
  );
}