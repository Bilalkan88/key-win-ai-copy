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

    // Use AI to generate new keyword ideas with comprehensive analysis
    const prompt = `You are an Amazon keyword research and competitive analysis expert. Based on these existing high-performing keywords:

${existingKeywords.slice(0, 10).join('\n')}

Generate ${count} NEW keyword ideas with COMPREHENSIVE ANALYSIS for each:

1. Basic Keyword Data:
   - keyword_phrase: Related to the category, 2-5 words, NOT duplicates
   - category: "${category || 'infer from keywords'}"
   - search_volume: Realistic Amazon numbers (500-50000)
   - competing_products: Realistic count (100-5000)
   - title_density: Percentage (0-100)
   - keyword_sales: Estimated monthly sales
   - score: Opportunity score (0-100)

2. Advanced Analysis:
   - profitability_score: (0-100) Based on search volume vs competition ratio, estimated profit margins
   - seo_difficulty: "easy", "medium", or "hard" - how difficult to rank for this keyword
   - ctr_estimate: Click-through rate percentage (1-15) - estimated CTR on Amazon
   - confidence_score: (0-100) Your confidence in this keyword's success potential

3. Competitor Analysis:
   - competitor_analysis: {
       top_competitors: [
         {
           product_name: "Example Product Name",
           strengths: ["High reviews", "Low price", "Prime eligible"],
           weaknesses: ["Poor images", "Limited features", "Bad descriptions"]
         }
       ] (3-5 competitors),
       market_gap: "Identified opportunity in the market",
       recommendation: "Strategic advice for entering this market"
     }

Analyze each keyword thoroughly considering:
- Profit potential vs market saturation
- Buyer intent and conversion likelihood
- Competition strength and market gaps
- Real competitor products and their positioning

Return ONLY valid JSON with no markdown.`;

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
                keyword_sales: { type: "number" },
                profitability_score: { type: "number" },
                seo_difficulty: { type: "string" },
                ctr_estimate: { type: "number" },
                confidence_score: { type: "number" },
                competitor_analysis: {
                  type: "object",
                  properties: {
                    top_competitors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          product_name: { type: "string" },
                          strengths: { type: "array", items: { type: "string" } },
                          weaknesses: { type: "array", items: { type: "string" } }
                        }
                      }
                    },
                    market_gap: { type: "string" },
                    recommendation: { type: "string" }
                  }
                }
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