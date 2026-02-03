import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      // Handle subscription payment
      if (session.mode === 'subscription') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await base44.asServiceRole.entities.Subscription.create({
          user_email: metadata.user_email,
          plan_type: metadata.plan_type,
          status: 'active',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        });

        console.log('Subscription created for:', metadata.user_email);
      }

      // Handle exclusive keyword purchase
      if (metadata.purchase_type === 'exclusive_keyword') {
        await base44.asServiceRole.entities.ExclusiveKeyword.update(metadata.keyword_id, {
          status: 'sold',
          sold_at: new Date().toISOString(),
          sold_to: metadata.user_email,
          stripe_payment_intent_id: session.payment_intent
        });

        console.log('Exclusive keyword sold:', metadata.keyword_id);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;

      const results = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (results.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(results[0].id, {
          status: 'canceled',
          canceled_at: new Date().toISOString()
        });

        console.log('Subscription canceled:', subscription.id);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;

      const results = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (results.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(results[0].id, {
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        });

        console.log('Subscription updated:', subscription.id);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});