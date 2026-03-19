import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

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
        // 1. Mark keyword as sold in Base44 / Supabase
        await base44.asServiceRole.entities.ExclusiveKeyword.update(metadata.keyword_id, {
          status: 'sold',
          sold_at: new Date().toISOString(),
          sold_to: metadata.user_email,
          stripe_payment_intent_id: session.payment_intent
        });

        console.log('Exclusive keyword sold:', metadata.keyword_id);

        // 2. Automated PDF Delivery Logic
        try {
          // Initialize Supabase admin client for secure access
          const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') || 'https://nqgdzfsydjvshisncuzc.supabase.co',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
          );

          // Get Keyword details including PDF info
          const { data: kwData, error: kwError } = await supabaseAdmin
            .from('exclusive_keywords')
            .select('keyword_phrase, report_pdf_url, report_pdf_name')
            .eq('id', metadata.keyword_id)
            .single();

          if (!kwError && kwData && kwData.report_pdf_url) {
            // Check delivery records to prevent duplicate emails
            const { data: deliveryRecord } = await supabaseAdmin
              .from('delivery_records')
              .select('id')
              .eq('order_id', session.id)
              .maybeSingle();

            if (!deliveryRecord) {
              // Generate signed URL valid for 7 days (604800 seconds)
              const { data: signedUrlData, error: urlError } = await supabaseAdmin
                .storage
                .from('keyword_reports')
                .createSignedUrl(kwData.report_pdf_url, 604800);

              if (!urlError && signedUrlData) {
                // Send email via Resend
                const resendApiKey = Deno.env.get('RESEND_API_KEY');
                if (resendApiKey) {
                  const resend = new Resend(resendApiKey);
                  const downloadUrl = signedUrlData.signedUrl;

                  await resend.emails.send({
                    from: 'Vetted Niche <support@vettedniche.com>', // Replace with your verified sender
                    to: metadata.user_email,
                    subject: `Your Exclusive Report for: ${kwData.keyword_phrase}`,
                    html: `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Thank you for your purchase!</h2>
                        <p>Your exclusive keyword listing for <strong>${kwData.keyword_phrase}</strong> has been secured.</p>
                        <p>As promised, you can download your confidential Keyword Report (PDF) using the link below. This secure link will remain active for 7 days.</p>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${downloadUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Download Confidential Report
                          </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:<br/>
                        <a href="${downloadUrl}" style="word-break: break-all;">${downloadUrl}</a></p>
                        <p>Order Reference: ${session.id}</p>
                      </div>
                    `
                  });

                  // Log delivery to prevent duplicates
                  await supabaseAdmin.from('delivery_records').insert({
                    order_id: session.id,
                    keyword_id: metadata.keyword_id,
                    buyer_email: metadata.user_email
                  });

                  console.log('PDF Report email sent successfully to', metadata.user_email);
                } else {
                  console.warn('RESEND_API_KEY is not configured. Email not sent.');
                }
              } else {
                console.error('Failed to generate signed URL:', urlError);
              }
            } else {
              console.log('Email already sent for this order, skipping delivery.');
            }
          }
        } catch (deliveryError) {
          console.error('Error in PDF Delivery flow:', deliveryError);
        }
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