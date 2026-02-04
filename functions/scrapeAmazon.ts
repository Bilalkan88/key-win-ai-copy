import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, searchType, searchValue } = await req.json();
        const scraperApiKey = Deno.env.get("SCRAPERAPI_KEY");

        if (!scraperApiKey) {
            return Response.json({ error: 'ScraperAPI key not configured' }, { status: 500 });
        }

        let data = [];

        // Handle Products Search
        if (type === 'products' && searchType === 'keywords') {
            const url = 'https://api.scraperapi.com/structured/amazon/search';
            const params = new URLSearchParams({
                api_key: scraperApiKey,
                query: searchValue,
                s: 'price-asc-rank'
            });

            const response = await fetch(`${url}?${params.toString()}`);

            if (!response.ok) {
                console.error('ScraperAPI Error:', response.status, await response.text());
                return Response.json({ 
                    error: `ScraperAPI error: ${response.status}` 
                }, { status: 500 });
            }

            const result = await response.json();

            console.log('ScraperAPI Response:', JSON.stringify(result, null, 2));

            if (result.results && result.results.length > 0) {
                data = result.results.map(product => {
                    console.log('Processing product:', {
                        asin: product.asin,
                        name: product.name,
                        price: product.price,
                        price_string: product.price_string,
                        rating: product.rating,
                        reviews_count: product.reviews_count
                    });

                    return {
                        asin: product.asin || 'N/A',
                        title: product.name || 'No title',
                        price: product.price_string || (product.price ? `$${product.price}` : 'N/A'),
                        rating: parseFloat(product.rating) || 0,
                        reviews: parseInt(product.reviews_count) || 0,
                        image: product.image || '',
                        inStock: product.is_prime !== false,
                        bestseller: product.is_best_seller || false,
                        category: product.categories?.[0] || 'Electronics',
                        brand: product.brand || product.name?.split(' ')[0] || 'Unknown'
                    };
                });
            }
        }
        
        // Handle ASIN Product Search
        else if (type === 'products' && searchType === 'asin') {
            const url = 'https://api.scraperapi.com/structured/amazon/product';
            const params = new URLSearchParams({
                api_key: scraperApiKey,
                asin: searchValue
            });

            const response = await fetch(`${url}?${params.toString()}`);

            if (!response.ok) {
                console.error('ScraperAPI Error:', response.status, await response.text());
                return Response.json({ 
                    error: `ScraperAPI error: ${response.status}` 
                }, { status: 500 });
            }

            const product = await response.json();

            console.log('Single Product Response:', JSON.stringify(product, null, 2));

            if (product) {
                data = [{
                    asin: product.asin || searchValue,
                    title: product.name || 'No title',
                    price: product.price_string || (product.price ? `$${product.price}` : 'N/A'),
                    rating: parseFloat(product.rating) || 0,
                    reviews: parseInt(product.reviews_count) || 0,
                    image: product.images?.[0] || product.image || '',
                    inStock: product.in_stock !== false,
                    bestseller: product.is_best_seller || false,
                    category: product.categories?.[0] || 'Electronics',
                    brand: product.brand || product.name?.split(' ')[0] || 'Unknown'
                }];
            }
        }
        
        // Handle Reviews
        else if (type === 'reviews') {
            const asinMatch = searchValue.match(/\/dp\/([A-Z0-9]{10})/);
            const asin = asinMatch ? asinMatch[1] : searchValue;

            const url = 'https://api.scraperapi.com/structured/amazon/review';
            const params = new URLSearchParams({
                api_key: scraperApiKey,
                asin: asin
            });

            const response = await fetch(`${url}?${params.toString()}`);

            if (!response.ok) {
                console.error('ScraperAPI Error:', response.status, await response.text());
                return Response.json({ 
                    error: `ScraperAPI error: ${response.status}` 
                }, { status: 500 });
            }

            const result = await response.json();

            if (result.reviews && result.reviews.length > 0) {
                data = result.reviews.map(review => ({
                    rating: review.rating || 0,
                    title: review.title || 'No title',
                    author: review.author || 'Anonymous',
                    date: review.date || 'Unknown',
                    verified: review.is_verified || false,
                    text: review.body || 'No review text'
                }));
            }
        }
        
        // URL and Category not supported in structured API
        else {
            return Response.json({ 
                error: 'Search type not supported. Use Keywords or ASIN for products, or product URL for reviews.' 
            }, { status: 400 });
        }

        if (data.length === 0) {
            return Response.json({ 
                error: 'No results found for your search.',
                data: []
            }, { status: 200 });
        }

        return Response.json({ success: true, data });

    } catch (error) {
        console.error('Scraping error:', error);
        return Response.json({ 
            error: error.message || 'Failed to fetch data',
            details: error.stack
        }, { status: 500 });
    }
});