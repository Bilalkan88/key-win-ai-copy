import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');

    if (!webhookUrl) {
      return Response.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 });
    }

    const payload = await req.json();

    // Prepare the data to send to n8n
    const webhookPayload = {
      user_id: user.id,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      analysis: {
        product_category: payload.product_category || 'Not specified',
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
    const headers = {
      'Content-Type': 'application/json'
    };

    if (webhookSecret) {
      headers['x-webhook-secret'] = webhookSecret;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    return Response.json({ 
      success: true, 
      message: 'Data sent to n8n webhook successfully' 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});