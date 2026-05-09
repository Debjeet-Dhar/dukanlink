/*
  # Add +91 Country Code to WhatsApp Numbers (OPTIONAL)

  This migration is OPTIONAL and for cleaning up existing data only.
  
  New phone numbers are now automatically formatted with +91 in the frontend
  when users enter them in Onboarding and Settings pages.
  
  If you want to fix existing phone numbers in the database, you can:
  
  1. Run the UPDATE statements below manually in Supabase SQL Editor
  2. Or run with superuser privileges in your Supabase dashboard
  
  The statements below will add +91 to any phone numbers that don't have it.
*/

-- OPTIONAL: Run these individually if needed
-- (Replace "REPLACE_ME_WITH_NUMBER_HERE" with actual phone numbers for manual updates)

-- Example to update a specific shop:
-- UPDATE shops
-- SET whatsapp = '+91' || TRIM(whatsapp)
-- WHERE id = 'REPLACE_ME_WITH_SHOP_ID'
-- AND whatsapp IS NOT NULL 
-- AND whatsapp != '' 
-- AND whatsapp NOT LIKE '+%'
-- AND whatsapp NOT LIKE '91%';

-- To update ALL shops (only if you have proper permissions):
-- UPDATE shops
-- SET whatsapp = '+91' || TRIM(whatsapp),
--     updated_at = now()
-- WHERE whatsapp IS NOT NULL
--   AND whatsapp != ''
--   AND whatsapp NOT LIKE '+%'
--   AND whatsapp NOT LIKE '91%';

