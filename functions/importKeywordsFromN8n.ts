import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const { keywords } = await req.json();

        if (!Array.isArray(keywords) || keywords.length === 0) {
            return Response.json({ error: 'Invalid data: keywords array required' }, { status: 400 });
        }

        console.log(`Importing ${keywords.length} keywords from n8n`);

        // Get current week in YYYY-WW format
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
        const currentWeek = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

        // Process and validate keywords
        const processedKeywords = keywords.map(kw => ({
            keyword_phrase: kw.keyword_phrase || kw.keyword,
            category: kw.category || 'General',
            search_volume: parseInt(kw.search_volume) || 0,
            competing_products: parseInt(kw.competing_products) || 0,
            title_density: parseFloat(kw.title_density) || 0,
            keyword_sales: parseInt(kw.keyword_sales) || 0,
            opportunity_score: parseInt(kw.opportunity_score) || 0,
            risk_level: kw.risk_level || 'medium',
            suggested_price_min: parseFloat(kw.suggested_price_min) || 0,
            suggested_price_max: parseFloat(kw.suggested_price_max) || 0,
            decision_indicator: kw.decision_indicator || 'caution',
            avg_competitor_reviews: parseInt(kw.avg_competitor_reviews) || 0,
            avg_competitor_rating: parseFloat(kw.avg_competitor_rating) || 0,
            avg_competitor_price: parseFloat(kw.avg_competitor_price) || 0,
            competitor_strength: kw.competitor_strength || 'medium',
            max_competitor_reviews: parseInt(kw.max_competitor_reviews) || 10000,
            beginner_friendly: kw.beginner_friendly === true || kw.beginner_friendly === 'true',
            week_added: currentWeek,
            is_new_this_week: true,
            amazon_link: kw.amazon_link || `https://www.amazon.com/s?k=${encodeURIComponent(kw.keyword_phrase || kw.keyword)}`
        }));

        // Bulk create keywords using service role
        const results = await base44.asServiceRole.entities.KeywordDatabase.bulkCreate(
            processedKeywords
        );

        console.log(`Successfully imported ${results.length} keywords`);

        return Response.json({
            success: true,
            imported: results.length,
            message: `Successfully imported ${results.length} keywords`
        });

    } catch (error) {
        console.error('Import error:', error);
        return Response.json({
            error: error.message || 'Failed to import keywords',
            details: error.stack
        }, { status: 500 });
    }
});