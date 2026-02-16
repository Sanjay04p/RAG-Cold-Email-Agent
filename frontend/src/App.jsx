import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';

function App() {
  
  // This function gets passed into the LeadForm. 
  // It runs whenever a new lead is successfully saved to the database.
  const handleLeadAdded = (newLead) => {
    console.log("New lead added with ID:", newLead.id);
    // Later, we will use this ID to trigger the AI Generator!
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary)', margin: '0' }}>Cold Email AI</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>RAG-powered outbound sales engine</p>
      </header>

      {/* Render our isolated components */}
      <Dashboard />
      <LeadForm onLeadAdded={handleLeadAdded} />
      
    </div>
  );
}

export default App;