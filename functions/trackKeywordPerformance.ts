import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with tracked keywords
    const users = await base44.asServiceRole.entities.User.list();
    const usersWithTracked = users.filter(u => u.tracked_keywords?.length > 0);

    if (usersWithTracked.length === 0) {
      return Response.json({ 
        success: true, 
        message: "No tracked keywords found",
        snapshots_created: 0 
      });
    }

    let snapshotsCreated = 0;
    const now = new Date().toISOString();

    for (const user of usersWithTracked) {
      for (const keywordPhrase of user.tracked_keywords) {
        // Get current keyword data
        const keywords = await base44.asServiceRole.entities.keywords.filter({
          keyword_phrase: keywordPhrase
        });

        if (keywords.length === 0) continue;

        const keyword = keywords[0];

        // Create snapshot
        await base44.asServiceRole.entities.KeywordSnapshot.create({
          keyword_phrase: keywordPhrase,
          user_email: user.email,
          search_volume: keyword.search_volume || 0,
          competing_products: keyword.competing_products || 0,
          score: keyword.score || 0,
          title_density: keyword.title_density || 0,
          keyword_sales: keyword.keyword_sales || 0,
          snapshot_date: now
        });

        snapshotsCreated++;
      }
    }

    console.log(`Created ${snapshotsCreated} keyword snapshots for performance tracking`);

    return Response.json({
      success: true,
      snapshots_created: snapshotsCreated,
      users_processed: usersWithTracked.length
    });

  } catch (error) {
    console.error("Error tracking keyword performance:", error.message);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});