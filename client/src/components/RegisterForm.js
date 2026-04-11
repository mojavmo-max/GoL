import { useState } from 'react';
import { register } from '../api/api';

export default function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(email, password);
      if (response.error) {
        setError(response.error);
      } else {
        alert('Registration successful! Please log in.');
        setEmail('');
        setPassword('');
        setError('');
      }
    } catch (err) {
      setError('An error occurred during registration.');
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
