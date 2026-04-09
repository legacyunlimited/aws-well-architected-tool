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
    // Show score to user
    const userConfirmed = window.confirm(
      `Your Well-Architected Score: ${assessmentData.score}/100\n\n` +
      `Recommended Plan: ${assessmentData.recommendedTier}\n\n` +
      `${assessmentData.yesCount} out of ${assessmentData.totalQuestions} best practices followed\n\n` +
      `Click OK to upgrade to the full platform for $497/month\n` +
      `Click Cancel to continue with the free assessment.`
    );
    if (!userConfirmed) {
      setLoading(false);
      return;
    }

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
