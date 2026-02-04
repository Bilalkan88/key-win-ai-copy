import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // معالجة CORS requests
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
    // 1️⃣ التحقق من method
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // 2️⃣ التحقق من API KEY (اختياري للاختبار)
    const VALID_API_KEY = Deno.env.get("N8N_API_KEY") || "67d9de747d014e0ba0028d7126a17807";
    
    const apiKey = req.headers.get("api_key");
    const bodyText = await req.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    
    // Debug: اطبع القيم
    console.log("API Key from Header:", apiKey);
    console.log("Valid API Key:", VALID_API_KEY);
    console.log("Body:", body);
    
    // التحقق من API key إذا تم توفيره
    if (apiKey && apiKey !== VALID_API_KEY) {
      return Response.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 });
    }

    // 3️⃣ التحقق من البيانات
    const { keywords } = body;

    if (!Array.isArray(keywords)) {
      return Response.json({ error: "keywords must be an array" }, { status: 400 });
    }

    if (keywords.length === 0) {
      return Response.json({ error: "keywords array is empty" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    // 4️⃣ Upsert صف صف
    for (const k of keywords) {
      if (!k.keyword_phrase) {
        errors++;
        continue;
      }

      try {
        // البحث عن keyword موجود
        const existing = await base44.asServiceRole.entities.keywords.filter({
          keyword_phrase: k.keyword_phrase
        });

        const data = {
          keyword_phrase: k.keyword_phrase,
          category: k.category || null,
          search_volume: Number(k.search_volume || 0),
          competing_products: Number(k.competing_products || 0),
          score: Number(k.score || 0),
          title_density: Number(k.title_density || 0),
          organic_rank: Number(k.organic_rank || 0),
          amazon_link: k.amazon_link || null,
          user_id: k.user_id || null
        };

        if (existing && existing.length > 0) {
          // Update existing
          await base44.asServiceRole.entities.keywords.update(existing[0].id, data);
          updated++;
        } else {
          // Insert new
          await base44.asServiceRole.entities.keywords.create(data);
          inserted++;
        }
      } catch (error) {
        console.error(`Error processing keyword: ${k.keyword_phrase}`, error);
        errors++;
      }
    }

    // 5️⃣ رد النجاح
    return Response.json({
      success: true,
      total: keywords.length,
      inserted,
      updated,
      errors
    });

  } catch (error) {
    console.error("Import error:", error);
    return Response.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
});