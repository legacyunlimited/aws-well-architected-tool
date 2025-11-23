const axios = require("axios");

async function updateGHL(contactId, reportUrl) {
  const token = process.env.GHL_PRIVATE_TOKEN;

  if (!token) {
    throw new Error("Missing GHL_PRIVATE_TOKEN");
  }

  const payload = {
    customFields: [
      {
        key: "aws_report_link",
        value: reportUrl
      }
    ]
  };

  try {
    const resp = await axios({
      method: "put",
      url: `https://services.leadconnectorhq.com/contacts/${contactId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Version": "2021-07-28"
      },
      data: payload
    });

    return resp.data;
  } catch (err) {
    console.error("❌ GHL Update Error:", err.response?.data || err);
    throw err;
  }
}

module.exports = { updateGHL };

