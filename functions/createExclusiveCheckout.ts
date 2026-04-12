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

    const { keyword_id, keyword_ids } = await req.json();
    const idsToProcess = keyword_ids || (keyword_id ? [keyword_id] : []);

    if (idsToProcess.length === 0) {
      return Response.json({ error: 'No keywords provided' }, { status: 400 });
    }

    const selectedKeywords = [];
    for (const kId of idsToProcess) {
      const results = await base44.entities.ExclusiveKeyword.filter({ id: kId });
      if (results.length > 0 && results[0].status === 'available') {
        selectedKeywords.push(results[0]);
      }
    }

    if (selectedKeywords.length === 0) {
      return Response.json({ error: 'Keywords not found or not available' }, { status: 404 });
    }

    // Check for Pro+ discount
    const subscriptions = await base44.entities.Subscription.filter({ 
      user_email: user.email, 
      status: 'active' 
    });
    const hasProPlus = subscriptions.length > 0 && subscriptions[0].plan_type === 'pro_plus';

    const line_items = selectedKeywords.map(keyword => {
      const finalPrice = hasProPlus ? keyword.price * 0.5 : keyword.price;
      return {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(finalPrice * 100),
          product_data: {
            name: `Exclusive Keyword: ${keyword.keyword_phrase}`,
            description: `Score: ${keyword.opportunity_score} | Volume: ${keyword.search_volume}`
          }
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: line_items,
      success_url: `${req.headers.get('origin')}?exclusive_purchase_success=true`,
      cancel_url: `${req.headers.get('origin')}/ExclusiveKeywords?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID") || '',
        keyword_ids: selectedKeywords.map(k => k.id).join(','),
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