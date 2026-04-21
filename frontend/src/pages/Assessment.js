import React, { useState, useEffect } from 'react';

export default function Assessment() {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);
  const [referrerCode, setReferrerCode] = useState(null);

  // Capture referrer code from URL when page loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferrerCode(ref);
      // Store in both localStorage and sessionStorage for redundancy
      localStorage.setItem('referrerCode', ref);
      sessionStorage.setItem('referrerCode', ref);
      console.log('Referrer captured:', ref);
    }
  }, []);

  const questions = [
    "Do you know your exact AWS monthly spend?",
    "Do you have unused EC2 instances running?",
    "Are your EBS snapshots older than 30 days?",
    "Do you use Reserved Instances or Savings Plans?",
    "Have you reviewed IAM roles in the last 90 days?",
    "Are your S3 buckets publicly accessible?",
    "Do you have CloudTrail enabled?",
    "Are you monitoring cost anomalies?",
    "Do you have a backup strategy?",
    "Have you received an unexpected AWS bill in the last 6 months?",
    "Do you use multiple AWS regions?",
    "Is your infrastructure documented?"
  ];

  const handleAnswer = (questionIndex, answer) => {
    const newAnswers = { ...answers, [questionIndex]: answer };
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    const scoring = {
      0: { yes: 10 },  // Know spend? Yes = good
      1: { no: 10 },   // Unused instances? No = good
      2: { no: 10 },   // Old snapshots? No = good
      3: { yes: 10 },  // Use RI/SP? Yes = good
      4: { yes: 10 },  // Reviewed IAM? Yes = good
      5: { no: 10 },   // Public buckets? No = good
      6: { yes: 10 },  // CloudTrail? Yes = good
      7: { yes: 10 },  // Cost monitoring? Yes = good
      8: { yes: 10 },  // Backup strategy? Yes = good
      9: { no: 10 },   // Unexpected bill? No = good
      10: { no: 5 },   // Multiple regions? No = better
      11: { yes: 5 }    // Documentation? Yes = good
    };

    let totalScore = 0;
    questions.forEach((_, idx) => {
      const userAnswer = answers[idx];
      const scoringRule = scoring[idx];
      if (scoringRule && scoringRule[userAnswer]) {
        totalScore += scoringRule[userAnswer];
      }
    });
    
    return totalScore;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    
    // Scroll to top to show results
    window.scrollTo(0, 0);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { text: "Low Risk", color: "#10b981" };
    if (score >= 50) return { text: "Medium Risk", color: "#f59e0b" };
    return { text: "High Risk", color: "#ef4444" };
  };

  // Count how many questions answered
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  if (showResults) {
    const risk = getRiskLevel(score);
    const storedReferrer = referrerCode || localStorage.getItem('referrerCode');
    
    return (
      <div style={{ 
        padding: "2rem", 
        maxWidth: "800px", 
        margin: "0 auto",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Your AWS Health Score</h1>
        
        <div style={{ 
          fontSize: "64px", 
          fontWeight: "bold", 
          color: risk.color,
          marginBottom: "0.5rem"
        }}>
          {score}/100
        </div>
        
        <div style={{ 
          fontSize: "24px", 
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          display: "inline-block"
        }}>
          Risk: {risk.text}
        </div>
        
        <div style={{ 
          marginTop: "40px", 
          padding: "24px", 
          background: "#f9fafb", 
          borderRadius: "12px",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ marginBottom: "16px" }}>Recommended Next Step</h3>
          <p style={{ marginBottom: "16px", color: "#4b5563" }}>
            Based on your answers, you have potential cost and security risks that need attention.
            A full AWS Health Check would identify exactly where money is leaking.
          </p>
          
          <a 
            href={`/services?ref=${storedReferrer || ''}&product=health_check`}
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "14px 28px",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            Get Full AWS Health Check – $497 →
          </a>
        </div>
        
        {storedReferrer && (
          <div style={{ 
            marginTop: "24px", 
            padding: "12px",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#166534"
          }}>
            ✓ Partner referral applied
          </div>
        )}
        
        <button
          onClick={() => {
            setShowResults(false);
            setAnswers({});
            setScore(null);
          }}
          style={{
            marginTop: "24px",
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          ← Take Assessment Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "800px", 
      margin: "0 auto",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        AWS Well-Architected Assessment
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Answer 12 questions. 2 minutes. No login required.
      </p>
      
      {referrerCode && (
        <div style={{
          padding: "8px 16px",
          backgroundColor: "#f0fdf4",
          borderRadius: "6px",
          marginBottom: "20px",
          fontSize: "14px",
          color: "#166534"
        }}>
          Partner referral: {referrerCode}
        </div>
      )}
      
      <div style={{ marginBottom: "24px" }}>
        Progress: {answeredCount}/{questions.length} questions answered
      </div>
      
      {questions.map((q, idx) => (
        <div key={idx} style={{ 
          marginBottom: "24px", 
          padding: "16px", 
          border: "1px solid #e5e7eb", 
          borderRadius: "12px",
          backgroundColor: answers[idx] ? "#f9fafb" : "white"
        }}>
          <p style={{ fontWeight: "bold", marginBottom: "12px" }}>
            {idx + 1}. {q}
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            {["yes", "no", "unsure"].map(option => (
              <button 
                key={option}
                onClick={() => handleAnswer(idx, option)}
                style={{ 
                  padding: "8px 20px",
                  background: answers[idx] === option ? "#2563eb" : "#f3f4f6",
                  color: answers[idx] === option ? "white" : "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: answers[idx] === option ? "bold" : "normal"
                }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <button 
        onClick={handleSubmit}
        disabled={!allAnswered}
        style={{ 
          padding: "14px 28px", 
          background: allAnswered ? "#2563eb" : "#9ca3af", 
          color: "white", 
          border: "none", 
          borderRadius: "8px", 
          fontWeight: "bold",
          fontSize: "16px",
          cursor: allAnswered ? "pointer" : "not-allowed",
          marginTop: "20px"
        }}
      >
        {allAnswered ? "See My Score →" : `Answer ${questions.length - answeredCount} more question${questions.length - answeredCount !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}