import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, api_key"
      }
    });
  }

  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Verify API key
    const VALID_API_KEY = Deno.env.get("N8N_API_KEY");
    const apiKey = req.headers.get("api_key");

    if (apiKey && apiKey !== VALID_API_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const bodyText = await req.text();
    if (!bodyText) {
      return Response.json({ error: "Request body is empty" }, { status: 400 });
    }

    const body = JSON.parse(bodyText);
    const { keywords } = body;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return Response.json({ error: "keywords must be a non-empty array" }, { status: 400 });
    }

    // Clean and normalize keywords
    const keywordsClean = keywords
      .map(k => ({
        ...k,
        keyword_phrase: (k.keyword_phrase ?? k.Keyword_phrase ?? "").toString().trim()
      }))
      .filter(k => k.keyword_phrase);

    if (keywordsClean.length === 0) {
      return Response.json({ error: "No valid keywords after cleaning" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    // Upsert each keyword
    for (const keyword of keywords) {
      // Skip empty/invalid entries
      if (!keyword?.keyword_phrase || String(keyword.keyword_phrase).trim() === "") {
        errors++;
        console.warn("Skipped keyword with missing keyword_phrase");
        continue;
      }

      try {
        // Check if keyword exists
        const existing = await base44.asServiceRole.entities.keywords.filter({
          keyword_phrase: keyword.keyword_phrase
        });

        // Prepare keyword data
        const keywordData = {
          keyword_phrase: keyword.keyword_phrase,
          category: keyword.category || null,
          search_volume: Number(keyword.search_volume || 0),
          competing_products: Number(keyword.competing_products || 0),
          score: Number(keyword.score || 0),
          title_density: Number(keyword.title_density || 0),
          organic_rank: Number(keyword.organic_rank || 0),
          amazon_link: keyword.amazon_link || null,
          user_id: keyword.user_id || null
        };

        // Upsert logic
        if (Array.isArray(existing) && existing.length > 0) {
          // Update existing keyword
          await base44.asServiceRole.entities.keywords.update(existing[0].id, keywordData);
          updated++;
        } else {
          // Create new keyword
          await base44.asServiceRole.entities.keywords.create(keywordData);
          inserted++;
        }
      } catch (error) {
        console.error(`Failed to process keyword "${keyword.keyword_phrase}":`, error.message);
        errors++;
      }
    }

    return Response.json({
      success: true,
      total: keywords.length,
      inserted,
      updated,
      errors
    });

  } catch (error) {
    console.error("Import error:", error.message);
    return Response.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 });
  }
});