const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const db = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  let body;
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch (err) {
    console.error("Error parsing body:", err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: "Invalid JSON format" }),
    };
  }

  try {
    const item = {
      assessmentId: { S: body.email || `anon-${Date.now()}` },
      timestamp: { S: new Date().toISOString() },
      responses: { S: JSON.stringify(body.answers) },
    };

    await db.send(
      new PutItemCommand({
        TableName: "AssessmentResponses",
        Item: item,
      })
    );

    console.log("Saved item:", item);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: "Responses saved successfully" }),
    };
  } catch (err) {
    console.error("Error saving to DynamoDB:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: "Failed to save responses" }),
    };
  }
};

