const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxmbYPEuVIRL_pb2BJxcjnli5UYyUe0M2kI6NedHk9bBu3FuYhex1lAuDYv1psACGL9/exec";

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

    const { name, email, company, tier } = session.metadata;

    // Record confirmed purchase in Google Sheet
    try {
      await fetch(GAS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          system: "buyer",
          name,
          company,
          email,
          product: `FI Lite — ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
          status: "Paid",
          notes: `Payment confirmed ${new Date().toISOString()} · Session: ${session_id}`,
        }),
      });
    } catch {
      // Non-fatal — access is still granted
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: true, name, email, company, tier }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
