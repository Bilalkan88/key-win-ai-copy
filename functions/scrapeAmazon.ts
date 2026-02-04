import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as cheerio from 'npm:cheerio@1.0.0';

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

        let targetUrl = '';
        let data = [];

        // Build target URL based on search type
        if (type === 'products') {
            if (searchType === 'keywords') {
                targetUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchValue)}`;
            } else if (searchType === 'asin') {
                targetUrl = `https://www.amazon.com/dp/${searchValue}`;
            } else if (searchType === 'url' || searchType === 'category') {
                targetUrl = searchValue;
            }
        } else if (type === 'reviews') {
            // Extract ASIN from URL if needed
            const asinMatch = searchValue.match(/\/dp\/([A-Z0-9]{10})/);
            const asin = asinMatch ? asinMatch[1] : searchValue;
            targetUrl = `https://www.amazon.com/product-reviews/${asin}`;
        }

        // Call ScraperAPI
        const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(scraperUrl);

        if (!response.ok) {
            return Response.json({ 
                error: `ScraperAPI error: ${response.status} ${response.statusText}` 
            }, { status: 500 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Parse products
        if (type === 'products') {
            if (searchType === 'keywords' || searchType === 'category' || searchType === 'url') {
                // Parse search results
                $('div[data-component-type="s-search-result"]').each((i, elem) => {
                    const $elem = $(elem);
                    const asin = $elem.attr('data-asin');
                    const title = $elem.find('h2 a span').text().trim();
                    const priceWhole = $elem.find('.a-price-whole').first().text().trim();
                    const priceFraction = $elem.find('.a-price-fraction').first().text().trim();
                    const price = priceWhole && priceFraction ? `$${priceWhole}${priceFraction}` : 'N/A';
                    const rating = $elem.find('.a-icon-star-small .a-icon-alt').text().trim().split(' ')[0] || 'N/A';
                    const reviews = $elem.find('span[aria-label*="stars"]').parent().parent().find('span').last().text().trim().replace(/[(),]/g, '') || '0';
                    const image = $elem.find('.s-image').attr('src') || '';
                    const bestseller = $elem.find('.a-badge-text').text().includes('Best Seller');

                    if (asin && title) {
                        data.push({
                            asin,
                            title,
                            price,
                            rating: rating !== 'N/A' ? parseFloat(rating) : 0,
                            reviews: parseInt(reviews) || 0,
                            image,
                            inStock: true,
                            bestseller,
                            category: 'Electronics',
                            brand: title.split(' ')[0]
                        });
                    }
                });
            } else if (searchType === 'asin') {
                // Parse single product page
                const title = $('#productTitle').text().trim();
                const priceWhole = $('.a-price-whole').first().text().trim();
                const priceFraction = $('.a-price-fraction').first().text().trim();
                const price = priceWhole && priceFraction ? `$${priceWhole}${priceFraction}` : 'N/A';
                const rating = $('.a-icon-star .a-icon-alt').first().text().trim().split(' ')[0] || 'N/A';
                const reviews = $('span[data-hook="total-review-count"]').text().trim().replace(/[(),]/g, '') || '0';
                const image = $('#landingImage').attr('src') || '';
                const asin = searchValue;
                const inStock = $('#availability span').text().includes('In Stock');

                data.push({
                    asin,
                    title,
                    price,
                    rating: rating !== 'N/A' ? parseFloat(rating) : 0,
                    reviews: parseInt(reviews) || 0,
                    image,
                    inStock,
                    bestseller: false,
                    category: 'Electronics',
                    brand: title.split(' ')[0]
                });
            }
        }

        // Parse reviews
        if (type === 'reviews') {
            $('div[data-hook="review"]').each((i, elem) => {
                const $elem = $(elem);
                const ratingText = $elem.find('.review-rating .a-icon-alt').text().trim();
                const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : 0;
                const title = $elem.find('a[data-hook="review-title"] span').last().text().trim();
                const author = $elem.find('.a-profile-name').text().trim();
                const dateText = $elem.find('span[data-hook="review-date"]').text().trim();
                const date = dateText.replace('Reviewed in the United States on ', '');
                const text = $elem.find('span[data-hook="review-body"] span').text().trim();
                const verified = $elem.find('span[data-hook="avp-badge"]').length > 0;

                if (title || text) {
                    data.push({
                        rating,
                        title: title || text.substring(0, 50) + '...',
                        author: author || 'Anonymous',
                        date,
                        verified,
                        text: text || 'No review text'
                    });
                }
            });
        }

        // If no data found, return error
        if (data.length === 0) {
            return Response.json({ 
                error: 'No data found. The page structure may have changed or no results were found.',
                data: []
            }, { status: 200 });
        }

        return Response.json({ success: true, data });

    } catch (error) {
        console.error('Scraping error:', error);
        return Response.json({ 
            error: error.message || 'Failed to scrape data',
            details: error.stack
        }, { status: 500 });
    }
});