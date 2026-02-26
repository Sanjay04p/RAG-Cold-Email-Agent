import { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';
import ProspectDetail from './components/ProspectDetail';
import AuthPage from './components/AuthPage';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prospects, setProspects] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState('dashboard');
  const [prospectToDelete, setProspectToDelete] = useState(null); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  // Check login status on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch prospects if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/api/v1/prospects/')
        .then(response => setProspects(response.data))
        .catch(error => {
          console.error("Error fetching prospects:", error);
          if (error.response && error.response.status === 401) {
            handleLogout();
          }
        });
    }
  }, [refreshTrigger, isAuthenticated]);

  const handleLeadAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setProspects([]);
    setCurrentView('dashboard');
  };

  // --- DELETE MODAL LOGIC ---
  const initiateDelete = (e, prospectId) => {
    e.stopPropagation();
    setProspectToDelete(prospectId);
  };

  const cancelDelete = () => setProspectToDelete(null);

  const confirmDelete = async () => {
    if (!prospectToDelete) return;
    try {
      await axios.delete(`/api/v1/prospects/${prospectToDelete}`);
      setRefreshTrigger(prev => prev + 1);
      if (currentView === prospectToDelete) setCurrentView('dashboard');
    } catch (error) {
      alert("Failed to delete the prospect.");
    } finally {
      setProspectToDelete(null); 
    }
  };

  // --- RENDER ---
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const selectedProspect = prospects.find(p => p.id === currentView);
  // const location = useLocation();
  return (
    <div className="app-layout">
      
      {/* LEFT SIDEBAR (Hidden on Mobile via CSS) */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ color: 'var(--primary)', margin: '0' }}>AutoPitch AI</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '12px' }}>SDR Agent Workspace</p>
        </div>

        <div className="sidebar-menu" style={{ flex: 1, overflowY: 'auto' }}>
          <div className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            📊 Analytics Dashboard
          </div>
          <div className={`sidebar-item ${currentView === 'add_lead' ? 'active' : ''}`} onClick={() => setCurrentView('add_lead')}>
            ➕ Add New Lead
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', margin: '16px 0 4px 10px', textTransform: 'uppercase' }}>
            Your Prospects
          </p>

          {prospects.map(prospect => (
            <div key={prospect.id} className={`sidebar-item ${currentView === prospect.id ? 'active' : ''}`} onClick={() => setCurrentView(prospect.id)}>
              <div>
                <strong>{prospect.first_name} {prospect.last_name}</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prospect.company_name}</div>
              </div>
              <button className="delete-btn" onClick={(e) => initiateDelete(e, prospect.id)} title="Delete Prospect">🗑️</button>
            </div>
          ))}
        </div>

        {/* LOGOUT BUTTON */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>


          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Built by <a 
              href="https://sanjay04p.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
            >
              Sanjay Pattanashetti
            </a>
          </div>


          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#dc2626', border: '1px solid #fee2e2' }} 
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>


          <div className="mobile-top-header">
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>
          AutoPitch AI
        </div>
        <a 
          href="https://sanjay04p.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', textDecoration: 'none', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px' }}
        >
          by Sanjay P.
        </a>
      </div>


      {/* RIGHT WORKSPACE */}
      <div className="main-workspace">
        {currentView === 'dashboard' && <Dashboard key={refreshTrigger} />}
        {currentView === 'add_lead' && <LeadForm onLeadAdded={handleLeadAdded} />}
        {currentView === 'chat_list' && (
          <div className="chat-list-container">
            <div className="chat-list-header">Chats</div>
            {prospects.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                No prospects yet. Tap 'Add Lead' to start!
              </div>
            ) : (
              prospects.map(prospect => (
                <div 
                  key={prospect.id} 
                  className="chat-list-item"
                  onClick={() => setCurrentView(prospect.id)}
                >
                  <div className="chat-avatar">
                    {/* Grabs the first letter of first and last name for the avatar */}
                    {prospect.first_name.charAt(0)}{prospect.last_name ? prospect.last_name.charAt(0) : ''}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{prospect.first_name} {prospect.last_name}</div>
                    <div className="chat-company">{prospect.company_name}</div>
                  </div>

                <button 
                    className="delete-btn mobile-delete-btn" 
                    onClick={(e) => {
                      e.stopPropagation(); // Crucial: Stops the row from opening the chat when you tap delete!
                      initiateDelete(e, prospect.id);
                    }} 
                    title="Delete Prospect"
                  >
                    🗑️
                  </button>

                </div>

                
              ))
            )}
          </div>
        )}
        {typeof currentView === 'number' && selectedProspect && (
          <ProspectDetail 
            key={selectedProspect.id} 
            prospect={selectedProspect} 
            onProspectUpdated={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
      </div>

      {/* DELETE MODAL */}
      {prospectToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete prospect?</h3>
            <p className="modal-text">This will delete the prospect's details and all AI email history.</p>
            <div className="modal-actions">
              <button className="btn-text" onClick={cancelDelete}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
      

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-text">Are you sure you want to log out of your session?</p>
            <div className="modal-actions">
              <button className="btn-text" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button 
                className="btn-danger" 
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout(); // This calls your existing logout logic!
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}


      {/* NEW: MOBILE BOTTOM NAV (Fixed State Logic) */}
      <div className="mobile-bottom-nav">
        <div 
          className={`nav-item ${(currentView !== 'dashboard' && currentView !== 'add_lead') ? 'active' : ''}`} 
          onClick={() => setCurrentView('chat_list')}
        >
          <span className="nav-icon">💬</span>
          <span>Chats</span>
        </div>
        
        <div 
          className={`nav-item ${currentView === 'add_lead' ? 'active' : ''}`} 
          onClick={() => setCurrentView('add_lead')}
        >
          <span className="nav-icon">➕</span>
          <span>Add Lead</span>
        </div>

        <div 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span>Stats</span>
        </div>
        <div 
          className="nav-item" 
          onClick={() => setShowLogoutModal(true)}
        >
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>


        
      </div>


    </div> 
  );
}

export default App;