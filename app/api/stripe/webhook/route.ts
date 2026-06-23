import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { finalizePaymentIntentById } from "@/lib/seal-finalize";

/**
 * Stripe webhook - a backstop that finalizes the on-chain seal even if the user
 * closes the tab before the success page runs. Idempotent with the success-page
 * path via PaymentIntent metadata. Requires STRIPE_WEBHOOK_SECRET.
 *
 * Configure the endpoint in the Stripe dashboard at:
 *   https://<your-domain>/api/stripe/webhook
 * subscribed to: checkout.session.completed
 */
export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured || !secret) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const piId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (piId) {
      const result = await finalizePaymentIntentById(piId);
      if (!result.ok) {
        // Log and let Stripe retry the webhook.
        console.error("Seal finalization failed in webhook:", result.error);
        return new Response(result.error, { status: 500 });
      }
    }
  }

  return Response.json({ received: true });
}
