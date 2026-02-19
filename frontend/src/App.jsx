import { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';
import ProspectDetail from './components/ProspectDetail';
import AuthPage from './components/AuthPage'; // 1. Import the Auth Page

// --- THE MAGICAL AXIOS INTERCEPTOR ---
// This automatically attaches your JWT token to EVERY single API request
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
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Normal App State
  const [prospects, setProspects] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState('dashboard');
  const [prospectToDelete, setProspectToDelete] = useState(null); 

  // Check if the user is already logged in when they refresh the page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch prospects (Only runs if authenticated!)
  useEffect(() => {
    if (isAuthenticated) {
      axios.get('http://127.0.0.1:8000/api/v1/prospects/')
        .then(response => setProspects(response.data))
        .catch(error => {
          console.error("Error fetching prospects:", error);
          // If the token is expired/invalid, log them out
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
    localStorage.removeItem('token'); // Destroy the passkey
    setIsAuthenticated(false);        // Kick them back to the Auth Screen
    setProspects([]);                 // Clear memory
    setCurrentView('dashboard');
  };

  // --- DELETE LOGIC ---
  const initiateDelete = (e, prospectId) => {
    e.stopPropagation();
    setProspectToDelete(prospectId);
  };

  const cancelDelete = () => setProspectToDelete(null);

  const confirmDelete = async () => {
    if (!prospectToDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/prospects/${prospectToDelete}`);
      setRefreshTrigger(prev => prev + 1);
      if (currentView === prospectToDelete) setCurrentView('dashboard');
    } catch (error) {
      alert("Failed to delete the prospect.");
    } finally {
      setProspectToDelete(null); 
    }
  };

  // --- RENDER THE APP ---

  // 1. If not logged in, ONLY show the Auth Page
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 2. If logged in, show the full SaaS Dashboard
  const selectedProspect = prospects.find(p => p.id === currentView);

  return (
    <div className="app-layout">
      
      {/* LEFT SIDEBAR */}
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="sidebar-header">
          <h2 style={{ color: 'var(--primary)', margin: '0' }}>AutoPitch AI</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '12px' }}>SDR Agent Workspace</p>
        </div>

        <div className="sidebar-menu" style={{ flex: 1 }}>
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

        {/* LOGOUT BUTTON AT THE BOTTOM */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#dc2626', border: '1px solid #fee2e2' }} 
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className="main-workspace">
        {currentView === 'dashboard' && <Dashboard key={refreshTrigger} />}
        {currentView === 'add_lead' && <LeadForm onLeadAdded={handleLeadAdded} />}
        {typeof currentView === 'number' && selectedProspect && (
          <ProspectDetail 
            key={selectedProspect.id} 
            prospect={selectedProspect} 
            onProspectUpdated={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
      </div>

      {/* CUSTOM DELETE MODAL */}
      {prospectToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete prospect?</h3>
            <p className="modal-text">This will delete the prospect's details and AI email history.</p>
            <div className="modal-actions">
              <button className="btn-text" onClick={cancelDelete}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
      
    </div> 
  );
}

export default App;