import { useState, useEffect } from 'react';
import axios from 'axios';

// In React, components are just functions that return UI (HTML-like syntax called JSX)
export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/analytics/summary');
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (!stats) return <div className="card">Loading analytics...</div>;

  return (
    <div className="card">
      <h2>📊 Pipeline Analytics</h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
        <div style={{ flex: 1, padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
          <h3>Total Leads</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total_prospects}</p>
        </div>
        <div style={{ flex: 1, padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
          <h3>Emails Sent</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pipeline_stats.sent}</p>
        </div>
        <div style={{ flex: 1, padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
          <h3>Drafts Waiting</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pipeline_stats.drafts}</p>
        </div>
      </div>
    </div>
  );
}