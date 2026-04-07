import React, { useEffect, useState } from "react";

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function Questions() {
  const email = sessionStorage.getItem("assessmentEmail");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch(() => setError("Unable to load assessment questions"));
  }, []);

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    if (!email) {
      setError("Missing email. Please restart.");
      return;
    }

    // Check if all questions are answered
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount !== totalQuestions) {
      setError(`Please answer all ${totalQuestions} questions. You have answered ${answeredCount}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Submit to assessment endpoint
      console.log("Calling assessment API...");
      const assessmentRes = await fetch(`${API_BASE}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers })
      });

      if (!assessmentRes.ok) {
        throw new Error("Assessment scoring failed");
      }

      const assessmentData = await assessmentRes.json();
      console.log("Score received:", assessmentData.score);

      // Step 2: Show score to user
      const wantsToUpgrade = confirm(
        `Your Well-Architected Score: ${assessmentData.score}/100\n\n` +
        `Recommended Plan: ${assessmentData.recommendedTier}\n\n` +
        `${assessmentData.yesCount} out of ${assessmentData.totalQuestions} best practices followed\n\n` +
        `Click OK to upgrade to the full platform for $497/month\n` +
        `Click Cancel to stay with the free assessment.`
      );

      if (!wantsToUpgrade) {
        setLoading(false);
        return;
      }

      // Step 3: Create Stripe checkout session
      console.log("Creating Stripe session...");
      const stripeRes = await fetch(`${API_BASE}/stripe/verify-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recommendedTier: assessmentData.recommendedTier,
          assessmentId: `assessment-${Date.now()}`
        })
      });

      if (!stripeRes.ok) {
        throw new Error("Stripe session creation failed");
      }

      const stripeData = await stripeRes.json();
      console.log("Redirecting to Stripe...");
      window.location.href = stripeData.checkoutUrl;

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Submission failed");
      setLoading(false);
    }
  };

  if (!questions.length) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading questions...</div>;
  }

  // Group questions by pillar
  const grouped = questions.reduce((acc, q) => {
    acc[q.pillar] = acc[q.pillar] || [];
    acc[q.pillar].push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AWS Well-Architected Assessment
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
                      onChange={() => handleAnswerChange(q.question, opt)}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            ))}
          </div>
        ))}

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
