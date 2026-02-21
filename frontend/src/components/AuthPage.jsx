import { useState } from 'react';
import axios from 'axios';

export default function AuthPage({ onLoginSuccess }) {
  // Toggles between 'login' and 'signup' modes
  const [isLogin, setIsLogin] = useState(true); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        // FastAPI's OAuth2 specifically requires data to be sent as form-urlencoded, not standard JSON
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects the key to be 'username'
        formData.append('password', password);

        const response = await axios.post('/api/v1/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Save the encrypted passkey to the browser's local storage!
        localStorage.setItem('token', response.data.access_token);
        
        // Tell the main App that we are officially logged in
        onLoginSuccess(); 

      } else {
        // --- SIGNUP FLOW ---
        // Signup uses standard JSON
        await axios.post('/api/v1/auth/signup', { 
          email: email, 
          password: password 
        });
        
        alert("Account created successfully! Please log in.");
        setIsLogin(true); // Switch the UI back to the login screen
        setPassword('');  // Clear the password field for security
      }
    } catch (error) {
      // Show the specific error message from our FastAPI backend (e.g., "Email already registered")
      alert(error.response?.data?.detail || "Authentication failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '400px', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--primary)', margin: '0 0 8px 0' }}>AutoPitch AI</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {isLogin ? "Welcome back. Log in to your workspace." : "Create your account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '10px', padding: '12px' }} disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
        
      </div>
    </div>
  );
}