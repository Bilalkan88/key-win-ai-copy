import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MINIMUM_MATCH_LEVEL = 90;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { products } = await req.json();

    if (!products || !Array.isArray(products)) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const product of products) {
      try {
        const { sku, name, description, colour, size, lineNumber } = product;

        if (!sku || !name) {
          errors.push({
            lineNumber,
            sku: sku || 'N/A',
            message: 'Missing SKU or Name'
          });
          continue;
        }

        // Search Amazon for the product
        const searchResult = await searchAmazon(name);

        if (!searchResult.success) {
          errors.push({
            lineNumber,
            sku,
            message: searchResult.error || 'No match found'
          });
          continue;
        }

        // Try to match with description, colour, size
        const asin = await extractASIN(searchResult.url, description, colour, size);

        if (asin) {
          results.push({
            sku,
            name,
            asin
          });
        } else {
          errors.push({
            lineNumber,
            sku,
            message: 'ASIN not found or mismatch in colour/size'
          });
        }

      } catch (error) {
        errors.push({
          lineNumber: product.lineNumber,
          sku: product.sku,
          message: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results,
      errors
    });

  } catch (error) {
    console.error('Error in scrapeAmazonAsins:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function searchAmazon(searchTerm) {
  try {
    // IMPORTANT: Direct scraping of Amazon is blocked
    // You need to use a scraping API service like:
    // - RainforestAPI: https://www.rainforestapi.com/
    // - ScraperAPI: https://www.scraperapi.com/
    // - Bright Data: https://brightdata.com/
    
    // Example with RainforestAPI (requires API key in secrets):
    // const apiKey = Deno.env.get("RAINFOREST_API_KEY");
    // const url = `https://api.rainforestapi.com/request?api_key=${apiKey}&type=search&amazon_domain=amazon.co.uk&search_term=${encodeURIComponent(searchTerm)}`;
    
    // For now, return mock data to show structure
    console.log('Searching Amazon for:', searchTerm);
    
    // This is a placeholder - replace with actual API call
    return {
      success: true,
      url: `https://www.amazon.co.uk/dp/B08N5WRWNW`, // Mock ASIN
      title: searchTerm,
      matchLevel: 95
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function extractASIN(url, description, colour, size) {
  try {
    // Extract ASIN from URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (asinMatch) {
      return asinMatch[1];
    }

    // If we need to fetch the page and extract from variations
    // This would require a scraping API service
    
    return null;
  } catch (error) {
    console.error('Error extracting ASIN:', error);
    return null;
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}