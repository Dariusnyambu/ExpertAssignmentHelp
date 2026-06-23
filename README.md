# ExpertAssignmentHelp4U — React Web App v3

## 🚀 Quick Start
```bash
npm install
cp .env.example .env     # fill in your Supabase & payment keys
npm start                # http://localhost:3000
```

## 🔐 Admin Access
Admin panel is completely separate from the main site nav.

| Environment | URL |
|---|---|
| Local dev | `http://localhost:3000/admin` |
| Production | `https://yourdomain.com/admin` |

**Default admin credentials (change after first login):**
- Email: `admin@expertassignment.com`
- Password: `Admin@2025!`

To add real admin after Supabase setup:
1. Create user in Supabase Auth dashboard
2. Run: `INSERT INTO public.users (id, full_name, email, role) VALUES ('<uid>', 'Administrator', 'admin@expertassignment.com', 'superadmin');`

## 📁 Project Structure
```
expertassignment-react/
├── public/
│   └── index.html               # Meta tags, font preload, no-flash bg
├── vercel.json                  # /admin route rewrites + noindex header
├── supabase_schema.sql          # Full production database schema
├── .env.example                 # Environment variables template
└── src/
    ├── App.js                   # Root router with /admin URL handling
    ├── index.js                 # React entry point
    ├── index.css                # Full responsive design system
    ├── supabase.js              # Supabase client + all query helpers
    ├── components/
    │   ├── Navbar.js            # No admin link, has Client Login
    │   ├── HeroSlider.js        # 5 slides with Pexels photos
    │   ├── OrderStatusSlider.js # Auto-scrolling order cards
    │   ├── Footer.js            # Footer + social links
    │   └── Floaters.js          # WhatsApp / Quote / ScrollTop
    └── pages/
        ├── HomePage.js          # Full homepage
        ├── ServicesPage.js      # All 12 services
        ├── SamplesPage.js       # 10 sample categories
        ├── SubjectsPage.js      # 30 subjects + search
        ├── QuotePage.js         # Quote form + 6 payment options
        ├── TrackingPage.js      # Live order tracker
        ├── ReviewsPage.js       # 15 reviews + submit form
        ├── ContactPage.js       # Contact form + WhatsApp
        ├── LoginPage.js         # Client login/register
        ├── StudentDashboard.js  # Client orders & progress
        ├── AdminLogin.js        # Admin-only login at /admin
        └── AdminDashboard.js    # Full admin panel
```

## 🛠 Admin Dashboard Modules

| Module | Features |
|---|---|
| **Dashboard** | KPI widgets, revenue chart, order status breakdown, recent orders |
| **Orders** | Full orders table, status update modal, writer assignment, search & filter |
| **Students** | All students, order count, total spend, status management |
| **Writers** | Writer profiles, add/edit, subject tags, ratings |
| **Payments** | Transaction log, method breakdown, revenue widgets, CSV export |
| **Reviews** | Publish/unpublish reviews, delete, star ratings |
| **FAQ Manager** | Add/edit/toggle FAQ items by category |
| **Analytics** | Orders by country, orders by service type, bar charts |
| **Settings** | Admin profile update, password change, sign out |

## 💳 Payment Methods
| Method | Icon | Notes |
|---|---|---|
| Credit/Debit Card | `CreditCard` | Visa, Mastercard, Amex |
| M-Pesa | `Smartphone` | Direct STK push via Daraja API |
| PayPal | `Wallet` | PayPal REST API |
| PesaPal | `Banknote` | Supports Airtel, bank cards (EA region) |
| Bank Transfer | `Building2` | Manual confirmation |
| Cryptocurrency | `Bitcoin` | USDT/BTC |

## 🗄 Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in **SQL Editor → New Query**
3. Enable **Realtime** on: `assignments`, `assignment_updates`, `payments`, `notifications`
4. Create **Storage buckets**: `assignment-files` (private), `deliverables` (private), `samples` (public), `avatars` (public), `invoices` (private)
5. Copy Project URL + anon key to `.env`

## 🌐 Deploy to Vercel
```bash
npm run build
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# vercel.json handles /admin routing automatically
```

## 🔧 Environment Variables
```env
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
REACT_APP_PESAPAL_CONSUMER_KEY=your-pesapal-key
REACT_APP_PESAPAL_CONSUMER_SECRET=your-pesapal-secret
REACT_APP_MPESA_CONSUMER_KEY=your-daraja-key
REACT_APP_MPESA_CONSUMER_SECRET=your-daraja-secret
```
