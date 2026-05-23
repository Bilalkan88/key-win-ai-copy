import React from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

export const PAGES = {
    "AboutUs": React.lazy(() => import('./pages/AboutUs')),
    "AdminDashboard": React.lazy(() => import('./pages/AdminDashboard')),
    "AmazonScraper": React.lazy(() => import('./pages/AmazonScraper')),
    "AmazonSellerToolkit": React.lazy(() => import('./pages/AmazonSellerToolkit')),
    "Analysis": React.lazy(() => import('./pages/Analysis')),
    "Auth": React.lazy(() => import('./pages/Auth')),
    "Blog": React.lazy(() => import('./pages/Blog')),
    "Contact": React.lazy(() => import('./pages/Contact')),
    "ExclusiveKeywords": React.lazy(() => import('./pages/ExclusiveKeywords')),
    "FbaProfitCalculator": React.lazy(() => import('./pages/FbaProfitCalculator')),
    "Home": Home,
    "KeywordDatabase": React.lazy(() => import('./pages/KeywordDatabase')),
    "KeywordDetails": React.lazy(() => import('./pages/KeywordDetails')),
    "Pricing": React.lazy(() => import('./pages/Pricing')),
    "PrivacyPolicy": React.lazy(() => import('./pages/PrivacyPolicy')),
    "Profile": React.lazy(() => import('./pages/Profile')),
    "ResetPassword": React.lazy(() => import('./pages/ResetPassword')),
    "TermsAndConditions": React.lazy(() => import('./pages/TermsAndConditions')),
};

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};