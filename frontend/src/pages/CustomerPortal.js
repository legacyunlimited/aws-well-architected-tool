import React, { useState, useEffect } from 'react';

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function CustomerPortal() {
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('assessmentEmail') || localStorage.getItem('customerEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      verifyAndLoadReports(storedEmail);
    }
  }, []);
  
  const verifyAndLoadReports = async (customerEmail) => {
    setLoading(true);
    setError(null);
    
    try {
      const verifyRes = await fetch(`${API_BASE}/customer/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail })
      });
      
      const verifyData = await verifyRes.json();
      
      if (!verifyData.verified) {
        setError('No purchases found for this email.');
        setLoading(false);
        return;
      }
      
      const reportsRes = await fetch(`${API_BASE}/customer/reports/${encodeURIComponent(customerEmail)}`);
      const reportsData = await reportsRes.json();
      
      setReports(reportsData.reports || []);
      setIsVerified(true);
      localStorage.setItem('customerEmail', customerEmail);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      verifyAndLoadReports(email);
    }
  };
  
  const handleDownload = async (reportId) => {
    try {
      await fetch(`${API_BASE}/customer/report/${reportId}/download?email=${encodeURIComponent(email)}`);
      alert(`Report download requested. Check your email or contact support.`);
    } catch (err) {
      alert('Download failed. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatReportType = (type) => {
    const types = {
      'health-check': 'AWS Health Check Report',
      'cost-blueprint': 'Cost Optimization Blueprint',
      'full-cleanup': 'Full Cloud Cleanup',
      'cloud-cost-optimization-platform': 'Cloud Cost Optimization Platform'
    };
    return types[type] || type;
  };
  
  const getStatusBadge = (status) => {
    const styles = {
      'delivered': { background: '#10b981', color: 'white' },
      'processing': { background: '#f59e0b', color: 'white' },
      'pending': { background: '#6b7280', color: 'white' },
      'failed': { background: '#ef4444', color: 'white' }
    };
    return styles[status] || styles.pending;
  };
  
  if (!isVerified) {
    return (
      <div style={{ 
        maxWidth: '500px', 
        margin: '100px auto', 
        padding: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Customer Portal</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>
          Enter your email to view your purchased reports
        </p>
        
        {error && (
          <div style={{ 
            background: '#fee', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            color: '#c00',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {loading ? 'Loading...' : 'View My Reports'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#9ca3af' }}>
          Don't have a report? <a href="/services" style={{ color: '#2563eb' }}>View our services</a>
        </p>
      </div>
    );
  }
  
  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Reports</h1>
        <button
          onClick={() => {
            setIsVerified(false);
            setEmail('');
            setReports([]);
            localStorage.removeItem('customerEmail');
          }}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          Sign Out
        </button>
      </div>
      
      <p style={{ marginBottom: '20px', color: '#6b7280' }}>
        Logged in as: <strong>{email}</strong>
      </p>
      
      {reports.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>No reports found</p>
          <a href="/services" style={{ color: '#2563eb' }}>Purchase a report →</a>
        </div>
      ) : (
        <div>
          {reports.map((report) => (
            <div key={report.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              background: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>{formatReportType(report.report_type)}</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Purchased: {formatDate(report.created_at)}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Amount: ${report.amount_paid}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  ...getStatusBadge(report.status)
                }}>
                  {report.status}
                </span>
              </div>
              
              {report.status === 'delivered' && (
                <button
                  onClick={() => handleDownload(report.id)}
                  style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Download Report
                </button>
              )}
              
              {report.status === 'processing' && (
                <p style={{ color: '#f59e0b', fontSize: '14px', margin: 0 }}>
                  Your report is being generated. Check back soon.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a href="/services" style={{ color: '#2563eb', marginRight: '20px' }}>← Back to Services</a>
        <a href="/assessment" style={{ color: '#2563eb' }}>Take Free Assessment →</a>
      </div>
    </div>
  );
}
