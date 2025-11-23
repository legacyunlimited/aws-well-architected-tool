const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });

const s3 = new AWS.S3();

async function uploadPDF(localPath, key) {
  const fileContent = fs.readFileSync(localPath);

  const params = {
    Bucket: process.env.REPORTS_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: "application/pdf"
  };

  await s3.putObject(params).promise();

  return s3.getSignedUrl("getObject", {
    Bucket: process.env.REPORTS_BUCKET,
    Key: key,
    Expires: 60 * 60 * 24 * 7 // 7 days
  });
}

module.exports = { uploadPDF };

