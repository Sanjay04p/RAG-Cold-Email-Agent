import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Flame, UserPlus } from 'lucide-react';

export default function AuthPage({ onLoginSuccess, onBack }) {
  // Toggle between Login and Signup modes
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const formData = new URLSearchParams();
        formData.append('username', email); // FastAPI OAuth2 expects 'username'
        formData.append('password', password);

        const response = await axios.post('/api/v1/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        localStorage.setItem('token', response.data.access_token);
        window.location.hash = ''; // Clear the URL hash
        onLoginSuccess(); 
      } else {
        // --- SIGNUP FLOW ---
        await axios.post('/api/v1/auth/signup', { 
          email: email, 
          password: password 
        });
        
        alert("Account created successfully! Please log in.");
        setIsLogin(true); // Switch UI back to login screen
        setPassword('');  // Clear the password field for security
      }
    } catch (err) {
      console.error("Auth failed:", err);
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      {/* LEFT COLUMN: Auth Form */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper animate-slide-up">
          
          <button 
            onClick={onBack} 
            style={{ background: 'none', border: 'none', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '32px', fontSize: '14px', fontWeight: '500', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          {/* LOGO ELEMENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="logo-icon-wrapper">
              <Flame size={24} color="white" />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>ColdReach AI</span>
          </div>

          <h1 className="auth-title delay-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="auth-subtitle delay-1">
            {isLogin ? "Sign in to access your portal and tools" : "Join today to start automating your outbound sales"}
          </p>

          {error && (
            <div className="delay-1" style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form delay-2 animate-slide-up">
            <div className="input-group">
              <label>Email address</label>
              <input 
                type="email" 
                placeholder="you@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isLogin ? "Enter your password" : "Create a secure password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="form-actions">
                <label className="checkbox-label">
                  <input type="checkbox" disabled={loading} /> Keep me signed in
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: isLogin ? '0' : '16px' }}>
              {loading ? "Processing..." : (isLogin ? "Sign in" : "Create account")}
              {!loading && (isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />)}
            </button>
          </form>

          {/* TOGGLE LOGIN / SIGNUP */}
          <div className="divider delay-3 animate-slide-up" style={{ marginTop: '24px' }}>
            <span>or</span>
          </div>

          <div className="delay-3 animate-slide-up" style={{ textAlign: 'center', marginTop: '24px', fontSize: '15px', color: '#4b5563' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
              }} 
              style={{ background: 'none', border: 'none', color: '#f97316', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
          
        </div>
      </div>

      {/* RIGHT COLUMN GRAPHIC */}
      <div className="auth-graphic-section">
        <div className="graphic-card animate-float animate-glow">
          <h2>Your AI-powered<br/>tool stack starts here</h2>
          <p>Connect your tools, unify your data, and<br/>deploy AI agents in weeks.</p>
        </div>
      </div>
    </div>
  );
}