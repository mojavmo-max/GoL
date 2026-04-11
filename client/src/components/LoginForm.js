import { useState } from 'react';
import { login, getProfile } from '../api/api';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if (response.error) {
        setError(response.error);
      } else {
        // Fetch user profile and call onLogin to set user state and trigger navigation
        const profile = await getProfile(response.id);
        console.log('Login successful, user profile:', profile);
        onLogin({ ...response, ...profile });
        setEmail('');
        setPassword('');
        setError('');
      }
    } catch (err) {
      setError('An error occurred during login.');
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
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
      <button type="submit">Log In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
