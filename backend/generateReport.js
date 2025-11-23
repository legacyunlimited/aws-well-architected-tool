const PDFDocument = require("pdfkit");
const fs = require("fs");

async function generatePDF(reportData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(22).text("AWS Health Check Report", { underline: true });
      doc.moveDown();

      doc.fontSize(14).text(`Client: ${reportData.clientName || "Client"}`);
      doc.text(`AWS Account ID: ${reportData.accountId || "Unknown"}`);
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      doc.moveDown();

      // Cost
      doc.fontSize(18).text("Monthly AWS Cost");
      doc.fontSize(14).text(`$${reportData.cost || 0}`);
      doc.moveDown();

      // Findings
      doc.fontSize(18).text("Key Findings");
      (reportData.findings || []).forEach(f => {
        doc.fontSize(12).text(`• ${f}`);
      });
      doc.moveDown();

      // Recommendations
      doc.fontSize(18).text("Recommendations");
      (reportData.recommendations || []).forEach(r => {
        doc.fontSize(12).text(`• ${r}`);
      });

      doc.end();

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePDF };

