import { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { authService } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#1e1f25',
          color: '#b5bac1',
          fontSize: '14px',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <Dashboard user={user} onLogout={() => setUser(null)} />
  );
}

export default App;
