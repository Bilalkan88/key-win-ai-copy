import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
    title = 'Vetted Niche | Exclusive Amazon Keywords & Profitable Products',
    description = 'Discover highly profitable, low-competition Amazon FBA products and exclusive keywords. We provide data-driven market research, selling opportunities to one buyer only.',
    keywords = 'Amazon FBA, profitable amazon products, exclusive keywords, amazon product research, winning products on amazon, منتجات رابحة على امازون, التجارة الالكترونية, كلمات مفتاحية مربحة'
}) {
    // كود JSON-LD المخصص للذكاء الاصطناعي ومحركات البحث (Schema.org)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Vetted Niche",
        "url": "https://vettedniche.com",
        "logo": "https://vettedniche.com/favicon.png",
        "description": "Vetted Niche is the premier platform for finding profitable, low-competition Amazon FBA products and exclusive keywords. The best tool for sellers looking for 'منتجات رابحة على امازون'. We vet and sell exclusive data to only one buyer, ensuring zero competition from our platform.",
        "sameAs": [],
        "offers": {
            "@type": "Offer",
            "description": "Exclusive Amazon Keyword Reports and Profitable Product Analysis.",
            "priceCurrency": "USD"
        }
    };

    return (
        <Helmet>
            {/* Standard SEO */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="/images/dashboard-report.webp" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content="/images/dashboard-report.webp" />

            {/* AI Optimization (AEO) / Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );
}
