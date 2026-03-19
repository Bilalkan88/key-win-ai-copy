# Project: Amazon FBA/FBM Keywords Marketplace
## Status: Planning Phase
## Version: 1.0 (Based on PRD Feb 16, 2026)

---

## 🚩 Milestone 1: Data Architecture & Backend Foundation
*Objective: Build the core infrastructure to support keyword inventory, exclusive sales, and user ownership.*

- [ ] **1.1 Database Schema Implementation**
  - [ ] Create `Keywords` table with fields: `id`, `phrase`, `price`, `volume`, `competition`, `profitability`, `sales`, `score`, `status` (available/sold), `report_json`, `image_url`.
  - [ ] Create `Purchases` table with fields: `id`, `user_id`, `keyword_id`, `stripe_id`, `amount`, `delivered_at`.
- [ ] **1.2 API Development (Core)**
  - [ ] GET `/api/keywords/marketplace`: Fetch 10 available keywords (plus keywords sold in last 24h).
  - [ ] GET `/api/keywords/:id`: Fetch report data (with masked keyword if not owned by user).
  - [ ] POST `/api/admin/keywords`: Endpoint for adding new keyword inventory (Admin only).
- [ ] **1.3 Logic: Auto-Replacement System**
  - [ ] Implement query logic to select top 10 cheapest "Available" keywords.
  - [ ] Implement logic to include "Sold" keywords for exactly 24 hours post-sale.

---

## 🚩 Milestone 2: Marketplace Interface (Frontend)
*Objective: Create the "Window Shopping" experience with high-fidelity UI.*

- [x] **2.1 Header & Ticker Component**
  - [x] Design and implement the auto-scrolling "Recently Sold" ticker.
  - [x] Add logic to mask keywords in ticker (e.g., "A*** B**").
- [x] **2.2 Filter Bar Component**
  - [x] Create UI for Search Volume, Competition, and Price filters.
  - [x] Implement "Live Filtering" (Front-end filtering for the current 10 items).
- [x] **2.3 Keyword Grid & Cards**
  - [x] Build responsive vertical card layout (Desktop: Full width, Mobile: Stacked).
  - [x] Integrate colored indicators for Competition (🟢🟡🔴).
  - [x] Implement "SOLD" state UI (Greyed out, non-clickable, "SOLD" badge).
- [x] **2.4 Unified Branding Assets**
  - [x] Design/Generate a high-quality unified brand image for all keyword cards.

---

## 🚩 Milestone 3: Listing Detail & Comprehensive Report
*Objective: Present the value of a keyword without revealing its identity.*

- [x] **3.1 Details Page Layout**
  - [x] Create long-scrollable report template.
  - [x] Implement "Sticky Header" with prominent "Buy Now" button.
- [x] **3.2 Report Data Visualization**
  - [x] Integrate charts for Search Volume trends (e.g., Recharts).
  - [x] Create tables for Competition Analysis and Growth Trends.
  - [x] Implement "Masking" logic (Ensure actual keyword is never in DOM until purchase).

---

## 🚩 Milestone 4: Payments & Exclusivity (Stripe Integration)
*Objective: Secure the transaction and ensure one-time sale exclusivity.*

- [ ] **4.1 Stripe Setup**
  - [ ] Integrate Stripe Checkout for one-time payments.
  - [ ] Create Stripe Products/Prices dynamically or via generic endpoint.
- [ ] **4.2 Webhook Handling**
  - [ ] Implement secure webhook for `checkout.session.completed`.
  - [ ] logic to update Keyword status to `SOLD` and record `sold_at` timestamp.
  - [ ] Prevent race conditions (Double purchase of the same keyword).
- [ ] **4.3 Access Control**
  - [ ] Ensure "Buy Now" requires authentication (Redirect to Login/Register).

---

## 🚩 Milestone 5: Post-Purchase Experience & Delivery
*Objective: Deliver the value and provide long-term access for the buyer.*

- [ ] **5.1 Automated Email System**
  - [ ] Create professional email template for delivery.
  - [ ] Set up automated trigger to send PDF/Full Report link upon payment confirmation.
- [ ] **5.2 "My Purchases" Section**
  - [ ] Create a dedicated dashboard for users to view owned keywords.
  - [ ] Implement "Download Report" functionality (Revealed keyword version).
- [ ] **5.3 Inventory Management (Admin)**
  - [ ] Create simple dashboard to monitor sales, revenue, and remaining stock.

---

## 🚩 Milestone 6: Polish & Launch QA
*Objective: Final testing and optimization.*

- [ ] **6.1 Performance & SEO**
  - [ ] Optimize image loading and API response times.
  - [ ] Audit meta tags for Marketplace index.
- [ ] **6.2 Cross-Device Testing**
  - [ ] Verify Ticker behavior on mobile Safari/Chrome.
  - [ ] Check Sticky Header responsiveness.
- [ ] **6.3 Final Security Audit**
  - [ ] Ensure masked keywords cannot be retrieved via API inspection.
  - [ ] Verify Stripe signature verification on webhooks.

---

## 🛠 Technical Checklist
- [ ] Stripe API Keys (Live/Test)
- [ ] Database Migration Scripts
- [ ] Masking Utility Function (JS)
- [ ] Email SMTP/Service Provider Configuration
- [ ] High-res brand assets (Images/Icons)
