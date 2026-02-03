import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyword_id } = await req.json();

    const keywords = await base44.entities.ExclusiveKeyword.filter({ id: keyword_id });
    const keyword = keywords[0];

    if (!keyword) {
      return Response.json({ error: 'Keyword not found' }, { status: 404 });
    }

    if (keyword.status !== 'available') {
      return Response.json({ error: 'Keyword not available' }, { status: 400 });
    }

    // Check for Pro+ discount
    const subscriptions = await base44.entities.Subscription.filter({ 
      user_email: user.email, 
      status: 'active' 
    });
    const hasProPlus = subscriptions.length > 0 && subscriptions[0].plan_type === 'pro_plus';
    const finalPrice = hasProPlus ? keyword.price * 0.5 : keyword.price;

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(finalPrice * 100),
            product_data: {
              name: `Exclusive Keyword: ${keyword.keyword_phrase}`,
              description: `Score: ${keyword.opportunity_score} | Volume: ${keyword.search_volume}`
            }
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}?exclusive_purchase_success=true`,
      cancel_url: `${req.headers.get('origin')}/exclusive-keywords?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        keyword_id: keyword.id,
        user_email: user.email,
        purchase_type: 'exclusive_keyword'
      }
    });

    return Response.json({ checkout_url: session.url });
  } catch (error) {
    console.error('Exclusive checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});