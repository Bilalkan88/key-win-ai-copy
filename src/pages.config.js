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
import AmazonScraper from './pages/AmazonScraper';
import AmazonSellerToolkit from './pages/AmazonSellerToolkit';
import Analysis from './pages/Analysis';
import ExclusiveKeywords from './pages/ExclusiveKeywords';
import FbaProfitCalculator from './pages/FbaProfitCalculator';
import Home from './pages/Home';
import KeywordDetails from './pages/KeywordDetails';
import NewThisWeek from './pages/NewThisWeek';
import Pricing from './pages/Pricing';
import KeywordDatabase from './pages/KeywordDatabase';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AmazonScraper": AmazonScraper,
    "AmazonSellerToolkit": AmazonSellerToolkit,
    "Analysis": Analysis,
    "ExclusiveKeywords": ExclusiveKeywords,
    "FbaProfitCalculator": FbaProfitCalculator,
    "Home": Home,
    "KeywordDetails": KeywordDetails,
    "NewThisWeek": NewThisWeek,
    "Pricing": Pricing,
    "KeywordDatabase": KeywordDatabase,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};