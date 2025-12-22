import React, { useEffect, useState } from "react";

export default function Questions() {
  const email = sessionStorage.getItem("assessmentEmail");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load questions from public/questions.json
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
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  // Stubbed submit (frontend test)
  const handleSubmit = () => {
    if (!email) {
      setError("Missing email. Please restart the assessment.");
      return;
    }

    console.log("Submitted answers:", { email, answers });

    setLoading(true);

    setTimeout(() => {
      setResult({
        overallScore: 72,
        severity: "Medium",
        pillarScores: {
          "Operational Excellence": 70,
          Security: 75,
          Reliability: 68,
          "Performance Efficiency": 80,
          "Cost Optimization": 65,
          Sustainability: 72
        }
      });
      setLoading(false);
    }, 600);
  };

  // Group questions by pillar
  const grouped = questions.reduce((acc, q) => {
    acc[q.pillar] = acc[q.pillar] || [];
    acc[q.pillar].push(q);
    return acc;
  }, {});

  // RESULTS VIEW
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Your AWS Assessment Results
        </h1>

        <p className="text-xl mb-2">
          Overall Score: <strong>{result.overallScore}%</strong>
        </p>

        <p className="mb-6">Risk Level: {result.severity}</p>

        <div className="text-left mb-6">
          {Object.entries(result.pillarScores).map(([pillar, score]) => (
            <p key={pillar}>
              <strong>{pillar}:</strong> {score}%
            </p>
          ))}
        </div>

        <p className="text-gray-600">
          A detailed PDF report will be emailed to you with recommended next
          steps.
        </p>
      </div>
    );
  }

  // QUESTIONS VIEW
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AWS Well-Architected Assessment
      </h1>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {Object.entries(grouped).map(([pillar, qs]) => (
        <div key={pillar} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{pillar}</h2>

          {qs.map((q, idx) => (
            <div key={idx} className="mb-3">
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

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Submitting…" : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}

