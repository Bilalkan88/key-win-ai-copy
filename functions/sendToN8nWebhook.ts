import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return Response.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    // Prepare the complete payload
    const webhookPayload = {
      user_id: user.id,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      analysis: {
        product_category: payload.product_category || null,
        total_keywords: payload.total_keywords,
        profitable_keywords: payload.profitable_keywords,
        excluded_keywords: payload.excluded_keywords,
        status: payload.status
      },
      filter_settings: payload.filter_settings,
      results_data: payload.results_data,
      excluded_data: payload.excluded_data
    };

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret ? { 'x-webhook-secret': webhookSecret } : {})
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    return Response.json({ 
      success: true, 
      message: 'Analysis results sent to webhook successfully' 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: 'Failed to send to webhook',
      details: error.message 
    }, { status: 500 });
  }
});