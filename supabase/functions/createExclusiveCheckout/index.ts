import { createClient } from 'npm:@supabase/supabase-js';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const bodyText = await req.text();
    const reqBody = bodyText ? JSON.parse(bodyText) : {};
    
    // Auth fallback for Standalone frontend
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    const userEmail = user?.email || reqBody.user_email;

    if (!userEmail) {
      return Response.json({ error: 'Unauthorized and missing email' }, { status: 401, headers: corsHeaders });
    }

    const { keyword_id, keyword_ids } = reqBody;
    const idsToProcess = keyword_ids || (keyword_id ? [keyword_id] : []);

    if (idsToProcess.length === 0) {
      return Response.json({ error: 'No keywords provided' }, { status: 400, headers: corsHeaders });
    }

    const selectedKeywords = [];
    for (const kId of idsToProcess) {
      const { data: results } = await supabaseClient
        .from('exclusive_keywords')
        .select('*')
        .eq('id', kId);
      
      if (results && results.length > 0 && results[0].status === 'available') {
        selectedKeywords.push(results[0]);
      }
    }

    if (selectedKeywords.length === 0) {
      return Response.json({ error: 'Keywords not found or not available' }, { status: 404, headers: corsHeaders });
    }

    // Check for Pro+ discount
    const { data: subscriptions } = await supabaseClient
      .from('subscriptions')
      .select('plan_type')
      .eq('user_email', userEmail)
      .eq('status', 'active');
      
    const hasProPlus = subscriptions && subscriptions.length > 0 && subscriptions[0].plan_type === 'pro_plus';

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
      customer_email: userEmail,
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: line_items,
      success_url: `${req.headers.get('origin')}/ExclusiveKeywords?exclusive_purchase_success=true`,
      cancel_url: `${req.headers.get('origin')}/ExclusiveKeywords?canceled=true`,
      metadata: {
        keyword_ids: selectedKeywords.map(k => k.id).join(','),
        user_email: userEmail,
        purchase_type: 'exclusive_keyword'
      }
    });

    return Response.json({ checkout_url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error('Exclusive checkout error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});