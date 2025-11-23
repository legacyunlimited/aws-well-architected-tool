const { analyzeAWS } = require("./analyzeAWS");
const { generatePDF } = require("./generateReport");
const { uploadPDF } = require("./uploadToS3");
const { updateGHL } = require("./notifyGHL");
const fs = require("fs");

exports.handler = async (event) => {
  console.log("🔹 Incoming Event:", JSON.stringify(event, null, 2));

  let body = {};

  // Parse JSON safely (API Gateway v2 sometimes gives event.body as a string, sometimes not)
  if (event.body) {
    try {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (err) {
      console.error("❌ JSON Parse Error:", err, "Body Received:", event.body);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }
  }

  console.log("🔹 Parsed Body:", body);

  const {
    contactId,
    accessKeyId,
    secretAccessKey,
    accountId,
    clientName
  } = body;

  if (!contactId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing contactId" })
    };
  }

  try {
    console.log("🔹 Running AWS Analysis...");
    const reportData = await analyzeAWS(accessKeyId, secretAccessKey);

    // SAFE DEFAULTS to prevent crashes
    reportData.findings = reportData.findings || [];
    reportData.recommendations = reportData.recommendations || [];
    reportData.cost = reportData.cost || 0;

    reportData.clientName = clientName || "Client";
    reportData.accountId = accountId || "Unknown";

    console.log("🔹 Generating PDF...");
    const pdfPath = `/tmp/report-${contactId}.pdf`;
    await generatePDF(reportData, pdfPath);

    console.log("🔹 Uploading PDF to S3...");
    const key = `reports/${contactId}.pdf`;
    const reportUrl = await uploadPDF(pdfPath, key);

    console.log("🔹 Updating GHL contact...");
    await updateGHL(contactId, reportUrl);

    console.log("✅ Success:", reportUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "success",
        reportUrl
      })
    };

  } catch (err) {
    console.error("❌ Lambda Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};

