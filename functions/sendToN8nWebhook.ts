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

    console.log('🚀 Preparing to send webhook to n8n');
    console.log('Webhook URL:', webhookUrl);
    console.log('User:', user.email);
    console.log('Analysis data:', {
      total_keywords: payload.total_keywords,
      profitable: payload.profitable_keywords,
      excluded: payload.excluded_keywords
    });

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

    // Retry logic: 3 attempts with delays
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📡 Attempt ${attempt}/3: Sending to n8n webhook...`);
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(webhookSecret ? { 'x-webhook-secret': webhookSecret } : {})
          },
          body: JSON.stringify(webhookPayload)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('❌ Webhook response error:', errorBody);
          throw new Error(`Webhook failed with status ${response.status}: ${errorBody}`);
        }

        const responseData = await response.text();
        console.log('✅ Webhook sent successfully!');
        console.log('Response:', responseData);

        return Response.json({ 
          success: true, 
          message: 'Analysis results sent to n8n webhook successfully',
          attempt: attempt
        });

      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          const delay = attempt * 1000; // 1s, 2s delays
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error('❌ All 3 webhook attempts failed');
    return Response.json({ 
      error: 'Failed to send to n8n webhook after 3 attempts',
      details: lastError.message 
    }, { status: 500 });

  } catch (error) {
    console.error('💥 Webhook function error:', error);
    return Response.json({ 
      error: 'Failed to send to webhook',
      details: error.message 
    }, { status: 500 });
  }
});