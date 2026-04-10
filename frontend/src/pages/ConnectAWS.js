import React, { useState, useEffect } from 'react';

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function ConnectAWS() {
  const [step, setStep] = useState(1);
  const [externalId, setExternalId] = useState('');
  const [roleArn, setRoleArn] = useState('');
  const [awsAccountId, setAwsAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      generateExternalId(sessionId);
      fetchSessionInfo(sessionId);
    }
  }, []);
  
  const fetchSessionInfo = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/stripe/session/${sessionId}`);
      const data = await response.json();
      setCustomerEmail(data.customerEmail);
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  };
  
  const generateExternalId = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/aws-connect/generate-external-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerEmail: sessionStorage.getItem('assessmentEmail') || 'customer@example.com',
          sessionId 
        })
      });
      const data = await response.json();
      setExternalId(data.externalId);
    } catch (err) {
      setError('Failed to generate secure connection ID');
    }
  };
  
  const handleValidateConnection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    try {
      const response = await fetch(`${API_BASE}/aws-connect/validate-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, roleArn, awsAccountId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }
      
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };
  
  const launchCloudFormation = () => {
    const templateUrl = 'https://kbcloudsolutions.com/kbcloud-scan-role.yaml';
    const cfUrl = `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=${encodeURIComponent(templateUrl)}&param_ExternalId=${encodeURIComponent(externalId)}`;
    window.open(cfUrl, '_blank');
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2563eb' }}>Connect Your AWS Account</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        To generate your automated AWS assessment, we need read-only access to your account.
        This takes less than 2 minutes and is completely secure.
      </p>
      
      {error && (
        <div style={{ background: '#fee', padding: '12px', borderRadius: '6px', marginBottom: '20px', color: '#c00' }}>
          {error}
        </div>
      )}
      
      {step === 1 && (
        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '8px' }}>
          <h2>Step 1: Create IAM Role</h2>
          <p>Click the button below to launch AWS CloudFormation.</p>
          
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', margin: '20px 0' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Your Unique External ID:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <code style={{ background: '#e5e7eb', padding: '10px', borderRadius: '4px', flex: 1 }}>
                {externalId || 'Generating...'}
              </code>
              <button onClick={() => copyToClipboard(externalId)} style={{ padding: '10px 15px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Copy
              </button>
            </div>
          </div>
          
          <button onClick={launchCloudFormation} style={{ background: '#2563eb', color: 'white', padding: '14px 24px', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', marginRight: '15px' }}>
            🚀 Launch CloudFormation Stack
          </button>
          
          <button onClick={() => setStep(2)} style={{ background: '#10b981', color: 'white', padding: '14px 24px', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}>
            I've Created the Role → Next
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '8px' }}>
          <h2>Step 2: Enter Role Information</h2>
          
          <form onSubmit={handleValidateConnection}>
            <div style={{ marginBottom: '20px' }}>
              <label>AWS Account ID (12 digits)</label>
              <input type="text" value={awsAccountId} onChange={(e) => setAwsAccountId(e.target.value)} placeholder="123456789012" pattern="[0-9]{12}" required style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label>Role ARN</label>
              <input type="text" value={roleArn} onChange={(e) => setRoleArn(e.target.value)} placeholder="arn:aws:iam::123456789012:role/KBCloudSolutionsReadOnlyRole" required style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: '#6b7280', color: 'white', padding: '14px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
              <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : '#2563eb', color: 'white', padding: '14px 24px', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Validating...' : 'Validate & Start Scan →'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {step === 3 && (
        <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <h2>AWS Scan in Progress</h2>
          <p style={{ marginBottom: '30px', color: '#6b7280' }}>We're analyzing your AWS environment. This typically takes 5-10 minutes.</p>
          <p>You'll receive an email at <strong>{customerEmail}</strong> when your report is ready.</p>
          <a href="/customer-portal" style={{ display: 'inline-block', marginTop: '30px', padding: '12px 24px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px' }}>
            Go to Customer Portal →
          </a>
        </div>
      )}
    </div>
  );
}
