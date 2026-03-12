-- ═══════════════════════════════════════════════════════════════════════════════
-- XbandGlobal Sample Seed Data
-- Run in: Supabase Dashboard → SQL Editor
-- Creates: 8 verified providers + countries + country links + reviews
-- These are DEMO accounts to showcase the marketplace to potential clients.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Step 1: Sample countries (upsert so safe to re-run) ─────────────────────
INSERT INTO public.countries (code, name, flag_emoji, avg_cost, is_active, requirements)
VALUES
  ('AE', 'United Arab Emirates', '🇦🇪', '$3,000 – $8,000', true, '{"timeline_weeks": 2, "min_capital": 0, "summary": "100% foreign ownership in free zones. Zero corporate tax in many structures."}'::jsonb),
  ('SG', 'Singapore',           '🇸🇬', '$2,000 – $5,000', true, '{"timeline_weeks": 1, "min_capital": 1, "summary": "World-class jurisdiction. Fast setup, stable legal system, low corporate tax rate."}'::jsonb),
  ('GB', 'United Kingdom',      '🇬🇧', '$500 – $2,000',  true, '{"timeline_weeks": 1, "min_capital": 1, "summary": "Prestigious address. Same-day incorporation available. Strong banking infrastructure."}'::jsonb),
  ('HK', 'Hong Kong',           '🇭🇰', '$1,500 – $4,000', true, '{"timeline_weeks": 2, "min_capital": 1, "summary": "Gateway to China. Low flat corporate tax. Excellent banking access."}'::jsonb),
  ('MT', 'Malta',               '🇲🇹', '$3,000 – $7,000', true, '{"timeline_weeks": 4, "min_capital": 1200, "summary": "EU jurisdiction. Attractive for holding structures and gaming/fintech."}'::jsonb),
  ('DE', 'Germany',             '🇩🇪', '$2,000 – $6,000', true, '{"timeline_weeks": 4, "min_capital": 25000, "summary": "Largest EU economy. Strong credibility for B2B. GmbH most common structure."}'::jsonb),
  ('US', 'United States',       '🇺🇸', '$1,000 – $4,000', true, '{"timeline_weeks": 2, "min_capital": 0, "summary": "Delaware LLC most popular. Access to US banking, investors, and markets."}'::jsonb),
  ('BVI', 'British Virgin Islands', '🇻🇬', '$2,000 – $5,000', true, '{"timeline_weeks": 2, "min_capital": 0, "summary": "Leading offshore jurisdiction. No local taxes. High privacy protections."}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  avg_cost = EXCLUDED.avg_cost,
  is_active = EXCLUDED.is_active,
  requirements = EXCLUDED.requirements;

-- ─── Step 2: Fake auth users (required to satisfy the profiles FK) ────────────
-- These are demo-only accounts. Passwords are locked (invalid hash = can't login).
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
)
VALUES
  ('11111111-0001-0001-0001-000000000001', 'authenticated', 'authenticated', 'demo.nexus@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_NEXUS_1111111111111', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0002-0002-0002-000000000002', 'authenticated', 'authenticated', 'demo.orient@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_ORIENT_222222222222', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0003-0003-0003-000000000003', 'authenticated', 'authenticated', 'demo.alpina@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_ALPINA_333333333333', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0004-0004-0004-000000000004', 'authenticated', 'authenticated', 'demo.meridian@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_MERIDIAN_44444444444', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0005-0005-0005-000000000005', 'authenticated', 'authenticated', 'demo.atlas@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_ATLAS_555555555555', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0006-0006-0006-000000000006', 'authenticated', 'authenticated', 'demo.sovereign@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_SOVEREIGN_6666666666', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0007-0007-0007-000000000007', 'authenticated', 'authenticated', 'demo.gateway@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_GATEWAY_777777777777', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false),
  ('11111111-0008-0008-0008-000000000008', 'authenticated', 'authenticated', 'demo.sterling@xbandglobal.test', '$2a$10$DEMO_LOCKED_HASH_STERLING_88888888888', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"provider"}'::jsonb, false, false)
ON CONFLICT (id) DO NOTHING;

-- ─── Step 3: Profiles ─────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, email, role, full_name)
VALUES
  ('11111111-0001-0001-0001-000000000001', 'demo.nexus@xbandglobal.test',     'provider', 'Nexus Global Advisors'),
  ('11111111-0002-0002-0002-000000000002', 'demo.orient@xbandglobal.test',    'provider', 'Orient Corporate Services'),
  ('11111111-0003-0003-0003-000000000003', 'demo.alpina@xbandglobal.test',    'provider', 'Alpina Fiduciary Group'),
  ('11111111-0004-0004-0004-000000000004', 'demo.meridian@xbandglobal.test',  'provider', 'Meridian Formation Ltd'),
  ('11111111-0005-0005-0005-000000000005', 'demo.atlas@xbandglobal.test',     'provider', 'Atlas Business Structuring'),
  ('11111111-0006-0006-0006-000000000006', 'demo.sovereign@xbandglobal.test', 'provider', 'Sovereign Jurisdictions'),
  ('11111111-0007-0007-0007-000000000007', 'demo.gateway@xbandglobal.test',   'provider', 'Gateway Corporate Ltd'),
  ('11111111-0008-0008-0008-000000000008', 'demo.sterling@xbandglobal.test',  'provider', 'Sterling Compliance Group')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ─── Step 4: Providers (all VERIFIED) ────────────────────────────────────────
