import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  const authMethodLabel = user?.googleId ? 'Google SSO' : 'email and password';
  const messageTone = message.toLowerCase().includes('successful') || message.toLowerCase().includes('signed in')
    ? 'success'
    : 'default';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const authError = params.get('error');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      params.delete('token');
      setMessage('Signed in with Google SSO.');
    }

    if (authError === 'sso_failed') {
      setMessage('Google SSO could not complete. Please try again.');
      params.delete('error');
    }

    if (tokenFromUrl || authError) {
      const nextUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }

    fetchUser();

    const syncAuth = () => {
      fetchUser();
    };

    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          return;
        }

        localStorage.removeItem('token');
      }
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    try {
      await fetch('/logout');
    } catch (error) {
      // Ignore errors
    }
    window.location.href = '/';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setMessage(data.message || data.msg);
      if (data.token) {
        localStorage.setItem('token', data.token);
        setMessage('Login successful!');
        await fetchUser(); // Fetch user data after login
      }
    } catch (error) {
      setMessage('Error occurred');
    }
  };

  return (
    <main className="AppShell">
      <section className="HeroPanel">
        <p className="Eyebrow">Secure Access Portal</p>
        <h1>Sign in once and move through your workspace without friction.</h1>
        <p className="HeroCopy">
          Email login and Google SSO are both supported, so your auth flow can stay simple
          while the app stays connected across tabs.
        </p>
        <div className="FeatureList">
          <div className="FeatureCard">
            <span className="FeatureLabel">Fast access</span>
            <strong>JWT-powered sessions</strong>
          </div>
          <div className="FeatureCard">
            <span className="FeatureLabel">Team-ready</span>
            <strong>Google SSO available</strong>
          </div>
          <div className="FeatureCard">
            <span className="FeatureLabel">Live state</span>
            <strong>Tabs stay in sync</strong>
          </div>
        </div>
      </section>

      <section className="AuthCard">
        {user ? (
          <div className="WelcomePanel">
            <div className="StatusBadge">Authenticated</div>
            <h2>Welcome, {user.displayName || user.name}!</h2>
            <p className="WelcomeText">
              You are signed in with {authMethodLabel}.
            </p>

            <div className="ProfileGrid">
              <div className="ProfileItem">
                <span className="ProfileLabel">Email</span>
                <strong>{user.emails ? user.emails[0].value : user.email}</strong>
              </div>
              <div className="ProfileItem">
                <span className="ProfileLabel">Access mode</span>
                <strong>{authMethodLabel}</strong>
              </div>
            </div>

            <button className="PrimaryButton" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="AuthPanel">
            <div className="AuthHeader">
              <p className="SectionLabel">{isLogin ? 'Welcome back' : 'Create account'}</p>
              <h2>{isLogin ? 'Sign in to continue' : 'Create your account'}</h2>
              <p className="SectionCopy">
                {isLogin
                  ? 'Use email and password, or continue with Google SSO.'
                  : 'Register with email first, or choose Google for quick access.'}
              </p>
            </div>

            <form className="AuthForm" onSubmit={handleSubmit}>
              {!isLogin && (
                <label className="InputGroup">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Aarav Mehta"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
              )}

              <label className="InputGroup">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="InputGroup">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <button className="PrimaryButton" type="submit">
                {isLogin ? 'Login' : 'Register'}
              </button>
            </form>

            <div className="Divider">
              <span>or</span>
            </div>

            <button className="SecondaryButton" onClick={handleGoogleLogin}>
              Continue with Google SSO
            </button>

            {message && (
              <p className={`MessageBanner ${messageTone}`}>{message}</p>
            )}

            <button className="TextButton" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
