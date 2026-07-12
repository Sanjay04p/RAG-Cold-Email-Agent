import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Flame } from 'lucide-react';

export default function AuthPage({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Simulate login for now
    onLoginSuccess();
  };

  return (
    <div className="auth-container">
      {/* LEFT COLUMN: Login Form */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper animate-slide-up">
          
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '32px', fontSize: '14px', fontWeight: '500', padding: 0 }}>
            <ArrowLeft size={16} /> Back to home
          </button>

          {/* NEW LOGO ELEMENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="logo-icon-wrapper">
              <Flame size={24} color="white" />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>ColdReach</span>
          </div>

          <h1 className="auth-title delay-1">Welcome back</h1>
          <p className="auth-subtitle delay-1">Sign in to access your portal and tools</p>

          <form onSubmit={handleSubmit} className="auth-form delay-2 animate-slide-up">
            <div className="input-group">
              <label>Email address</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <label className="checkbox-label"><input type="checkbox" /> Keep me signed in</label>
              {/* <a href="#" className="forgot-password">Forgot password?</a> */}
            </div>

            <button type="submit" className="submit-btn">
              Sign in <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN GRAPHIC (Now Animated) */}
      <div className="auth-graphic-section">
        <div className="graphic-card animate-float animate-glow">
          <h2>Your AI-powered<br/>tool stack starts here</h2>
          <p>Connect your tools, unify your data, and<br/>deploy AI agents in weeks.</p>
        </div>
      </div>
    </div>
  );
}