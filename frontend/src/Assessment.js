import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Assessment() {
  const [searchParams] = useSearchParams();
  const referrerCode = searchParams.get('ref');
  
  // Store referrer immediately
  useEffect(() => {
    if (referrerCode) {
      localStorage.setItem('referrerCode', referrerCode);
      sessionStorage.setItem('referrerCode', referrerCode);
    }
  }, [referrerCode]);

  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);

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
    // Simple scoring: "Yes" answers that indicate good practice
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
    
    return totalScore; // 0-100
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { text: "Low Risk", color: "green" };
    if (score >= 50) return { text: "Medium Risk", color: "orange" };
    return { text: "High Risk", color: "red" };
  };

  if (showResults) {
    const risk = getRiskLevel(score);
    const referrer = localStorage.getItem('referrerCode');
    
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Your AWS Health Score</h1>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: risk.color }}>
          {score}/100
        </div>
        <div style={{ fontSize: "24px", marginTop: "10px" }}>
          Risk: {risk.text}
        </div>
        
        <div style={{ marginTop: "30px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>Recommended Next Step</h3>
          <p>Based on your answers, you have potential cost and security risks.</p>
          <p>A full AWS Health Check would identify exactly where money is leaking.</p>
          
          <a 
            href={`/checkout?ref=${referrer || ''}&product=health_check_497`}
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "12px 24px",
              background: "#0070f3",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold"
            }}
          >
            Get Full AWS Health Check – $497
          </a>
        </div>
        
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
          {referrer && <p>Partner referral: Active</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>AWS Well-Architected Assessment</h1>
      <p>Answer 12 questions. 2 minutes. No login required.</p>
      
      {questions.map((q, idx) => (
        <div key={idx} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <p><strong>{idx + 1}. {q}</strong></p>
          <div style={{ display: "flex", gap: "20px" }}>
            <button 
              onClick={() => handleAnswer(idx, "yes")}
              style={{ padding: "5px 15px", background: answers[idx] === "yes" ? "#0070f3" : "#eee" }}
            >Yes</button>
            <button 
              onClick={() => handleAnswer(idx, "no")}
              style={{ padding: "5px 15px", background: answers[idx] === "no" ? "#0070f3" : "#eee" }}
            >No</button>
            <button 
              onClick={() => handleAnswer(idx, "unsure")}
              style={{ padding: "5px 15px", background: answers[idx] === "unsure" ? "#0070f3" : "#eee" }}
            >Unsure</button>
          </div>
        </div>
      ))}
      
      <button 
        onClick={handleSubmit}
        style={{ padding: "12px 24px", background: "#0070f3", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold" }}
      >
        See My Score
      </button>
    </div>
  );
}