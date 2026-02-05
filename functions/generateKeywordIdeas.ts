import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, count = 10, basedOnKeywords } = await req.json();

    // Fetch existing keywords for context
    let existingKeywords = [];
    if (basedOnKeywords && basedOnKeywords.length > 0) {
      existingKeywords = basedOnKeywords;
    } else {
      const allKeywords = await base44.entities.keywords.list('-search_volume', 50);
      existingKeywords = allKeywords
        .filter(k => !category || k.category === category)
        .slice(0, 20)
        .map(k => k.keyword_phrase);
    }

    if (existingKeywords.length === 0) {
      return Response.json({ 
        error: 'No existing keywords found to base new ideas on' 
      }, { status: 400 });
    }

    console.log(`[generateKeywordIdeas] Generating ${count} keywords based on ${existingKeywords.length} existing keywords`);

    // Use AI to generate new keyword ideas
    const prompt = `You are an Amazon keyword research expert. Based on these existing high-performing keywords:

${existingKeywords.slice(0, 10).join('\n')}

Generate ${count} NEW keyword ideas that:
1. Are related to the same product category
2. Have good commercial intent for Amazon sellers
3. Are specific enough to target (2-5 words typically)
4. Would likely have decent search volume
5. Are NOT exact duplicates of the provided keywords

For each keyword, estimate:
- Monthly search volume (realistic Amazon numbers: 500-50000)
- Number of competing products (realistic: 100-5000)
- Title density percentage (0-100)
- Category (if provided: "${category || 'infer from keywords'}")
- Opportunity score (0-100, higher is better)

Return ONLY valid JSON array with no markdown formatting.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword_phrase: { type: "string" },
                category: { type: "string" },
                search_volume: { type: "number" },
                competing_products: { type: "number" },
                title_density: { type: "number" },
                score: { type: "number" },
                keyword_sales: { type: "number" }
              }
            }
          }
        }
      }
    });

    const generatedKeywords = result.keywords || [];

    console.log(`[generateKeywordIdeas] Generated ${generatedKeywords.length} keyword ideas`);

    // Add Amazon links and clean data
    const keywordsWithLinks = generatedKeywords.map(k => ({
      ...k,
      amazon_link: `https://www.amazon.com/s?k=${encodeURIComponent(k.keyword_phrase)}`,
      user_id: user.id,
      keyword_sales: k.keyword_sales || Math.floor(k.search_volume * 0.02) // Estimate 2% conversion
    }));

    // Insert into database (skip duplicates)
    let inserted = 0;
    let skipped = 0;

    for (const keyword of keywordsWithLinks) {
      try {
        const existing = await base44.entities.keywords.filter({
          keyword_phrase: keyword.keyword_phrase
        });

        if (existing.length === 0) {
          await base44.entities.keywords.create(keyword);
          inserted++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Failed to insert "${keyword.keyword_phrase}":`, error.message);
        skipped++;
      }
    }

    console.log(`[generateKeywordIdeas] Inserted: ${inserted}, Skipped: ${skipped}`);

    return Response.json({
      success: true,
      generated: generatedKeywords.length,
      inserted,
      skipped,
      keywords: keywordsWithLinks
    });

  } catch (error) {
    console.error('[generateKeywordIdeas] Error:', error.message);
    return Response.json({ 
      error: 'Failed to generate keywords', 
      details: error.message 
    }, { status: 500 });
  }
});