/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import AmazonScraper from './pages/AmazonScraper';
import AmazonSellerToolkit from './pages/AmazonSellerToolkit';
import Analysis from './pages/Analysis';
import Auth from './pages/Auth';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ExclusiveKeywords from './pages/ExclusiveKeywords';
import FbaProfitCalculator from './pages/FbaProfitCalculator';
import Home from './pages/Home';
import KeywordDatabase from './pages/KeywordDatabase';
import KeywordDetails from './pages/KeywordDetails';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import TermsAndConditions from './pages/TermsAndConditions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AdminDashboard": AdminDashboard,
    "AmazonScraper": AmazonScraper,
    "AmazonSellerToolkit": AmazonSellerToolkit,
    "Analysis": Analysis,
    "Auth": Auth,
    "Blog": Blog,
    "Contact": Contact,
    "ExclusiveKeywords": ExclusiveKeywords,
    "FbaProfitCalculator": FbaProfitCalculator,
    "Home": Home,
    "KeywordDatabase": KeywordDatabase,
    "KeywordDetails": KeywordDetails,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "TermsAndConditions": TermsAndConditions,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};