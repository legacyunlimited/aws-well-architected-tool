import React, { useEffect, useState } from "react";

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function Questions() {
  const email = sessionStorage.getItem("assessmentEmail");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    e.preventDefault();
    
    if (!email) {
      setError("Missing email. Please restart.");
      return;
    }

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount !== totalQuestions) {
      setError(`Please answer all ${totalQuestions} questions. You have answered ${answeredCount}.`);
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

      if (!assessmentRes.ok) throw new Error("Assessment submission failed");

      const assessmentDataHeader = assessmentRes.headers.get('X-Assessment-Data');
      let assessmentData = { score: 0, riskLevel: 'Unknown', recommendedTier: 'Basic' };
      
      if (assessmentDataHeader) {
        assessmentData = JSON.parse(assessmentDataHeader);
      }

      setScore(assessmentData.score);

      const pdfBlob = await assessmentRes.blob();
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `aws-well-architected-assessment-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(pdfUrl);

      setShowUpgradeModal(true);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/services';
  };

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
  };

  if (!questions.length) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading questions...</div>;
  }

  const grouped = questions.reduce((acc, q) => {
    acc[q.pillar] = acc[q.pillar] || [];
    acc[q.pillar].push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-800">
        AWS Well-Architected Assessment
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Answer 12 questions to get your free score and risk assessment
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {Object.entries(grouped).map(([pillar, qs]) => (
          <div key={pillar} className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">{pillar}</h2>
            {qs.map((q) => (
              <div key={q.question} className="mb-6">
                <p className="mb-3 font-medium text-gray-700">{q.question}</p>
                <div className="flex gap-6">
                  {q.options.map((opt) => (
                    <label key={opt} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={q.question}
                        value={opt}
                        checked={answers[q.question] === opt}
                        onChange={() => handleAnswerChange(q.question, opt)}
                        className="mr-2 h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="text-center sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : "Get Free Assessment →"}
          </button>
        </div>
      </form>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete!</h3>
              <div className="text-6xl font-bold text-blue-600 my-4">{score}/100</div>
              <p className="text-gray-600 mb-4">Your free report has been downloaded.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-lg mb-2 text-gray-800">🚀 Upgrade to Full Health Check - $497</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ 12-pillar deep-dive analysis</li>
                <li>✓ Security & IAM scan results</li>
                <li>✓ Cost optimization recommendations</li>
                <li>✓ Detailed remediation steps</li>
                <li>✓ Delivered in 48 hours</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpgrade} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg">
                Upgrade Now - $497
              </button>
              <button onClick={handleCloseModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