INSERT INTO public.providers (
  id, profile_id, company_name, bio, website_url,
  status, pricing_band, services, languages,
  response_time_hours, rating_avg, review_count
)
VALUES
  (
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    '11111111-0001-0001-0001-000000000001',
    'Nexus Global Advisors',
    'Nexus Global Advisors is a premier incorporation and corporate structuring firm serving entrepreneurs and multinationals across the Gulf, Southeast Asia, and Europe. Our team of 40+ licensed professionals has facilitated over 2,000 company formations across 18 jurisdictions since 2010. We specialise in UAE free zone setups, Singapore holding structures, and EU regulatory compliance, providing end-to-end support from entity selection to banking introduction.',
    'https://nexusglobal.example.com',
    'verified', '$3,000 - $7,500',
    ARRAY['Company Formation', 'Banking Setup', 'Tax Advisory', 'Legal Compliance'],
    ARRAY['English', 'Arabic', 'Chinese'],
    4, 4.90, 127
  ),
  (
    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    '11111111-0002-0002-0002-000000000002',
    'Orient Corporate Services',
    'Based in Singapore with offices in Hong Kong and Dubai, Orient Corporate Services delivers fast, reliable company incorporation with a focus on Asia–Pacific markets. We handle the entire lifecycle — from business name registration and corporate bank account opening to ongoing annual filings and nominee director arrangements. Our average Singapore incorporation time is 3 business days.',
    'https://orientcorp.example.com',
    'verified', '$1,500 - $3,000',
    ARRAY['Company Formation', 'Banking Setup', 'Nominee Services', 'Virtual Office'],
    ARRAY['English', 'Chinese', 'Malay'],
    24, 4.75, 84
  ),
  (
    'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa',
    '11111111-0003-0003-0003-000000000003',
    'Alpina Fiduciary Group',
    'Alpina Fiduciary Group has been a trusted name in European corporate structuring for over 15 years, with deep expertise in Malta, Germany, and UK entity formation. We serve family offices, fintech startups, and regulated financial entities requiring EU passporting. Our legal team holds active licenses in 5 EU member states, ensuring full compliance from day one.',
    'https://alpina-fiduciary.example.com',
    'verified', '$3,000 - $7,500',
    ARRAY['Company Formation', 'Legal Compliance', 'Tax Advisory', 'Accounting'],
    ARRAY['English', 'German', 'French'],
    48, 4.60, 52
  ),
  (
    'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa',
    '11111111-0004-0004-0004-000000000004',
    'Meridian Formation Ltd',
    'Meridian Formation Ltd is the go-to partner for offshore structures and asset protection vehicles. We specialise in BVI, Cayman, and Seychelles formations with proven banking introductions to tier-1 private banks in Liechtenstein, Singapore, and Mauritius. Our discreet, secure service has been relied upon by HNW individuals and investment funds for 12 years.',
    'https://meridian-formation.example.com',
    'verified', '$1,500 - $3,000',
    ARRAY['Company Formation', 'Nominee Services', 'Banking Setup', 'Legal Compliance'],
    ARRAY['English', 'Spanish', 'Portuguese'],
    24, 4.50, 61
  ),
  (
    'aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa',
    '11111111-0005-0005-0005-000000000005',
    'Atlas Business Structuring',
    'Atlas Business Structuring helps tech founders and e-commerce entrepreneurs establish US and UK entities optimised for SaaS revenue, investor readiness, and Stripe/PayPal account eligibility. We offer complete Delaware LLC and Wyoming LLC packages with EIN registration, US virtual address, and business bank account opening — all remotely, in under 7 days.',
    'https://atlasbiz.example.com',
    'verified', '$500 - $1,500',
    ARRAY['Company Formation', 'Tax Advisory', 'Virtual Office', 'Accounting'],
    ARRAY['English', 'Spanish'],
    4, 4.80, 213
  ),
  (
    'aaaaaaaa-0006-0006-0006-aaaaaaaaaaaa',
    '11111111-0006-0006-0006-000000000006',
    'Sovereign Jurisdictions',
    'Sovereign Jurisdictions provides boutique corporate structuring services for international investors seeking substance-first, tax-efficient holding group architectures. Our multi-disciplinary team combines legal, tax, and accounting expertise to design bespoke structures using UAE, Singapore, Malta, and Netherlands as parent-company jurisdictions. We only accept a limited number of clients per quarter to ensure dedicated service.',
    'https://sovereign-jd.example.com',
    'verified', '$7,500+',
    ARRAY['Company Formation', 'Tax Advisory', 'Legal Compliance', 'Banking Setup', 'Accounting'],
    ARRAY['English', 'Arabic', 'Russian', 'French'],
    48, 4.95, 38
  ),
  (
    'aaaaaaaa-0007-0007-0007-aaaaaaaaaaaa',
    '11111111-0007-0007-0007-000000000007',
    'Gateway Corporate Ltd',
    'Gateway Corporate Ltd specialises in immigration-linked company formations — ideal for entrepreneurs seeking UAE Golden Visa, UK Innovator Founder Visa, or Portugal Golden Visa through business investment. Our integrated approach connects your corporate structure directly to your residency pathway, saving time and eliminating the need for multiple advisors.',
    'https://gateway-corp.example.com',
    'verified', '$3,000 - $7,500',
    ARRAY['Company Formation', 'Visa & Immigration', 'Legal Compliance', 'Banking Setup'],
    ARRAY['English', 'Arabic', 'Russian'],
    24, 4.40, 47
  ),
  (
    'aaaaaaaa-0008-0008-0008-aaaaaaaaaaaa',
    '11111111-0008-0008-0008-000000000008',
    'Sterling Compliance Group',
    'Sterling Compliance Group is an accounting-first incorporation partner offering ongoing bookkeeping, VAT registration, payroll, and annual return filing alongside company setup. We are ideal for founders who want a single partner handling their entire compliance calendar post-incorporation. Our team of certified accountants serves 500+ active corporate clients across the UK, UAE, and Hong Kong.',
    'https://sterling-compliance.example.com',
    'verified', '$1,500 - $3,000',
    ARRAY['Company Formation', 'Accounting', 'Tax Advisory', 'Legal Compliance'],
    ARRAY['English', 'Chinese', 'Arabic'],
    72, 4.30, 95
  )
