import { Rocket, Target, Zap, Bot, ArrowRight, CheckCircle2, Flame } from 'lucide-react';

export default function LandingPage({ onNavigateToLogin }) {
  return (
    <div className="landing-container">
      
      {/* NAVBAR */}
      {/* NAVBAR */}
      <nav className="landing-nav animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' }}>
        
        {/* LEFT SIDE: Logo & Title */}
        <div className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
          <div className="logo-icon-wrapper" style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }}>
            <Flame size={18} color="white" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span style={{ 
              fontSize: 'clamp(15px, 4vw, 20px)', /* Scales down slightly on very small phones */
              fontWeight: '800', 
              whiteSpace: 'nowrap' 
            }}>
              AutoPitch AI
            </span>
            <span style={{ 
              fontSize: '10px', 
              backgroundColor: '#ffedd5', 
              color: '#c2410c', 
              padding: '2px 6px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              letterSpacing: '0.5px',
              flexShrink: 0
            }}>
              BETA
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Buttons */}
        <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button 
            className="nav-login-btn" 
            onClick={onNavigateToLogin}
            style={{ whiteSpace: 'nowrap', padding: '8px 12px' }}
          >
            Sign In
          </button>
          <button 
            className="nav-cta-btn" 
            onClick={onNavigateToLogin}
            style={{ whiteSpace: 'nowrap', padding: '8px 12px' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero-section">
        <div className="hero-badge animate-slide-up delay-1">Next-Gen SDR Automation</div>
        <h1 className="hero-title animate-slide-up delay-2">
          Scale your outbound.<br/>
          <span className="text-gradient">Without scaling your team.</span>
        </h1>
        <p className="hero-subtitle animate-slide-up delay-3">
          ColdReach AI acts as your autonomous SDR. By scraping websites and LinkedIn profiles in real-time, our engine drafts hyper-personalized emails 100x faster—slashing your customer acquisition costs.
        </p>
        <div className="hero-actions animate-slide-up delay-4">
          <button className="primary-btn" onClick={onNavigateToLogin}>
            Start Prospecting Free <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* VALUE PROPOSITION GRID */}
      <section className="features-section">
        <div className="section-header animate-slide-up">
          <h2>Why ColdReach AI drives better results</h2>
          <p>Stop sending generic spam. Start starting conversations.</p>
        </div>
        
        <div className="feature-grid">
          <div className="feature-card animate-slide-up delay-1">
            <div className="feature-icon"><Rocket size={24} /></div>
            <h3>100x Faster Workflow</h3>
            <p>Eliminate the 10-minute manual research process. Just paste a URL, and our AI reads the prospect's entire digital footprint in 3 seconds.</p>
          </div>
          <div className="feature-card animate-slide-up delay-2">
            <div className="feature-icon"><Target size={24} /></div>
            <h3>Hyper-Targeted Hooks</h3>
            <p>Using Google Dorking and RAG, we match a prospect's exact LinkedIn background to your product's specific value propositions.</p>
          </div>
          <div className="feature-card animate-slide-up delay-3">
            <div className="feature-icon"><Bot size={24} /></div>
            <h3>Zero Infrastructure Costs</h3>
            <p>Bypass expensive SMTP setups and cloud port blocks. Our Gmail Web Intents send directly from your browser, guaranteeing 100% deliverability.</p>
          </div>
        </div>
      </section>

      {/* WORKFLOW INTEGRATION */}
      <section className="workflow-section">
        <div className="workflow-content animate-slide-up">
          <h2>Seamless Business Integration</h2>
          <p className="workflow-desc">Designed to slide perfectly into your existing sales motion. No complex onboarding required.</p>
          
          <ul className="workflow-steps">
            <li><CheckCircle2 color="#3b82f6" size={24} /> <div><strong>1. Feed the Engine</strong><span>Add your product's value props to the Pinecone Vector DB once.</span></div></li>
            <li><CheckCircle2 color="#3b82f6" size={24} /> <div><strong>2. Drop a Lead</strong><span>Input a company website or LinkedIn URL into the sleek dashboard.</span></div></li>
            <li><CheckCircle2 color="#3b82f6" size={24} /> <div><strong>3. Review & Send</strong><span>Approve the AI-generated draft and execute delivery instantly.</span></div></li>
          </ul>
        </div>
        
        {/* Animated Visual */}
        <div className="workflow-visual animate-slide-up delay-2">
           <div className="abstract-ui animate-float">
              <div className="ui-header"></div>
              <div className="ui-body">
                <div className="ui-line skeleton-short"></div>
                <div className="ui-line skeleton-long"></div>
                <div className="ui-line skeleton-long"></div>
                <div className="ui-button" style={{background: '#3b82f6'}}>Generate AI Pitch ✨</div>
              </div>
           </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 ColdReach AI. Engineered for modern sales teams.</p>
      </footer>
    </div>
  );
}