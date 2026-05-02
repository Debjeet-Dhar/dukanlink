# DukanLink - Setup & Run Guide

## Prerequisites

Before running the app, make sure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (optional, for cloning)

## Setup Steps

### 1. Clone or Extract the Project

```bash
# Clone from git
git clone <your-repo-url> dukanlink
cd dukanlink

# OR extract the project folder and navigate into it
cd dukanlink
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages (React, Supabase, Tailwind CSS, etc.)

### 3. Environment Variables

The `.env` file is already configured with Supabase credentials. You don't need to change anything.

**File: `.env`**
```
VITE_SUPABASE_URL=https://kxzcfyizeoscpjztoatx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run the Development Server

```bash
npm run dev
```

Output will show:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open your browser and go to: **http://localhost:5173**

## What You'll See

**Landing Page** (http://localhost:5173/)
- Hero section with code visual
- Features, how it works, pricing
- Buttons: "Get Started" and "View Live Demo"

**Demo Shop** (http://localhost:5173/demo)
- Live example shop interface
- Browse products, place WhatsApp orders

**Login** (http://localhost:5173/login)
- Sign up or log in with email/password
- Connected to Supabase authentication

**Dashboard** (after login)
- Your shop overview
- Product stats, recent products
- Preview link to your public shop

**Products** (after login)
- Add, edit, delete products
- Upload product images
- Manage inventory

**Settings** (after login)
- Edit shop name, city, WhatsApp number
- Upload shop banner and logo
- Change shop slug

**Public Shop** (http://localhost:5173/shop/:slug)
- Anyone can visit (no login needed)
- Browse your products
- Order via WhatsApp link

## Available Commands

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm lint
```

## Database

The app uses **Supabase** (PostgreSQL). Tables are pre-created:
- `shops` - Your shop information
- `products` - Your product catalog
- `auth.users` - Authentication via Supabase Auth

All data is synced in real-time with the database.

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 3000
# Then open http://localhost:3000
```

### Dependencies installation fails?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection error?
- Check your internet connection
- Verify `.env` file has the correct URLs and keys
- If credentials changed, update the `.env` file

## Project Structure

```
dukanlink/
├── src/
│   ├── pages/           # All page components (Landing, Dashboard, etc.)
│   ├── components/      # Reusable components (Navigation, UI, Icons)
│   ├── context/         # Auth and App state management
│   ├── lib/             # Supabase client setup
│   ├── App.jsx          # Router and main layout
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind styles
├── .env                 # Supabase credentials
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS config
└── package.json         # Dependencies
```

## Technology Stack

- **Frontend:** React 18 + React Router DOM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Build Tool:** Vite
- **Language:** JavaScript (JSX)

## Deployment

When ready to deploy, the build is already optimized:

```bash
npm run build
# Output is in the `dist/` folder
# Deploy to Vercel, Netlify, or any static host
```

## Support

For issues or questions:
- Check the `.env` file is configured correctly
- Ensure Node.js version is 18+
- Clear browser cache if styles look off
- Check browser console for error messages

---

**Happy selling with DukanLink!** 🚀
