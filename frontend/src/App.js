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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      params.delete('token');
      const nextUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }

    fetchUser();
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
      }
      // Fallback to session check
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
      // If 401, user is not logged in, do nothing
    } catch (error) {
      // Handle network errors if needed
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    try {
      await fetch('/logout', { credentials: 'include' });
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
    <div className="App">
      {user ? (
        <div>
          <h1>Welcome, {user.displayName || user.name}!</h1>
          <p>Email: {user.emails ? user.emails[0].value : user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
          <h1>{isLogin ? 'Login' : 'Register'}</h1>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <button onClick={handleGoogleLogin}>Login with Google</button>
          <p>{message}</p>
          <button onClick={() => setIsLogin(!isLogin)}>
            Switch to {isLogin ? 'Register' : 'Login'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
