import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    
    // Parse the incoming data from n8n
    const data = await req.json();

    // Validate required fields
    if (!data.total_keywords || !data.status) {
      return Response.json({ 
        error: 'Missing required fields: total_keywords and status are required' 
      }, { status: 400 });
    }

    // Store the analysis result in the database
    const result = await base44.asServiceRole.entities.AnalysisResult.create({
      product_category: data.product_category || null,
      total_keywords: data.total_keywords,
      profitable_keywords: data.profitable_keywords || 0,
      excluded_keywords: data.excluded_keywords || 0,
      filter_settings: data.filter_settings || {},
      results_data: data.results_data || [],
      excluded_data: data.excluded_data || [],
      status: data.status
    });

    return Response.json({ 
      success: true, 
      message: 'Analysis result saved successfully',
      id: result.id 
    }, { status: 200 });

  } catch (error) {
    console.error('Error saving analysis result:', error);
    return Response.json({ 
      error: 'Failed to save analysis result',
      details: error.message 
    }, { status: 500 });
  }
});