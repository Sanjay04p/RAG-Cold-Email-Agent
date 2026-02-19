import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ProspectDetail({ prospect, onProspectUpdated }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  
  const [history, setHistory] = useState([]);
  const [composeText, setComposeText] = useState("");
  const [activeDraftId, setActiveDraftId] = useState(null); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({...prospect});

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    setIsEditing(false);
    setEditForm({...prospect});
    setComposeText("");
    setActiveDraftId(null);
    setSendError("");
  }, [prospect]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/research/${prospect.id}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/prospects/${prospect.id}`, editForm);
      setIsEditing(false);
      onProspectUpdated();
    } catch (error) {
      alert("Failed to update prospect.");
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSendError("");
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/research/${prospect.id}/generate`);
      setActiveDraftId(response.data.email_log_id);
      const newDraft = `${response.data.generated_line}\n\nI'd love to connect and share some ideas.\n\nBest,\nSanjay`;
      setComposeText(newDraft);
    } catch (error) {
      alert("Failed to generate AI email.");
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!composeText.trim()) return;
    setSending(true);
    setSendError("");
    
    try {
      if (activeDraftId) {
        await axios.post(`http://127.0.0.1:8000/api/v1/research/send/${activeDraftId}`, {
          subject: `Quick question regarding ${prospect.company_name}`,
          edited_body: composeText
        });
      } else {
        await axios.post(`http://127.0.0.1:8000/api/v1/research/${prospect.id}/send-manual`, {
          subject: `Following up regarding ${prospect.company_name}`,
          body: composeText
        });
      }
      
      setComposeText("");
      setActiveDraftId(null);
      fetchHistory(); 
      
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setSendError(error.response.data.detail);
      } else {
        setSendError("Failed to send email. Please check your connection.");
      }
    }
    setSending(false);
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '85vh' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexShrink: 0 }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
             <div style={{ display: 'flex', gap: '10px' }}>
              <input className="form-group input" style={{ flex: 1, padding: '8px' }} value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} placeholder="First Name" />
              <input className="form-group input" style={{ flex: 1, padding: '8px' }} value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} placeholder="Last Name" />
            </div>
            <input className="form-group input" style={{ padding: '8px' }} value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} placeholder="Email" />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button className="btn" style={{ backgroundColor: '#10b981', padding: '6px 12px' }} onClick={handleSaveEdit}>💾 Save</button>
              <button className="btn" style={{ backgroundColor: '#64748b', padding: '6px 12px' }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {prospect.first_name} {prospect.last_name}
              <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{prospect.company_name} | {prospect.company_website}</p>
          </div>
        )}
      </div>

      {/* CHAT HISTORY AREA */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
        {history.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>No emails sent yet. Start the conversation!</p>
        )}
        
        {history.map((msg, index) => (
          <div key={index} style={{ 
            alignSelf: msg.status === 'sent' ? 'flex-end' : 'flex-start', 
            background: msg.status === 'sent' ? '#e0f2fe' : '#ffffff', 
            padding: '12px 16px', 
            borderRadius: msg.status === 'sent' ? '16px 16px 0 16px' : '16px 16px 16px 0',
            maxWidth: '80%',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {msg.status === 'sent' ? '📤 Sent Email' : '📝 Saved Draft'}
            </p>
            <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.5', color: 'var(--text-main)' }}>{msg.body}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* COMPOSE AREA WRAPPER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        
        {sendError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ <span><strong>Error:</strong> {sendError} Go to <strong>SMTP Settings</strong> on the sidebar to fix this.</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <button 
            className="btn" 
            onClick={handleGenerate} 
            disabled={loading || sending}
            style={{ backgroundColor: '#8b5cf6', padding: '12px', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            title="Use AI to generate a draft"
          >
            {loading ? "⏳" : "✨"}
          </button>
          
          <textarea 
            style={{ flex: 1, minHeight: '48px', maxHeight: '120px', padding: '12px', borderRadius: '24px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'none', outline: 'none' }}
            placeholder="Type a message or click ✨ to use AI..."
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
          />
          
          <button 
            className="btn" 
            onClick={handleSend} 
            disabled={sending || !composeText.trim()}
            style={{ backgroundColor: '#10b981', padding: '12px', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            title="Send Email"
          >
            {sending ? "⏳" : "🚀"}
          </button>
        </div>
      </div>

    </div>
  );
}