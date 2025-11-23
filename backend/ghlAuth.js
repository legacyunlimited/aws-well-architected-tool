const axios = require("axios");
const AWS = require("aws-sdk");

async function refreshTokenIfNeeded() {
  const accessToken = process.env.GHL_ACCESS_TOKEN;
  const refreshToken = process.env.GHL_REFRESH_TOKEN;
  const clientId = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;

  try {
    await axios.get("https://services.leadconnectorhq.com/locations", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        Accept: "application/json"
      }
    });

    return accessToken;
  } catch (err) {
    if (err.response?.status !== 401) {
      console.error("Unexpected GHL error:", err.response?.data || err);
      throw err;
    }

    const resp = await axios.post(
      "https://services.leadconnectorhq.com/oauth/token",
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        redirect_uri: "https://localhost"
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const newAccess = resp.data.access_token;
    const newRefresh = resp.data.refresh_token;

    await updateLambdaEnv(newAccess, newRefresh);

    return newAccess;
  }
}

async function updateLambdaEnv(access, refresh) {
  const lambda = new AWS.Lambda();

  const current = await lambda
    .getFunctionConfiguration({
      FunctionName: "KBCloudSolutionsReportGenerator"
    })
    .promise();

  const newVars = current.Environment.Variables;
  newVars.GHL_ACCESS_TOKEN = access;
  newVars.GHL_REFRESH_TOKEN = refresh;

  await lambda
    .updateFunctionConfiguration({
      FunctionName: "KBCloudSolutionsReportGenerator",
      Environment: { Variables: newVars }
    })
    .promise();
}

module.exports = { refreshTokenIfNeeded };

