import { useState } from 'react';
import axios from 'axios';


export default function LeadForm({ onLeadAdded }) {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', company_name: '', company_website: ''
  });
  const [loading, setLoading] = useState(false);

  // Updates the state whenever you type in an input box
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Triggers when you click "Save Lead"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/prospects/', formData);
      alert("Lead saved successfully!");
      onLeadAdded(response.data); 
      
      // Clear the form
      setFormData({ first_name: '', last_name: '', email: '', company_name: '', company_website: ''});
    } catch (error) {
      alert("Error saving lead. Check console.");
      console.error(error);
    }
    setLoading(false);
  };

 return (
    <div className="card">
      <h2>➕ Add New Prospect</h2>
      <form onSubmit={handleSubmit} className="lead-form-grid">
        
        <div className="form-group">
          <label>First Name</label>
          <input name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input name="company_name" value={formData.company_name} onChange={handleChange} required />
        </div>
        
        <div className="form-group form-full-width">
          <label>Company Website (Required for AI Scraping)</label>
          <input name="company_website" type="url" placeholder="https://example.com" value={formData.company_website} onChange={handleChange} required />
        </div>

        <div className="form-full-width" style={{ marginTop: '10px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Saving..." : "Save Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}