import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const WeChatLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [demoName, setDemoName] = useState('');

  const handleDemoAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: demoEmail,
              wechat_name: demoName || 'Demo User',
            });

          if (profileError) throw profileError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });

        if (signInError) throw signInError;
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>PPAP Master</h1>
        <p style={styles.subtitle}>Production Part Approval Process Tracking</p>

        <div style={styles.wechatSection}>
          <div style={styles.wechatIcon}>微信</div>
          <h2 style={styles.wechatTitle}>WeChat Login</h2>
          <p style={styles.wechatNote}>
            WeChat OAuth integration requires configuration:
          </p>
          <ol style={styles.setupList}>
            <li>Register at WeChat Open Platform</li>
            <li>Create a web application</li>
            <li>Configure OAuth callback URL</li>
            <li>Obtain AppID and AppSecret</li>
            <li>Implement OAuth flow via Edge Function</li>
          </ol>
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Demo Login</span>
        </div>

        <form onSubmit={handleDemoAuth} style={styles.form}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Name"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              style={styles.input}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={demoEmail}
            onChange={(e) => setDemoEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={demoPassword}
            onChange={(e) => setDemoPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={styles.toggleButton}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    margin: '0 0 8px 0',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: '14px',
    textAlign: 'center',
    color: '#718096',
    margin: '0 0 32px 0',
  },
  wechatSection: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '2px solid #e2e8f0',
  },
  wechatIcon: {
    width: '64px',
    height: '64px',
    background: '#09B83E',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: 'white',
    fontSize: '24px',
    fontWeight: '700',
  },
  wechatTitle: {
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center',
    margin: '0 0 12px 0',
    color: '#2d3748',
  },
  wechatNote: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '12px',
  },
  setupList: {
    fontSize: '13px',
    color: '#718096',
    paddingLeft: '20px',
    margin: '0',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '24px 0',
  },
  dividerText: {
    background: 'white',
    padding: '0 12px',
    color: '#a0aec0',
    fontSize: '14px',
    position: 'relative',
    zIndex: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  toggleButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#667eea',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    padding: '8px',
    background: '#fff5f5',
    borderRadius: '6px',
    border: '1px solid #feb2b2',
  },
};
