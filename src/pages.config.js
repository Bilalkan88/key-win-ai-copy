import React from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

export const PAGES = {
    "AboutUs": React.lazy(() => import('./pages/AboutUs.jsx')),
    "AdminDashboard": React.lazy(() => import('./pages/AdminDashboard.jsx')),
    "AmazonScraper": React.lazy(() => import('./pages/AmazonScraper.jsx')),
    "AmazonSellerToolkit": React.lazy(() => import('./pages/AmazonSellerToolkit.jsx')),
    "Analysis": React.lazy(() => import('./pages/Analysis.jsx')),
    "Auth": React.lazy(() => import('./pages/Auth.jsx')),
    "Blog": React.lazy(() => import('./pages/Blog.jsx')),
    "Contact": React.lazy(() => import('./pages/Contact.jsx')),
    "ExclusiveKeywords": React.lazy(() => import('./pages/ExclusiveKeywords.jsx')),
    "FbaProfitCalculator": React.lazy(() => import('./pages/FbaProfitCalculator.jsx')),
    "Home": Home,
    "KeywordDatabase": React.lazy(() => import('./pages/KeywordDatabase.jsx')),
    "KeywordDetails": React.lazy(() => import('./pages/KeywordDetails.jsx')),
    "Pricing": React.lazy(() => import('./pages/Pricing.jsx')),
    "PrivacyPolicy": React.lazy(() => import('./pages/PrivacyPolicy.jsx')),
    "Profile": React.lazy(() => import('./pages/Profile.jsx')),
    "ResetPassword": React.lazy(() => import('./pages/ResetPassword.jsx')),
    "TermsAndConditions": React.lazy(() => import('./pages/TermsAndConditions.jsx')),
};

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};