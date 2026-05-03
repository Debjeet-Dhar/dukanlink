# DukanLink - Complete Setup Guide (For Beginners)

Read this guide from start to finish. Every step is explained in simple language.
No prior coding experience needed.

---

## TABLE OF CONTENTS

1. [What is DukanLink?](#what-is-dukanlink)
2. [What You Need Before Starting](#what-you-need-before-starting)
3. [Step 1: Create Supabase Account](#step-1-create-supabase-account)
4. [Step 2: Get Your API Keys](#step-2-get-your-api-keys)
5. [Step 3: Set Up the Database](#step-3-set-up-the-database)
6. [Step 4: Connect Your App to Supabase](#step-4-connect-your-app-to-supabase)
7. [Step 5: Enable Email Verification](#step-5-enable-email-verification)
8. [Step 6: Enable Google Auth](#step-6-enable-google-auth)
9. [Step 7: Set Up Image Storage](#step-7-set-up-image-storage)
10. [Step 8: Install and Run the App](#step-8-install-and-run-the-app)
11. [Step 9: Create Your Admin Account](#step-9-create-your-admin-account)
12. [Step 10: Test Everything](#step-10-test-everything)
13. [How Admin Works](#how-admin-works)
14. [How Email Verification Works](#how-email-verification-works)
15. [How Google Auth Works](#how-google-auth-works)
16. [Database Tables Explained](#database-tables-explained)
17. [Project File Structure](#project-file-structure)
18. [Deploy to the Internet](#deploy-to-the-internet)
19. [Common Problems and Fixes](#common-problems-and-fixes)
20. [Security Checklist](#security-checklist)

---

## What is DukanLink?

DukanLink lets anyone create an online shop in 60 seconds. Shop owners add products,
and customers browse and order via WhatsApp. It is built for small businesses in India.

Features:
- Create your shop with name, city, WhatsApp number
- Add products with images, prices, categories
- Customers see your shop at dukanlink.in/your-shop-name
- Order via WhatsApp (one click)
- Admin panel to manage all shops
- Google sign-in and email verification
- Subscription-ready database (for future paid plans)

---

## What You Need Before Starting

You need these 3 things installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Pick the "LTS" version (Long Term Support)
   - After installing, open terminal and type: `node --version`
   - You should see something like `v18.x.x` or `v20.x.x`

2. **A code editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/
   - This is where you edit your project files

3. **A web browser** (Chrome recommended)
   - You already have this

That is it. No Python, no Java, nothing else needed.

---

## Step 1: Create Supabase Account

Supabase is your database + login system. It is free for small projects.

1. Open your browser and go to: **https://supabase.com**
2. Click the green **"Start your project"** button
3. Click **"Sign up"** -- use your GitHub account or Google account (easiest)
4. After signing in, you see the Dashboard
5. Click **"New Project"**
6. Fill in:
   - **Name**: `dukanlink` (or anything you like)
   - **Database Password**: Pick a strong password. WRITE IT DOWN somewhere safe.
   - **Region**: Pick the region closest to you (e.g., "South Asia (Mumbai)")
7. Click **"Create new project"**
8. Wait about 2 minutes. Supabase is setting up your database.

You now have a Supabase project. Keep this browser tab open.

---

## Step 2: Get Your API Keys

You need two secret values that connect your app to Supabase.

1. In your Supabase project, look at the LEFT sidebar
2. Click the **gear icon** (Settings) at the bottom
3. Click **"API"** in the settings menu
4. You will see two important values:

   **Project URL** -- looks like this:
   ```
   https://xkqwmtpfgr.supabase.co
   ```

   **anon public key** -- looks like this (very long):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

5. Keep this page open. You will copy these in Step 4.

---

## Step 3: Set Up the Database

This is the most important step. You will create all your database tables here.

1. In your Supabase project, look at the LEFT sidebar
2. Click **"SQL Editor"** (the icon looks like `</>`)
3. Click **"New query"** (top right)
4. Delete anything already in the editor
5. Copy the ENTIRE SQL block below (select all of it) and paste it into the editor

```sql
-- ============================================================
-- DUKANLINK COMPLETE DATABASE SETUP
-- Run this ENTIRE block in your Supabase SQL Editor
-- ============================================================

-- SHOPS TABLE
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  city TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'suspended')),
  banner TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own shops" ON shops FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all shops" ON shops FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Public can view active shops" ON shops FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Users can create shops" ON shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own shops" ON shops FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can update any shop" ON shops FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Owners can delete own shops" ON shops FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own shop products" ON products FOR SELECT TO authenticated USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "Admins can view all products" ON products FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Public can view active shop products" ON products FOR SELECT TO anon, authenticated USING (shop_id IN (SELECT id FROM shops WHERE status = 'active'));
CREATE POLICY "Owners can create products in own shops" ON products FOR INSERT TO authenticated WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can update own products" ON products FOR UPDATE TO authenticated USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())) WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can delete own products" ON products FOR DELETE TO authenticated USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Users can create own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile restricted" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));

-- ADMIN AUTO-ASSIGN TRIGGER (first user becomes admin)
CREATE OR REPLACE FUNCTION auto_assign_first_admin()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM user_profiles WHERE is_admin = true;
  IF admin_count = 0 THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_assign_first_admin ON user_profiles;
CREATE TRIGGER trigger_auto_assign_first_admin
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_first_admin();

-- SUBSCRIPTIONS TABLE (for future paid plans)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'expired')),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shop_id ON subscriptions(shop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Users can create own subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any subscription" ON subscriptions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- SUBSCRIPTION EVENTS TABLE (audit trail)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'canceled', 'reactivated', 'trial_started', 'trial_ended', 'payment_failed', 'payment_succeeded', 'expired')),
  from_plan TEXT,
  to_plan TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_subscription_id ON subscription_events(subscription_id);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events" ON subscription_events FOR SELECT TO authenticated USING (subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all subscription events" ON subscription_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Service role can manage subscription events" ON subscription_events FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATED_AT TRIGGER FOR ALL TABLES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_shops_updated_at ON shops;
CREATE TRIGGER trigger_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STORAGE BUCKET FOR IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('shop-images', 'shop-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can read shop images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'shop-images');
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

6. Click the green **"Run"** button
7. Wait for it to finish (should say "Success")
8. If you see errors about things "already existing", that is OK -- it means they were already created

Your database is now fully set up with all tables, security policies, and image storage.

---

## Step 4: Connect Your App to Supabase

1. Open the project folder in VS Code
2. Find the file called **`.env`** in the project root
   - If you cannot see it: In VS Code, click the gear icon in the file explorer and check "Show Hidden Files"
3. Open `.env` and replace the two values with YOUR OWN from Step 2:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Example of what it should look like (YOUR values will be different):
```
VITE_SUPABASE_URL=https://xkqwmtpfgr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

4. **Save the file** (Ctrl+S or Cmd+S)

---

## Step 5: Enable Email Verification

By default, Supabase does NOT require email verification. You need to turn it ON.

1. In your Supabase project, click **"Authentication"** on the left sidebar
2. Click **"Providers"** at the top
3. Under **"Email"**, click the expand arrow
4. Turn ON **"Confirm email"**
5. Click **"Save"**

Now when users sign up, they will receive a verification email with a link.
They must click that link before they can sign in.

**Also set up the redirect URL:**

1. Still in Authentication, click **"URL Configuration"** on the left
2. Set **Site URL** to: `http://localhost:5173` (for development)
3. When you deploy later, change this to your real domain (e.g., `https://dukanlink.in`)
4. Click **"Save"**

**Customize the email template (optional but recommended):**

1. In Authentication, click **"Email Templates"** on the left
2. Click **"Confirm signup"**
3. Edit the email subject and body to match your brand
4. Click **"Save"**

---

## Step 6: Enable Google Auth

This lets users sign in with their Google account (one click, no password needed).

### 6a. Create Google OAuth Credentials

1. Go to **https://console.cloud.google.com/**
2. Sign in with your Google account
3. Click **"Select a project"** at the top > **"New Project"**
4. Name it `DukanLink` and click **"Create"**
5. Select the project you just created
6. Go to **APIs & Services** > **Credentials** (left sidebar)
7. Click **"Create Credentials"** > **"OAuth client ID"**
8. If it asks you to configure the consent screen:
   - Click "Configure Consent Screen"
   - Choose "External" and click Create
   - Fill in the app name: `DukanLink`
   - Add your email as developer contact
   - Click "Save and Continue" through all steps
   - Click "Back to Dashboard"
9. Now create the OAuth client ID:
   - Application type: **Web application**
   - Name: `DukanLink Web`
   - Under **"Authorized redirect URIs"**, click "Add URI" and paste:
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
     Replace `YOUR-PROJECT-REF` with your Supabase project reference ID.
     You can find this in your Supabase URL: `https://PROJECT-REF.supabase.co`
   - Click **"Create"**
10. Copy the **Client ID** and **Client Secret** that appear

### 6b. Add Google to Supabase

1. Go back to your Supabase project
2. Click **"Authentication"** > **"Providers"**
3. Find **"Google"** and click the expand arrow
4. Turn it ON
5. Paste your **Client ID** and **Client Secret** from step 6a
6. Click **"Save"**

Google sign-in is now ready.

---

## Step 7: Set Up Image Storage

Image storage was already created in Step 3 (the SQL included it).
But let's verify it works:

1. In your Supabase project, click **"Storage"** on the left sidebar
2. You should see a bucket called **"shop-images"**
3. Click on it -- it should say "Public" with a green indicator
4. If you do NOT see it, run this in SQL Editor:
   ```sql
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES ('shop-images', 'shop-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
   ON CONFLICT (id) DO NOTHING;
   ```

The storage policies were also created in Step 3. Users can only upload/delete their own images, but anyone can view them.

---

## Step 8: Install and Run the App

1. Open **VS Code Terminal** (Ctrl + ` or View > Terminal)
2. Run this command to install all dependencies:

```bash
npm install
```

Wait 1-2 minutes for it to finish. You will see a lot of text scrolling by. That is normal.

3. Then run this to start the development server:

```bash
npm run dev
```

4. You will see something like:
```
  VITE v5.4.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

5. Open your browser and go to: **http://localhost:5173**

You should see the DukanLink landing page. It is working!

---

## Step 9: Create Your Admin Account

This is the most important step. The FIRST account you create becomes the admin.

**IMPORTANT: Do this BEFORE anyone else signs up.**

### Option A: Use the Admin Email (Recommended)

The app is configured so that these emails automatically get admin access:
- `admin@dukanlink.com`
- `admin@dukkanlink.in`

1. Go to your app at http://localhost:5173
2. Click **"Get Started"**
3. Click **"Sign up"** (not Sign in)
4. Enter email: `admin@dukanlink.com`
5. Enter a strong password (6+ characters)
6. Click **"Create Account"**
7. You will see a "Check your email" screen
8. Go to your email inbox and click the verification link
9. Come back to the app and click **"I verified my email -- Sign In"**
10. Sign in with your email and password
11. You are now the admin! You will see the "Admin" tab in the sidebar.

### Option B: First User Automatically Becomes Admin

If you sign up with ANY email as the very first user, the database trigger
automatically makes you admin. But using the admin email (Option A) is safer
because it is explicitly configured.

### After Creating Admin

No other user who signs up after you will get admin access. Only you (the admin)
can promote other users by running SQL in the Supabase dashboard.

---

## Step 10: Test Everything

### Test 1: Sign Up Flow
1. Sign up with a new email (not your admin email)
2. You should see "Check your email" screen
3. Check email inbox, click the verification link
4. Come back and sign in -- it should work

### Test 2: Google Sign In
1. Click "Continue with Google"
2. Pick your Google account
3. You should be signed in automatically

### Test 3: Create a Shop
1. After signing in, fill in the onboarding form
2. Enter shop name, city, WhatsApp number
3. Click "Create My Shop"
4. You should see the Dashboard

### Test 4: Add Products
1. Go to the Products page
2. Click "Add Product"
3. Fill in name, price, description
4. Save it -- it should appear in the list

### Test 5: View Public Shop
1. Click "Preview" in the top bar
2. Your shop should open in a new tab
3. Anyone can see this page (no login needed)

### Test 6: Admin Panel
1. Sign in with your admin account
2. Click "Admin" in the sidebar
3. You should see all shops and stats
4. Try flagging or suspending a shop

### Test 7: Non-Admin Cannot Access Admin
1. Sign in with a regular (non-admin) account
2. Try to go to /admin
3. You should see "Access Denied"

---

## How Admin Works

The admin system has 3 layers of protection:

### Layer 1: Code Level
The app checks `ADMIN_EMAILS` list in `AuthContext.jsx`:
```javascript
const ADMIN_EMAILS = ['admin@dukanlink.com', 'admin@dukkanlink.in'];
```
Only these emails get admin when signing up.

### Layer 2: Database Trigger
A database trigger (`auto_assign_first_admin`) makes the FIRST user who
creates a profile automatically an admin. After that, no one else gets
admin through signup.

### Layer 3: Row Level Security
The `user_profiles` table has a policy that prevents users from changing
their own `is_admin` field. Only an existing admin can promote others.

### How to Promote a User to Admin

If you (the admin) want to make another user an admin:

1. Go to Supabase > Authentication > Users
2. Find the user and copy their **ID** (UUID)
3. Go to SQL Editor and run:
```sql
UPDATE user_profiles SET is_admin = TRUE WHERE id = 'PASTE_USER_ID_HERE';
```
4. That user will now see the Admin tab after refreshing

### How to Remove Admin Access

```sql
UPDATE user_profiles SET is_admin = FALSE WHERE id = 'PASTE_USER_ID_HERE';
```

---

## How Email Verification Works

### Sign Up Flow
1. User enters email + password and clicks "Create Account"
2. Supabase sends a verification email with a link
3. User sees the "Check your email" screen in the app
4. User clicks the link in their email
5. Supabase confirms the email
6. User comes back to the app and clicks "I verified my email -- Sign In"
7. User signs in successfully

### Sign In Flow
1. User enters email + password and clicks "Sign In"
2. If email is NOT verified, they see an error: "Please verify your email before signing in"
3. If email IS verified, they sign in successfully

### Resend Verification
If the user did not receive the email, they can click "Resend confirmation email"
on the verification screen.

### Important Notes
- Temp mail / disposable email domains are NOT blocked by default
- To block them, you would need a custom edge function (advanced, not included)
- Email verification uses a click-link method (not a code/OTP)
- The redirect URL after clicking the email link goes to your Site URL

---

## How Google Auth Works

### Flow
1. User clicks "Continue with Google" on the Login page
2. A Google sign-in popup opens
3. User picks their Google account
4. Google sends the user info to Supabase
5. Supabase creates or logs in the user
6. User is redirected back to your app
7. A user profile is created automatically

### Google Auth + Email Verification
- Google-authenticated users do NOT need email verification
- Google already verified their email
- They are signed in immediately

### Google Auth + Admin
- If a Google user's email matches `admin@dukanlink.com`, they get admin
- Otherwise, they are a regular user

---

## Database Tables Explained

| Table | Purpose | Who Can See It |
|-------|---------|---------------|
| `auth.users` | Login info (email, password hash) | Managed by Supabase, not directly accessible |
| `user_profiles` | Admin status for each user | Users see own, admins see all |
| `shops` | Shop name, city, WhatsApp, slug, plan | Owners see own, admins see all, public sees active shops |
| `products` | Product name, price, image, category | Owners see own, admins see all, public sees products in active shops |
| `subscriptions` | Plan, billing, Stripe IDs (future) | Users see own, admins see all |
| `subscription_events` | Audit trail for subscription changes | Users see own, admins see all |
| `shop-images` (bucket) | Uploaded product/shop images | Anyone can view, only owner can upload/delete |

### Table Relationships

```
auth.users (Supabase managed)
  |
  +-- user_profiles (1:1, same ID)
  |
  +-- shops (1:many, owner_id = user.id)
  |     |
  |     +-- products (1:many, shop_id = shops.id)
  |     |
  |     +-- subscriptions (1:many, shop_id = shops.id)
  |           |
  |           +-- subscription_events (1:many, subscription_id = subscriptions.id)
  |
  +-- storage.objects (images, folder = user.id)
```

---

## Project File Structure

```
dukanlink/
|
|-- .env                          # Supabase URL and API key (NEVER share this)
|-- .gitignore                    # Tells git to ignore .env and node_modules
|-- package.json                  # Project dependencies
|-- vite.config.js                # Vite build configuration
|-- tailwind.config.js            # Tailwind CSS configuration
|-- SETUP_GUIDE.md                # This file
|-- SECURITY_SETUP.md             # Security documentation
|
|-- src/
|   |-- main.jsx                  # App entry point (loads React)
|   |-- App.jsx                   # Routes (which page shows at which URL)
|   |-- index.css                 # All styles (Tailwind + custom)
|   |
|   |-- pages/                    # Each page of the app
|   |   |-- Landing.jsx           # Home page (marketing)
|   |   |-- Login.jsx             # Sign up / Sign in (email + Google)
|   |   |-- Onboarding.jsx        # Create your shop (first time only)
|   |   |-- Dashboard.jsx         # Shop overview and stats
|   |   |-- Products.jsx          # Add, edit, delete products
|   |   |-- Settings.jsx          # Edit shop name, city, WhatsApp, images
|   |   |-- Admin.jsx             # Admin panel (manage all shops)
|   |   |-- PublicShop.jsx        # Customer-facing shop page
|   |   |-- ShopPreview.jsx       # Shop preview for owner
|   |   |-- DemoShop.jsx          # Demo shop for visitors
|   |
|   |-- components/               # Reusable UI pieces
|   |   |-- Navigation.jsx        # Sidebar + bottom navigation
|   |   |-- Icons.jsx             # All icon imports from Lucide
|   |   |-- UI.jsx                # Buttons, modals, inputs, cards
|   |
|   |-- context/                  # App state management
|   |   |-- AuthContext.jsx        # Login state, admin check, Google auth
|   |   |-- AppContext.jsx         # Shop + products data, admin queries
|   |
|   |-- lib/                      # Helper code
|       |-- supabase.js           # Database connection setup
|       |-- auth.js               # Admin checks, user profile functions
|       |-- storage.js            # Image upload/download helpers
|       |-- errorHandler.js       # Error message formatting
|
|-- supabase/
|   |-- migrations/               # Database migration files (already applied)
|
|-- dist/                         # Production build output (after npm run build)
```

---

## Deploy to the Internet

When you are ready to share your app with the world:

### Before Deploying

1. Update the Site URL in Supabase:
   - Go to Authentication > URL Configuration
   - Change Site URL from `http://localhost:5173` to your real domain
   - Add your domain to Redirect URLs too
   - Click Save

2. Update Google OAuth redirect URI:
   - Go to Google Cloud Console > Credentials
   - Edit your OAuth client
   - Add your production URL to Authorized JavaScript origins
   - Add `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` (same as before)
   - Save

3. Build the production version:
```bash
npm run build
```
This creates a `dist/` folder with optimized files.

### Option 1: Vercel (Easiest, Free)

1. Go to **https://vercel.com** and sign up with GitHub
2. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "DukanLink ready"
   git remote add origin https://github.com/YOUR-USERNAME/dukanlink.git
   git push -u origin main
   ```
3. In Vercel, click **"New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **"Deploy"**
7. You get a live URL like `dukanlink.vercel.app`

### Option 2: Netlify (Also Free)

1. Go to **https://netlify.com** and sign up
2. Run `npm run build` locally
3. Drag and drop the `dist/` folder onto Netlify
4. Go to Site Settings > Environment Variables
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Redeploy

### Option 3: Custom Domain

After deploying to Vercel or Netlify:
1. Buy a domain (e.g., from GoDaddy, Namecheap)
2. In Vercel/Netlify, go to Domain Settings
3. Add your custom domain
4. Update DNS records as instructed
5. Update Supabase Site URL and Google OAuth redirect URI

---

## Common Problems and Fixes

### "Missing Supabase environment variables" error
- Make sure `.env` file exists in the project ROOT folder (not inside src/)
- Make sure the variable names start with `VITE_`
- Restart the dev server after changing `.env` (Ctrl+C then `npm run dev`)

### Sign up works but says "verify your email"
- This is correct behavior! Email verification is ON.
- Check your email inbox (and spam folder) for the verification link.
- If you want to turn OFF email verification: Authentication > Providers > Email > turn OFF "Confirm email"

### "Please verify your email before signing in" error
- Your email is not verified yet.
- Click the link in the verification email.
- If you lost the email, click "Resend confirmation email" on the login page.

### Google sign-in does not work
- Make sure you enabled Google in Supabase Authentication > Providers
- Make sure you added the correct redirect URI in Google Cloud Console
- The redirect URI must be: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
- Check that your Client ID and Secret are correct

### "row-level security" error when creating shop
- You missed running the SQL in Step 3
- Go to SQL Editor and run the SQL again
- Make sure you see "Success" after running it

### Admin tab does not appear
- You are not logged in as admin
- Only the FIRST user (or admin email users) get admin access
- Check: Go to Supabase > Table Editor > user_profiles > find your user > is_admin should be TRUE
- If it is FALSE, run: `UPDATE user_profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_ID';`

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```
Then open http://localhost:3000

### npm install fails
```bash
rm -rf node_modules package-lock.json
npm install
```

### Images not uploading
- Make sure the "shop-images" bucket exists in Supabase Storage
- Make sure the bucket is set to PUBLIC
- Make sure storage policies were created (run the SQL from Step 3)

### Styles look broken
- Clear your browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)

---

## Security Checklist

Before going live, verify ALL of these:

- [ ] `.env` file is NOT committed to git (check `.gitignore` has `.env`)
- [ ] Email verification is turned ON in Supabase
- [ ] Google OAuth is configured with correct redirect URI
- [ ] All RLS policies are active (check in Supabase > Authentication > Policies)
- [ ] Admin account created and verified (is_admin = TRUE in user_profiles)
- [ ] Non-admin users CANNOT access /admin (test it)
- [ ] Users CANNOT see other users' shops or products
- [ ] Public shops ARE visible without login
- [ ] Image uploads work and are stored in the correct bucket
- [ ] Error messages do NOT reveal database details
- [ ] Site URL in Supabase matches your production domain
- [ ] `npm run build` completes without errors

---

## Technology Stack

| Technology | What It Does |
|-----------|-------------|
| React 18 | Builds the user interface |
| React Router | Handles page navigation |
| Tailwind CSS | Makes everything look good |
| Lucide React | Provides all icons |
| Supabase | Database + authentication + storage |
| Vite | Dev server and production build |

---

## Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production (creates dist/ folder)
npm run build

# Preview the production build locally
npm run preview

# Run linter to check code quality
npm run lint
```

---

You are all set. If something breaks, open browser DevTools (F12) and check the Console tab for error messages. Most problems are caused by wrong `.env` values or missing database tables.
