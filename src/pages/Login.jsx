import { useState } from 'react';
import { authService } from '../services/auth';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await authService.login(email, password);
      } else {
        result = await authService.register(email, password, username);
      }

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>ChatHub</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required={!isLogin}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? 'Loading...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={styles.toggleButton}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#1e1f25',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#2a2d34',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#5865f2',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#b5bac1',
    fontSize: '14px',
  },
  form: {
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#dbdee1',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#1e1f25',
    border: '1px solid #404249',
    borderRadius: '4px',
    color: '#ececf1',
    fontSize: '14px',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: '10px',
    marginTop: '16px',
    background: '#5865f2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    color: '#f04747',
    fontSize: '13px',
    marginTop: '12px',
    padding: '8px 12px',
    background: 'rgba(240, 71, 71, 0.1)',
    borderRadius: '4px',
    border: '1px solid rgba(240, 71, 71, 0.3)',
  },
  footer: {
    textAlign: 'center',
    borderTop: '1px solid #404249',
    paddingTop: '16px',
  },
  toggleText: {
    color: '#b5bac1',
    fontSize: '13px',
    margin: 0,
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#5865f2',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    padding: 0,
  },
};
