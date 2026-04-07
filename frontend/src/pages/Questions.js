import React, { useEffect, useState } from "react";

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function Questions() {
  const email = sessionStorage.getItem("assessmentEmail");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load questions (static JSON)
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
    // Check if all questions are answered
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions !== totalQuestions) {
      setError(`Please answer all ${totalQuestions} questions. You have answered ${answeredQuestions}.`);
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Missing email. Please restart the assessment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /* -------------------------------
         STEP 1: Submit assessment
      -------------------------------- */
    console.log("Step 1: Calling assessment API...");

      const assessmentRes = await fetch(`${API_BASE}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers })
      });

      if (!assessmentRes.ok) {
        throw new Error("Assessment scoring failed");
      }

      const assessmentData = await assessmentRes.json();
    console.log("Step 2: Got response:", assessmentData);

      const { recommendedTier } = assessmentData;

      if (!recommendedTier) {
        throw new Error("No recommended tier returned");
      }

      /* -------------------------------
         STEP 2: Create Stripe session
      -------------------------------- */
      const stripeRes = await fetch(
        `${API_BASE}/stripe/verify-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            recommendedTier,
            assessmentId: `assessment-${Date.now()}`
          })
        }
      );

      if (!stripeRes.ok) {
        throw new Error("Stripe session creation failed");
      }

      const stripeData = await stripeRes.json();

      if (!stripeData.checkoutUrl) {
        throw new Error("Missing Stripe checkout URL");
      }

      /* -------------------------------
         STEP 3: Redirect to Stripe
      -------------------------------- */
      window.location.href = stripeData.checkoutUrl;

    } catch (err) {
      console.error(err);
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

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

      {/* 🔐 Move 1 — Reassurance block */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          <strong>What happens next?</strong>
          <br />• We run a secure, read-only scan on your AWS account
          <br />• No changes are made automatically
          <br />• You receive a short PDF report with findings
          <br />• If there’s value, you can proceed — no calls required
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Redirecting to checkout…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

