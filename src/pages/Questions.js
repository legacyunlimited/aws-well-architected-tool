import React, { useEffect, useState } from "react";

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function Questions() {
  const email = sessionStorage.getItem("assessmentEmail");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch(() =>
        setError("Unable to load assessment questions. Please refresh.")
      );
  }, []);

  if (!questions || questions.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Loading assessment questions…</h2>
      </div>
    );
  }

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = async () => {
    if (!email) {
      setError("Missing email. Please restart the assessment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const assessmentRes = await fetch(`${API_BASE}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers })
      });

      if (!assessmentRes.ok) {
        throw new Error("Assessment scoring failed");
      }

      const assessmentData = await assessmentRes.json();
      setScoreData(assessmentData);
      setShowScoreModal(true);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError(err.message || "Submission failed");
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setShowScoreModal(false);
    setLoading(true);

    try {
      const stripeRes = await fetch(`${API_BASE}/stripe/verify-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recommendedTier: scoreData.recommendedTier,
          assessmentId: `assessment-${Date.now()}`
        })
      });

      if (!stripeRes.ok) {
        throw new Error("Stripe session creation failed");
      }

      const stripeData = await stripeRes.json();

      if (!stripeData.checkoutUrl) {
        throw new Error("Missing Stripe checkout URL");
      }

      window.location.href = stripeData.checkoutUrl;

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start checkout");
      setLoading(false);
    }
  };

  const grouped = questions.reduce((acc, q) => {
    acc[q.pillar] = acc[q.pillar] || [];
    acc[q.pillar].push(q);
    return acc;
  }, {});

  const getRiskLevel = (score) => {
    if (score >= 80) return { text: "Low Risk", color: "#3fb950" };
    if (score >= 50) return { text: "Medium Risk", color: "#f59e0b" };
    return { text: "High Risk", color: "#ef4444" };
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AWS Well-Architected Assessment
      </h1>

      {error && (
        <p className="text-red-600 text-center mb-4">{error}</p>
      )}

      {Object.entries(grouped).map(([pillar, qs]) => (
        <div key={pillar} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{pillar}</h2>

          {qs.map((q) => (
            <div key={q.question} className="mb-3">
              <p className="mb-1">{q.question}</p>

              {q.options.map((opt) => (
                <label key={opt} className="mr-4">
                  <input
                    type="radio"
                    name={q.question}
                    value={opt}
                    checked={answers[q.question] === opt}
                    onChange={() =>
                      handleAnswerChange(q.question, opt)
                    }
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          <strong>What happens next?</strong>
          <br />• We calculate your Well-Architected score instantly
          <br />• You receive a detailed PDF report with findings
          <br />• Upgrade to our paid platform for continuous AWS scanning
          <br />• No commitment - try the free assessment first
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Calculating score..." : "Continue"}
        </button>
      </div>

      {showScoreModal && scoreData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: getRiskLevel(scoreData.score).color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <span style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white'
              }}>{scoreData.score}</span>
            </div>

            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
              Your Well-Architected Score
            </h2>

            <p style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: getRiskLevel(scoreData.score).color,
              marginBottom: '20px'
            }}>
              {getRiskLevel(scoreData.score).text}
            </p>

            <div style={{
              textAlign: 'left',
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Recommended Plan:</strong> {scoreData.recommendedTier}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Questions Answered:</strong> {scoreData.totalQuestions}
              </p>
              <p>
                <strong>Best Practices Followed:</strong> {scoreData.yesCount} out of {scoreData.totalQuestions}
              </p>
            </div>

            <button
              onClick={handleUpgrade}
              style={{
                backgroundColor: '#3fb950',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '12px'
              }}
            >
              Upgrade to Full Platform - $497/month
            </button>

            <button
              onClick={() => {
                setShowScoreModal(false);
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#666',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Email me my score
            </button>

            <button
              onClick={() => setShowScoreModal(false)}
              style={{
                backgroundColor: 'transparent',
                color: '#999',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
