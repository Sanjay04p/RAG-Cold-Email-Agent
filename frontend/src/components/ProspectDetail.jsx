import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProspectDetail({ prospect, onProspectUpdated }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [generatedData, setGeneratedData] = useState(null);
  const [editableBody, setEditableBody] = useState("");
  const [emailStatus, setEmailStatus] = useState("none"); // Tracks if it's a draft or already sent

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: prospect.first_name,
    last_name: prospect.last_name,
    email: prospect.email,
    company_name: prospect.company_name,
    company_website: prospect.company_website
  });

  // NEW: This runs every time the 'prospect.id' changes (when you click a new person)
  useEffect(() => {
    // 1. Clear the screen first so old data doesn't flash
    setGeneratedData(null);
    setEditableBody("");
    setEmailStatus("none");
    setIsEditing(false);
    setEditForm({...prospect}); // Reset the edit form to the new prospect's info

    // 2. Ask FastAPI if a draft already exists in the SQLite database
    axios.get(`http://127.0.0.1:8000/api/v1/research/${prospect.id}/drafts`)
      .then(response => {
        if (response.data.has_draft) {
          // Re-populate the screen with the saved database info!
          setGeneratedData({
            email_log_id: response.data.email_log_id,
            rag_context_used: "Loaded from database history.", 
            generated_line: response.data.personalized_opening
          });
          
          // If the email was previously edited/sent, show the full body. Otherwise, show the default template.
          const bodyText = response.data.full_body || `${response.data.personalized_opening}\n\nI'd love to connect and share some ideas.\n\nBest,\nSanjay`;
          setEditableBody(bodyText);
          setEmailStatus(response.data.status); // Will be 'draft' or 'sent'
        }
      })
      .catch(error => console.error("Error fetching existing drafts:", error));
  }, [prospect]);


  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/prospects/${prospect.id}`, editForm);
      setIsEditing(false);
      onProspectUpdated(); // Triggers the sidebar to refresh instantly
    } catch (error) {
      alert("Failed to update prospect. Check console.");
      console.error(error);
    }
  };

  // ... (Keep your existing handleGenerate function exactly the same) ...
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/research/${prospect.id}/generate`);
      setGeneratedData(response.data);
      setEditableBody(`${response.data.generated_line}\n\nI'd love to connect and share some ideas.\n\nBest,\nSanjay`);
      setEmailStatus("draft");
    } catch (error) {
      alert("Failed to generate AI email.");
      console.error(error);
    }
    setLoading(false);
  };

  // ... (Keep your existing handleSend function exactly the same, but update status on success) ...
  const handleSend = async () => {
    if (!generatedData) return;
    setSending(true);
    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/research/send/${generatedData.email_log_id}`, {
        subject: `Quick question regarding ${prospect.company_name}`,
        edited_body: editableBody
      });
      alert("Email Sent Successfully!");
      setEmailStatus("sent"); // Update status so the UI knows it sent
    } catch (error) {
      alert("Failed to send email. Check backend console.");
    }
    setSending(false);
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {isEditing ? (
          // --- EDIT MODE UI ---
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginRight: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="form-group input" style={{ flex: 1, padding: '8px' }} value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} placeholder="First Name" />
              <input className="form-group input" style={{ flex: 1, padding: '8px' }} value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} placeholder="Last Name" />
            </div>
            <input className="form-group input" style={{ padding: '8px' }} value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="Email Address" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="form-group input" style={{ flex: 1, padding: '8px' }} value={editForm.company_name} onChange={(e) => setEditForm({...editForm, company_name: e.target.value})} placeholder="Company Name" />
              <input className="form-group input" style={{ flex: 2, padding: '8px' }} value={editForm.company_website} onChange={(e) => setEditForm({...editForm, company_website: e.target.value})} placeholder="Website URL" />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="btn" style={{ backgroundColor: '#10b981', padding: '6px 12px' }} onClick={handleSaveEdit}>💾 Save</button>
              <button className="btn" style={{ backgroundColor: '#64748b', padding: '6px 12px' }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          // --- VIEW MODE UI ---
          <div>
            <h2 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {prospect.first_name} {prospect.last_name}
              {/* The Edit Pencil Icon */}
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                title="Edit Prospect"
              >
                ✏️
              </button>
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{prospect.company_name} | {prospect.company_website}</p>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>✉️ {prospect.email}</p>
          </div>
        )}

        {/* The Generate Button (Hide while editing for a cleaner UI) */}
        {!isEditing && emailStatus !== "sent" && (
            <button className="btn" onClick={handleGenerate} disabled={loading}>
              {loading ? "Scraping & Thinking..." : (generatedData ? "🔄 Regenerate Draft" : "✨ Generate AI Draft")}
            </button>
        )}
      </div>

      {generatedData && (
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          
          <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>
            {emailStatus === 'sent' ? '📧 PREVIOUSLY SENT EMAIL:' : '✏️ EDIT YOUR DRAFT:'}
          </p>
          
          <textarea 
            style={{ 
              width: '100%', height: '150px', padding: '12px', borderRadius: '6px', 
              border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical',
              backgroundColor: emailStatus === 'sent' ? '#f8fafc' : 'white' // Gray out if already sent
            }}
            value={editableBody}
            onChange={(e) => setEditableBody(e.target.value)}
            disabled={emailStatus === 'sent'} // Lock the text box if already sent
          />
          
          {emailStatus !== 'sent' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn" style={{ backgroundColor: '#10b981' }} onClick={handleSend} disabled={sending}>
                {sending ? "Sending..." : "🚀 Send Email"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}