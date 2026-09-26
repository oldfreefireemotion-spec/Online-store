-- ====================================================================
-- FRESHCART GROCERY WEB APP - SUPABASE DATABASE SCHEMA
-- ====================================================================
-- Tables: categories, products
-- Features: Foreign keys, performance indexes, Row Level Security (RLS),
--           Public SELECT policies, and initial sample data (BDT prices).
-- ====================================================================

-- 1. DROP EXISTING TABLES (Safe for fresh setup)
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE public.categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comment on table & columns
COMMENT ON TABLE public.categories IS 'Grocery categories for product classification';
COMMENT ON COLUMN public.categories.name IS 'Name of grocery category (e.g. Vegetables, Fruits)';

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE public.products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT 'kg',
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comment on table & columns
COMMENT ON TABLE public.products IS 'Grocery items available for customer orders';
COMMENT ON COLUMN public.products.unit IS 'Unit of measurement (e.g., kg, dozen, litre, pack)';

-- 4. CREATE PERFORMANCE INDEXES
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_available ON public.products(available);
CREATE INDEX idx_products_name ON public.products(name text_pattern_ops);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR CATEGORIES
-- Allow anyone (public anon + authenticated) to read categories
CREATE POLICY "Allow public read access on categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

-- 7. RLS POLICIES FOR PRODUCTS
-- Allow anyone (public anon + authenticated) to read products where available = true
-- (Or all products so frontend can show 'Out of Stock' badge)
CREATE POLICY "Allow public read access on products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- (Notice: INSERT, UPDATE, DELETE policies are intentionally omitted for anon,
--  ensuring the public user panel has read-only access. Only service_role or 
--  authenticated admins in future will manage data.)

-- 8. SUPABASE STORAGE BUCKET CONFIGURATION (for product-images)
-- Note: You can also create this in the Supabase Dashboard -> Storage -> New Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to product-images bucket
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- 9. SAMPLE DATA - CATEGORIES (Bangladeshi Grocery Market)
INSERT INTO public.categories (name, image_url) VALUES
('Vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80'),
('Fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80'),
('Grocery', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'),
('Eggs', 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80'),
('Fish', 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&auto=format&fit=crop&q=80'),
('Meat', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&auto=format&fit=crop&q=80'),
('Drinks', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80'),
('Others', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80');

-- 10. SAMPLE DATA - PRODUCTS (Realistic Bangladeshi Prices in BDT)
INSERT INTO public.products (name, description, price, unit, category_id, image_url, available) VALUES
-- Vegetables (category_id = 1)
('Potato (আলু)', 'Fresh red and white local potatoes', 50.00, 'kg', 1, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80', true),
('Onion (পেঁয়াজ)', 'High quality local deshi onion', 80.00, 'kg', 1, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80', true),
('Tomato (টমেটো)', 'Farm fresh ripe red tomatoes', 60.00, 'kg', 1, 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=500&auto=format&fit=crop&q=80', true),
('Carrot (গাজর)', 'Crisp sweet orange carrots', 70.00, 'kg', 1, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80', true),
('Green Chili (কাঁচা মরিচ)', 'Pungent fresh green chilies', 120.00, 'kg', 1, 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80', true),

-- Fruits (category_id = 2)
('Apple Fuji (আপেল)', 'Fresh sweet and crisp imported Fuji apples', 260.00, 'kg', 2, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80', true),
('Banana Sagor (সাগর কলা)', 'Naturally ripened sweet bananas', 100.00, 'dozen', 2, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80', true),
('Orange (কমলা)', 'Juicy sweet imported oranges', 220.00, 'kg', 2, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80', true),

-- Grocery (category_id = 3)
('Miniket Rice (মিনিকেট চাল)', 'Premium polished long grain Miniket rice', 75.00, 'kg', 3, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80', true),
('Masoor Dal (মসুর ডাল)', 'Clean premium red lentils', 135.00, 'kg', 3, 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=80', true),
('Soybean Oil (সয়াবিন তেল)', 'Rupchanda fortified soybean cooking oil', 175.00, 'litre', 3, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80', true),

-- Eggs (category_id = 4)
('Farm Fresh Brown Eggs (লাল ডিম)', 'Nutritious fresh brown chicken eggs', 145.00, 'dozen', 4, 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80', true),
('Duck Eggs (হাঁসের ডিম)', 'Fresh deshi duck eggs', 190.00, 'dozen', 4, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80', true),

-- Fish (category_id = 5)
('Ruhi Fish (রুই মাছ)', 'Fresh river Ruhi cleaned & gutted (approx. 1.5kg)', 380.00, 'kg', 5, 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=80', true),
('Hilsa / Ilish (ইলিশ মাছ)', 'Padma river silver Hilsa (approx. 800g-1kg)', 1250.00, 'kg', 5, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80', false), -- out of stock sample

-- Meat (category_id = 6)
('Broiler Chicken (ব্রয়লার মুরগি)', 'Skin-off fresh cleaned broiler chicken', 190.00, 'kg', 6, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80', true),
('Beef Bone-in (গরুর মাংস)', 'Fresh local grass-fed beef with bone', 780.00, 'kg', 6, 'https://images.unsplash.com/photo-1588347818036-558601350947?w=500&auto=format&fit=crop&q=80', true),

-- Drinks (category_id = 7)
('Aarong Pasteurized Milk (দুধ)', 'Fresh 100% pure pasteurized liquid milk', 90.00, 'litre', 7, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80', true),
('Pran Mango Juice (ম্যাংগো জুস)', 'Refreshing mango pulp drink 500ml', 45.00, 'pack', 7, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80', true);
