import { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';
import ProspectDetail from './components/ProspectDetail';

function App() {
  const [prospects, setProspects] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Navigation State: can be 'dashboard', 'add_lead', or a specific prospect ID
  const [currentView, setCurrentView] = useState('dashboard');

  // Fetch all leads for the sidebar
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/prospects/')
      .then(response => setProspects(response.data))
      .catch(error => console.error("Error fetching prospects:", error));
  }, [refreshTrigger]);

  const handleLeadAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('dashboard'); // Go back to dashboard after saving
  };

  // Helper to figure out which prospect object is currently selected
  const selectedProspect = prospects.find(p => p.id === currentView);

  return (
    <div className="app-layout">
      
      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ color: 'var(--primary)', margin: '0' }}>AutoPitch AI</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '12px' }}>SDR Agent Workspace</p>
        </div>

        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Analytics Dashboard
          </div>
          <div 
            className={`sidebar-item ${currentView === 'add_lead' ? 'active' : ''}`}
            onClick={() => setCurrentView('add_lead')}
          >
            ➕ Add New Lead
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', margin: '16px 0 4px 10px', textTransform: 'uppercase' }}>
            Your Prospects
          </p>

          {/* List of Leads */}
          {prospects.map(prospect => (
            <div 
              key={prospect.id}
              className={`sidebar-item ${currentView === prospect.id ? 'active' : ''}`}
              onClick={() => setCurrentView(prospect.id)}
            >
              <strong>{prospect.first_name} {prospect.last_name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prospect.company_name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className="main-workspace">
        {currentView === 'dashboard' && <Dashboard key={refreshTrigger} />}
        
        {currentView === 'add_lead' && <LeadForm onLeadAdded={handleLeadAdded} />}
        
        {/* If the current view is a Number (an ID), show the detail component */}
        {typeof currentView === 'number' && selectedProspect && (
          <ProspectDetail key={selectedProspect.id} prospect={selectedProspect} />
        )}
      </div>

    </div>
  );
}

export default App;