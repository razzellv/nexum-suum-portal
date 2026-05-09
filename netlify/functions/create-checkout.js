const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  boiler:   "price_1SzoS9Dfw4bOR2dfaWJ6UqkB",
  chiller:  "price_1SzoSoDfw4bOR2dfTqTf3dJN",
  facility: "price_1SzoTkDfw4bOR2dfFzvTjft8",
};

const ORIGIN = process.env.URL || "https://nexum-suum-portal.netlify.app";

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

  const { name, email, company, tier } = body;

  if (!name || !email || !company || !tier || !PRICE_IDS[tier]) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
      mode: "payment",
      customer_email: email,
      metadata: { name, email, company, tier },
      success_url: `${ORIGIN}/success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ORIGIN}/`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
