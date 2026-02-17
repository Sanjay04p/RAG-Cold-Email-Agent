import { useState } from 'react';
import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';
import EmailGenerator from './components/EmailGenerator'; // 1. Import it

function App() {
  // We use this state simply to tell the EmailGenerator to re-fetch the database
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeadAdded = (newLead) => {
    console.log("New lead added:", newLead);
    // Change the number to trigger the useEffect in EmailGenerator and Dashboard
    setRefreshTrigger(prev => prev + 1); 
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary)', margin: '0' }}>AutoPitch AI</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>RAG-powered outbound sales engine</p>
      </header>

      {/* Pass the refresh trigger to Dashboard so stats update instantly */}
      <Dashboard key={refreshTrigger} /> 
      
      <LeadForm onLeadAdded={handleLeadAdded} />
      
      {/* 2. Add the Generator component here */}
      <EmailGenerator refreshTrigger={refreshTrigger} />
      
    </div>
  );
}

export default App;