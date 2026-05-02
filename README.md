# DukanLink - Open Your Online Shop in 2 Minutes

A production-ready WhatsApp-integrated e-commerce platform that lets small business owners create and manage their online shops without any coding knowledge.

## Key Features

✅ **One-Click Shop Setup** - Create your shop in seconds  
✅ **Product Management** - Add, edit, delete products with images  
✅ **WhatsApp Integration** - Orders delivered directly to your WhatsApp  
✅ **Shareable Shop Link** - Share your unique shop link anywhere  
✅ **Public Shop Pages** - Anyone can browse and order without login  
✅ **Admin Dashboard** - Manage all shops and orders  
✅ **Mobile First** - Works perfectly on all devices  
✅ **100% Free to Start** - No credit card required  

## Quick Start

### On Windows
Double-click `START.bat`

### On Mac/Linux
```bash
chmod +x START.sh
./START.sh
```

### Manual Start
```bash
npm install
npm run dev
```

Then open: **http://localhost:5173**

## How It Works

1. **Sign Up** → Create account with email/password
2. **Create Shop** → Enter shop name, city, WhatsApp number
3. **Add Products** → Upload images, set prices, add descriptions
4. **Share Link** → Get your unique shop URL (e.g., dukanlink.in/shop/my-bakery)
5. **Get Orders** → Customers browse and order via WhatsApp

## Pages & Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Landing page | Public |
| `/login` | Sign up / Login | Public |
| `/demo` | Live demo shop | Public |
| `/dashboard` | Your shop stats | Logged in |
| `/products` | Manage products | Logged in |
| `/settings` | Edit shop details | Logged in |
| `/admin` | Manage all shops | Admin only |
| `/shop/:slug` | Public shop page | Public |

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Modern styling
- **Supabase** - Backend & database
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icons

## Database

**Supabase PostgreSQL** with tables:
- `shops` - Business information
- `products` - Product catalog
- `auth.users` - User authentication

All tables have **Row Level Security (RLS)** enabled for privacy.

## Environment

Credentials in `.env` are pre-configured. No setup needed unless switching databases.

## Build & Deploy

```bash
npm run build
# Creates optimized files in dist/
```

Deploy to: Vercel, Netlify, GitHub Pages, or any static host

## Customization

- **Colors** - Edit `tailwind.config.js`
- **Domain** - Replace `dukanlink.in` references
- **Branding** - Update logo in components

## File Structure

```
dukanlink/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable UI
│   ├── context/         # State management
│   ├── lib/             # Supabase setup
│   ├── App.jsx          # Router
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind
├── .env                 # Supabase keys
├── vite.config.js       # Build config
├── tailwind.config.js   # Style config
├── START.sh             # Mac/Linux launcher
├── START.bat            # Windows launcher
└── package.json         # Dependencies
```

## Troubleshooting

**Port 5173 in use?**
```bash
npm run dev -- --port 3000
```

**Dependencies error?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection error?**
- Check internet connection
- Verify `.env` has correct credentials

## Support

See `SETUP_GUIDE.md` for detailed setup instructions

---

**Start selling today!** 🚀

Open: http://localhost:5173
