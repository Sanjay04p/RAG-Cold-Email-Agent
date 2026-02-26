import { useState, useEffect } from 'react';
import axios from 'axios';
export default function EmailGenerator({ refreshTrigger }) {
  const [prospects, setProspects] = useState([]);
  const [loadingId, setLoadingId] = useState(null); 
  const [results, setResults] = useState({}); 
  
  // NEW: State to hold the text while the user edits it
  const [editableEmails, setEditableEmails] = useState({});
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchProspects();
  }, [refreshTrigger]);

  const fetchProspects = async () => { /* ... existing fetch code ... */ 
    try {
      const response = await axios.get('/api/v1/prospects/');
      setProspects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async (prospectId) => {
    setLoadingId(prospectId);
    try {
      const response = await axios.post(`/api/v1/research/${prospectId}/generate`);
      setResults(prev => ({ ...prev, [prospectId]: response.data }));
      
      // NEW: When AI finishes, put the text into our editable state, adding a generic sign-off
      const draftBody = `${response.data.generated_line}\n\nI'd love to connect and share some ideas.\n\nBest,\nSanjay`;
      setEditableEmails(prev => ({ ...prev, [prospectId]: draftBody }));
      
    } catch (error) {
      alert("Failed to generate.");
    }
    setLoadingId(null);
  };

  // NEW: Function to actually send the edited email
  const handleSend = async (prospect, emailLogId) => {
    setSendingId(prospect.id);
    try {
      await axios.post(`/api/v1/research/send/${emailLogId}`, {
        subject: `Quick question regarding ${prospect.company_name}`,
        edited_body: editableEmails[prospect.id]
      });
      alert("Email Sent Successfully!");
      // Optionally, remove the prospect from the list or mark as sent in UI
    } catch (error) {
      alert("Failed to send email. Check SMTP settings.");
    }
    setSendingId(null);
  };

  return (
    <div className="card">
      <h2>🤖 AI Generation Hub</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {prospects.map((prospect) => (
          <div key={prospect.id} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>{prospect.first_name} {prospect.last_name}</strong> - {prospect.company_name}</div>
              <button className="btn" onClick={() => handleGenerate(prospect.id)} disabled={loadingId === prospect.id}>
                {loadingId === prospect.id ? "Thinking..." : "Generate Draft"}
              </button>
            </div>

            {/* NEW: The Editable Text Area and Send Button */}
            {results[prospect.id] && editableEmails[prospect.id] !== undefined && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Edit your draft before sending:</p>
                
                <textarea 
                  style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                  value={editableEmails[prospect.id]}
                  onChange={(e) => setEditableEmails({ ...editableEmails, [prospect.id]: e.target.value })}
                />
                
                <button 
                  style={{ alignSelf: 'flex-end', backgroundColor: 'green' }} 
                  className="btn" 
                  onClick={() => handleSend(prospect, results[prospect.id].email_log_id)}
                  disabled={sendingId === prospect.id}
                >
                  {sendingId === prospect.id ? "Sending..." : "🚀 Send Email"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}