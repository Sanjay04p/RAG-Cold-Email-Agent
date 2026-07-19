import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Flame, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';

export default function AuthPage({ onLoginSuccess, onBack }) {
  // Toggle between Login and Signup modes
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isWakingServer, setIsWakingServer] = useState(false);
  const [loadingText, setLoadingText] = useState("Authenticating...");

  // Cycles through messages while the server wakes up
  useEffect(() => {
    let timeout1, timeout2, timeout3, timeout4;
    
    if (isWakingServer) {
      setLoadingText("Authenticating...");
      
      timeout1 = setTimeout(() => {
        setLoadingText("Waking up the server...");
      }, 4000);
      
      timeout2 = setTimeout(() => {
        setLoadingText("Warming up the AutoPitch AI engine...");
      }, 20000);
      
      timeout3 = setTimeout(() => {
        setLoadingText("Preparing your SDR Workspace...");
      }, 35000);
      
      timeout4 = setTimeout(() => {
        setLoadingText("Almost there, finalizing connection...");
      }, 45000);
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [isWakingServer]);


  

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);
    setError('');
    setIsWakingServer(true);

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
        setIsWakingServer(false);
      }
    } catch (err) {
      console.error("Auth failed:", err);
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
      setIsWakingServer(false);
    }
    
    // setLoading(false);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>AutoPitch AI</span>
              {/* NEW BETA TAG */}
              <span style={{ fontSize: '11px', backgroundColor: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                BETA
              </span>
            </div>
          </div>

          {/* CONDITIONAL RENDERING STARTS HERE */}
          {isWakingServer ? (
            <div className="loading-screen animate-slide-up" style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <Loader2 size={48} color="var(--primary)" className="animate-spin-slow" />
              </div>
              
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                Connecting to AutoPitch Engine
              </h3>
              
              <p style={{ fontSize: '14px', color: '#64748b', minHeight: '42px', transition: 'all 0.3s' }}>
                {loadingText}
              </p>

              {/* 50-Second Progress Bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginTop: '24px', overflow: 'hidden' }}>
                <div className="progress-fill"></div>
              </div>
            </div>
          ) : (
            <>
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
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder={isLogin ? "Enter your password" : "Create a password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="form-actions">
                    <label className="checkbox-label">
                      <input type="checkbox" /> Keep me signed in
                    </label>
                    {/* <a href="#" className="forgot-password">Forgot password?</a> */}
                  </div>
                )}

                <button type="submit" className="submit-btn" style={{ marginTop: isLogin ? '0' : '16px' }}>
                  {isLogin ? "Sign in" : "Create account"}
                  {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
                </button>
              </form>

              {/* NEW WARNING MESSAGE (Only shows on Signup) */}
              {!isLogin && (
                <div className="delay-2 animate-slide-up" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px', padding: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#b45309', fontSize: '13px', lineHeight: '1.5' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <strong>Heads up!</strong> Please store your password safely. The automated password reset feature is currently under active development.
                  </div>
                </div>
              )}

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
            </>
          )}
          
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