import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { spreadsheetId, range } = await req.json();

        if (!spreadsheetId || !range) {
            return Response.json({ 
                error: 'Missing required parameters: spreadsheetId and range' 
            }, { status: 400 });
        }

        // Get Google Sheets access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

        // Fetch data from Google Sheets
        const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
        const response = await fetch(sheetsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Sheets API Error:', errorText);
            return Response.json({ 
                error: `Google Sheets API error: ${response.status}`,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        const rows = data.values || [];

        if (rows.length === 0) {
            return Response.json({ keywords: [] });
        }

        // First row is headers
        const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        
        // Convert rows to objects
        const keywords = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                const value = row[index] || '';
                
                // Parse numeric values
                if (header.includes('volume') || header.includes('products') || 
                    header.includes('score') || header.includes('sales') || 
                    header.includes('reviews') || header.includes('price')) {
                    obj[header] = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
                } 
                // Parse boolean
                else if (header.includes('friendly') || header.includes('new')) {
                    obj[header] = value.toLowerCase() === 'true' || value === '1';
                }
                // String values
                else {
                    obj[header] = value;
                }
            });
            return obj;
        });

        return Response.json({ keywords, total: keywords.length });

    } catch (error) {
        console.error('Error reading Google Sheets:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});