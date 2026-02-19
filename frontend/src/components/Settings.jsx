import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch saved settings from the database when the page loads
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/auth/settings/smtp')
      .then(response => {
        if (response.data.smtp_email) {
          setEmail(response.data.smtp_email);
        }
        if (response.data.is_configured) {
          setAppPassword('********'); // Show dummy stars to prove it's saved
        }
      })
      .catch(error => console.error("Error fetching settings:", error));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If the password is just the placeholder stars, don't send it to the backend
      const payload = { smtp_email: email };
      if (appPassword !== '********') {
        payload.smtp_password = appPassword;
      }

      await axios.put('http://127.0.0.1:8000/api/v1/auth/settings/smtp', payload);
      setMessage('✅ SMTP Credentials saved successfully!');
      setAppPassword('********'); // Revert back to stars after a successful save
    } catch (error) {
      setMessage('❌ Failed to save settings.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* LEFT SIDE: The Input Form */}
      <div className="card" style={{ flex: 1 }}>
        <h2 style={{ marginTop: 0 }}>Email Configuration</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          To send emails directly from your own account, enter your Gmail and App Password below.
        </p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block' }}>Your Gmail Address</label>
            <input 
              type="email" 
              className="input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="sanjay@gmail.com"
              required 
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block' }}>Google App Password</label>
            <input 
              type="password" 
              className="input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
              value={appPassword} 
              onChange={(e) => setAppPassword(e.target.value)} 
              placeholder="16-character code"
              required 
            />
          </div>
          <button className="btn" style={{ marginTop: '8px', padding: '12px' }} type="submit" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Settings'}
          </button>
        </form>

        {message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            borderRadius: '6px', 
            backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
            color: message.includes('✅') ? '#166534' : '#991b1b',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* RIGHT SIDE: The Instructions */}
      <div className="card" style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ℹ️ How to get your App Password
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
          Google requires a special 16-character password to allow third-party apps to send emails safely. <strong>Your normal Gmail password will not work here.</strong>
        </p>
        
        <ol style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)', paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Google Account Security</a> settings.</li>
          <li style={{ marginBottom: '8px' }}>Ensure <strong>2-Step Verification</strong> is turned <strong>ON</strong>.</li>
          <li style={{ marginBottom: '8px' }}>In the search bar at the top of the settings page, type <strong>"App passwords"</strong> and click the result.</li>
          <li style={{ marginBottom: '8px' }}>Enter an app name (like <em>AutoPitch AI</em>) and click <strong>Create</strong>.</li>
          <li>Copy the 16-letter code in the yellow box, remove any spaces, and paste it into the form here.</li>
        </ol>
      </div>

    </div>
  );
}