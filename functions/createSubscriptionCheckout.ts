import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_IDS = {
  'basic': 'price_1TLAJlFeA3MnjFQUe5KOTUSw', // Updated to the provided ID
  'pro': 'price_1TLAJlFeA3MnjFQUe5KOTUSw',   // Updated to the provided ID
  'pro_plus': 'price_1TLAJlFeA3MnjFQUe5KOTUSw' // Updated to the provided ID
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { plan_type } = await req.json();

    if (!PRICE_IDS[plan_type]) {
      return Response.json({ error: 'Invalid plan type' }, { status: 400, headers: corsHeaders });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan_type],
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}?subscription_success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan_type: plan_type,
        user_email: user.email
      }
    });

    return Response.json({ checkout_url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});