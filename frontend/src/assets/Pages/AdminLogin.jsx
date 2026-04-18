import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import './AdminLogin.css';

const AdminLogin = () => {
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@karyon.app').toLowerCase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.loginEmail(email, password);
      const normalizedEmail = String(data?.user?.email || email || '').toLowerCase();
      const isAdminByRole = data?.user?.role === 'admin';
      const isAdminByFlag = data?.user?.isAdmin === true;
      const isAdminByEmail = normalizedEmail === adminEmail;
      const isAdmin = isAdminByRole || isAdminByFlag || isAdminByEmail;

      const normalizedUser = {
        ...(data?.user || {}),
        email: normalizedEmail,
        role: isAdmin ? 'admin' : data?.user?.role,
        isAdmin
      };

      if (!isAdmin) {
        throw new Error('Only admin accounts can access this panel');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Unable to login as admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Panel Login</h1>
        <p>Sign in with an admin account to manage KaryON operations.</p>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@karyon.app"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <a href="/" className="admin-back-link">Back to Home</a>
      </div>
    </div>
  );
};

export default AdminLogin;
