import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmailGenerator({ refreshTrigger }) {
  const [prospects, setProspects] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // Tracks which button is loading
  const [results, setResults] = useState({}); // Stores the generated emails

  // Fetch prospects when the component loads, OR when a new lead is added
  useEffect(() => {
    fetchProspects();
  }, [refreshTrigger]);

  const fetchProspects = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/prospects/');
      setProspects(response.data);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    }
  };

  // The function that triggers your massive AI backend pipeline!
  const handleGenerate = async (prospectId) => {
    setLoadingId(prospectId);
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/research/${prospectId}/generate`);
      
      // Save the result in our state so it shows up on screen
      setResults(prev => ({
        ...prev,
        [prospectId]: response.data
      }));
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate. Check your FastAPI console for errors.");
    }
    setLoadingId(null);
  };

  return (
    <div className="card">
      <h2>🤖 AI Generation Hub</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Select a prospect to run the RAG pipeline (Scrape &rarr; Vectorize &rarr; Gemini).
      </p>

      {prospects.length === 0 ? (
        <p>No prospects found. Add one above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {prospects.map((prospect) => (
            <div key={prospect.id} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{prospect.first_name} {prospect.last_name}</strong> - {prospect.company_name}
                  <br/>
                  <small style={{ color: 'var(--text-muted)' }}>{prospect.company_website}</small>
                </div>
                
                <button 
                  className="btn" 
                  onClick={() => handleGenerate(prospect.id)}
                  disabled={loadingId === prospect.id}
                >
                  {loadingId === prospect.id ? "Scraping & Thinking..." : "Generate AI Email"}
                </button>
              </div>

              {/* If we have a result for this prospect, display the generated email! */}
              {results[prospect.id] && (
                <div style={{ marginTop: '16px', background: 'var(--bg-color)', padding: '16px', borderRadius: '6px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Context Retrieved from Pinecone:
                  </p>
                  <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '12px', color: 'var(--text-muted)' }}>
                    "{results[prospect.id].rag_context_used}"
                  </p>
                  
                  <p style={{ fontSize: '12px', color: 'green', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Gemini 2.5 Flash Draft:
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
                    {results[prospect.id].generated_line}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}