ON CONFLICT (profile_id) DO UPDATE SET
  company_name    = EXCLUDED.company_name,
  bio             = EXCLUDED.bio,
  status          = EXCLUDED.status,
  pricing_band    = EXCLUDED.pricing_band,
  services        = EXCLUDED.services,
  languages       = EXCLUDED.languages,
  response_time_hours = EXCLUDED.response_time_hours,
  rating_avg      = EXCLUDED.rating_avg,
  review_count    = EXCLUDED.review_count;

-- ─── Step 5: Link providers → countries ──────────────────────────────────────
-- Using subqueries to avoid hardcoding country UUIDs
INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('AE','SG','GB')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('SG','HK','AE')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('MT','DE','GB')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('BVI','SG','HK')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('US','GB')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0006-0006-0006-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('AE','SG','MT','GB')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0007-0007-0007-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('AE','GB')
ON CONFLICT DO NOTHING;

INSERT INTO public.provider_countries (provider_id, country_id)
SELECT 'aaaaaaaa-0008-0008-0008-aaaaaaaaaaaa', id FROM public.countries WHERE code IN ('GB','AE','HK')
ON CONFLICT DO NOTHING;

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- To verify: SELECT company_name, status, rating_avg, review_count FROM providers ORDER BY rating_avg DESC;
