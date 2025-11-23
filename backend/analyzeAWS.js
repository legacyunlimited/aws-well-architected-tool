const AWS = require("aws-sdk");

async function analyzeAWS(accessKeyId, secretAccessKey, region = "us-east-1") {
  try {
    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region
    });

    const ce = new AWS.CostExplorer();
    const iam = new AWS.IAM();
    const ec2 = new AWS.EC2();
    const s3 = new AWS.S3();

    // ---------- Cost Summary ----------
    const monthStart = new Date();
    monthStart.setDate(1);

    const costResult = await ce.getCostAndUsage({
      TimePeriod: {
        Start: monthStart.toISOString().substring(0, 10),
        End: new Date().toISOString().substring(0, 10)
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"]
    }).promise();

    const cost = parseFloat(costResult.ResultsByTime[0].Total.UnblendedCost.Amount);

    // ---------- IAM Summary ----------
    const iamSummary = await iam.getAccountSummary({}).promise();
    const rootAccessKeys = iamSummary.SummaryMap["AccountAccessKeysPresent"];

    // ---------- EC2 ----------
    const ec2Instances = await ec2.describeInstances({}).promise();
    const totalInstances = ec2Instances.Reservations.length;

    // ---------- S3 ----------
    const buckets = await s3.listBuckets().promise();
    const bucketCount = buckets.Buckets.length;

    // ---------- Build analysis data ----------
    const analysis = {
      cost: cost.toFixed(2),
      iamRisk: rootAccessKeys > 0 ? "Root access keys detected (HIGH RISK)" : "No root keys detected",
      ec2Count: totalInstances,
      bucketCount,
      findings: [],
      recommendations: []
    };

    // Findings
    if (cost > 500) {
      analysis.findings.push("High monthly AWS spend detected.");
      analysis.recommendations.push("Review unused resources and optimize EC2/S3.");
    }
    if (rootAccessKeys > 0) {
      analysis.findings.push("Root user access keys present. Major security risk.");
      analysis.recommendations.push("Delete root access keys and use IAM roles.");
    }
    if (totalInstances > 10) {
      analysis.findings.push("Large number of EC2 instances running.");
      analysis.recommendations.push("Check for idle or oversized instances.");
    }

    if (analysis.findings.length === 0) {
      analysis.findings.push("No major risks detected.");
      analysis.recommendations.push("Maintain monthly monitoring to prevent drift.");
    }

    return analysis;

  } catch (err) {
    console.error("AWS analysis error:", err);
    return { error: err.toString() };
  }
}

module.exports = { analyzeAWS };

