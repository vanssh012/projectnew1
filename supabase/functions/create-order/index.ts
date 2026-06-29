import { withSupabase } from "npm:@supabase/server"

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    try {
      const { amount, eventId } = await req.json();

      if (!amount || !eventId) {
        return Response.json({ error: "Missing amount or eventId" }, { status: 400 });
      }

      const authHeader = `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`;

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          amount: amount, // amount in paise
          currency: "INR",
          receipt: `receipt_${eventId}_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.description || "Failed to create Razorpay order");
      }

      return Response.json(data, { status: 200 });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  })
}
