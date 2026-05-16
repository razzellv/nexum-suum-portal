const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { session_id } = body;
  if (!session_id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing session_id" }) };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return {
        statusCode: 402,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Payment not completed" }),
      };
    }

    const { name, email, company, tier } = session.metadata || {};
    const customerEmail = email || session.customer_email || session.customer_details?.email || "";
    const customerName = name || session.customer_details?.name || "";

    let tempPassword = null;

    // Optionally provision Cognito user
    const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
    if (userPoolId && customerEmail) {
      try {
        const {
          CognitoIdentityProviderClient,
          AdminCreateUserCommand,
        } = require("@aws-sdk/client-cognito-identity-provider");

        const cognito = new CognitoIdentityProviderClient({
          region: process.env.AWS_REGION || "us-east-2",
        });

        tempPassword = `FI-${Math.random().toString(36).slice(2, 8).toUpperCase()}!`;

        await cognito.send(
          new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: customerEmail,
            TemporaryPassword: tempPassword,
            UserAttributes: [
              { Name: "email", Value: customerEmail },
              { Name: "email_verified", Value: "true" },
              { Name: "name", Value: customerName },
              { Name: "custom:tier", Value: tier || "boiler" },
              { Name: "custom:company", Value: company || "" },
            ],
            MessageAction: "SUPPRESS",
          })
        );
      } catch (cogErr) {
        // User may already exist — update tier attribute
        try {
          const {
            CognitoIdentityProviderClient,
            AdminUpdateUserAttributesCommand,
          } = require("@aws-sdk/client-cognito-identity-provider");

          const cognito = new CognitoIdentityProviderClient({
            region: process.env.AWS_REGION || "us-east-2",
          });

          await cognito.send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: userPoolId,
              Username: customerEmail,
              UserAttributes: [{ Name: "custom:tier", Value: tier || "boiler" }],
            })
          );
          tempPassword = null; // Existing user — no temp password
        } catch {
          // Ignore — don't fail the purchase confirmation
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        paid: true,
        name: customerName,
        email: customerEmail,
        company: company || "",
        tier: tier || "boiler",
        tempPassword,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
