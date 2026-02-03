import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!webhookUrl) {
      return Response.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 });
    }

    // Trigger n8n webhook to get new keywords
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'fetch_weekly_keywords',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to trigger webhook');
    }

    const newKeywords = await response.json();

    // Get current week in YYYY-WW format
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekString = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;

    // Mark all existing keywords as not new
    const existingKeywords = await base44.asServiceRole.entities.KeywordDatabase.list();
    for (const keyword of existingKeywords) {
      if (keyword.is_new_this_week) {
        await base44.asServiceRole.entities.KeywordDatabase.update(keyword.id, {
          is_new_this_week: false
        });
      }
    }

    // Add new keywords
    const keywordsToAdd = newKeywords.map(k => ({
      ...k,
      week_added: weekString,
      is_new_this_week: true
    }));

    await base44.asServiceRole.entities.KeywordDatabase.bulkCreate(keywordsToAdd);

    console.log(`Added ${keywordsToAdd.length} new keywords for week ${weekString}`);

    return Response.json({ 
      success: true, 
      added: keywordsToAdd.length,
      week: weekString 
    });
  } catch (error) {
    console.error('Weekly update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});