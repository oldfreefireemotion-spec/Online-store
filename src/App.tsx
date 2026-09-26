import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Copy, 
  Database, 
  ExternalLink, 
  X, 
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  User,
  FileText
} from 'lucide-react';

interface Category {
  id: number | string;
  name: string;
  image_url?: string;
}

interface Product {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  category_id: number | string;
  image_url?: string;
  available: boolean;
}

interface CartItem {
  product_id: number | string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image_url?: string;
}

const DEFAULT_ADMIN_WHATSAPP = "8801712345678";
const DELIVERY_CHARGE = 0;
const CURRENCY_SYMBOL = "৳";

// Seed sample data matching Step 1 SQL
const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Vegetables", image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80" },
  { id: 2, name: "Fruits", image_url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80" },
  { id: 3, name: "Grocery", image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80" },
  { id: 4, name: "Eggs", image_url: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80" },
  { id: 5, name: "Fish", image_url: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&auto=format&fit=crop&q=80" },
  { id: 6, name: "Meat", image_url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&auto=format&fit=crop&q=80" },
  { id: 7, name: "Drinks", image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80" },
  { id: 8, name: "Others", image_url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80" }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Potato (আলু)", description: "Fresh local red and white potatoes", price: 50, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 2, name: "Onion (পেঁয়াজ)", description: "High quality local deshi onion", price: 80, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 3, name: "Tomato (টমেটো)", description: "Farm fresh ripe red tomatoes", price: 60, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 4, name: "Carrot (গাজর)", description: "Crisp sweet orange carrots", price: 70, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 5, name: "Green Chili (কাঁচা মরিচ)", description: "Pungent fresh green chilies", price: 120, unit: "kg", category_id: 1, image_url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 6, name: "Apple Fuji (আপেল)", description: "Fresh sweet and crisp imported Fuji apples", price: 260, unit: "kg", category_id: 2, image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 7, name: "Banana Sagor (সাগর কলা)", description: "Naturally ripened sweet bananas", price: 100, unit: "dozen", category_id: 2, image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 8, name: "Miniket Rice (মিনিকেট চাল)", description: "Premium polished long grain Miniket rice", price: 75, unit: "kg", category_id: 3, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 9, name: "Masoor Dal (মসুর ডাল)", description: "Clean premium red lentils", price: 135, unit: "kg", category_id: 3, image_url: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 10, name: "Farm Fresh Brown Eggs (লাল ডিম)", description: "Nutritious fresh brown chicken eggs", price: 145, unit: "dozen", category_id: 4, image_url: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 11, name: "Ruhi Fish (রুই মাছ)", description: "Cleaned fresh river Ruhi fish", price: 380, unit: "kg", category_id: 5, image_url: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 12, name: "Aarong Milk (দুধ)", description: "Pure pasteurized liquid milk", price: 90, unit: "litre", category_id: 7, image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80", available: true },
  { id: 13, name: "Hilsa / Ilish (ইলিশ)", description: "Padma river silver Hilsa", price: 1250, unit: "kg", category_id: 5, image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80", available: false }
];

export default function App() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('freshcart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal & Navigation States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  // Supabase Config State
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('freshcart_sb_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('freshcart_sb_key') || '');
  const [adminWhatsapp, setAdminWhatsapp] = useState(() => localStorage.getItem('freshcart_admin_wa') || DEFAULT_ADMIN_WHATSAPP);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [copiedSql, setCopiedSql] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('freshcart_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn(e);
    }
  }, [cart]);

  // Try connecting to Supabase if credentials exist
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
      testAndConnectSupabase(supabaseUrl, supabaseAnonKey);
    }
  }, []);

  const testAndConnectSupabase = async (url: string, key: string) => {
    setConnectionStatus('testing');
    try {
      const client = createClient(url, key);
      const [catRes, prodRes] = await Promise.all([
        client.from('categories').select('*').order('id', { ascending: true }),
        client.from('products').select('*').order('created_at', { ascending: false })
      ]);

      if (catRes.error || prodRes.error) {
        throw new Error(catRes.error?.message || prodRes.error?.message);
      }

      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
      if (prodRes.data && prodRes.data.length > 0) {
        setProducts(prodRes.data);
      }

      setIsConnectedToSupabase(true);
      setConnectionStatus('connected');
      localStorage.setItem('freshcart_sb_url', url);
      localStorage.setItem('freshcart_sb_key', key);
      showToast('Connected to Supabase live database!');
    } catch (err: any) {
      console.warn('Supabase connection note:', err.message);
      setConnectionStatus('error');
      setIsConnectedToSupabase(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (!product.available) return;
    setCart(prev => {
      const existsIndex = prev.findIndex(item => String(item.product_id) === String(product.id));
      if (existsIndex > -1) {
        const copy = [...prev];
        copy[existsIndex].quantity += 1;
        return copy;
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            price: Number(product.price),
            unit: product.unit,
            quantity: 1,
            image_url: product.image_url
          }
        ];
      }
    });
    showToast(`Added ${product.name} to cart`);
  };

  const increaseQuantity = (productId: string | number) => {
    setCart(prev =>
      prev.map(item =>
        String(item.product_id) === String(productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string | number) => {
    setCart(prev =>
      prev
        .map(item =>
          String(item.product_id) === String(productId)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string | number) => {
    setCart(prev => prev.filter(item => String(item.product_id) !== String(productId)));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculateTotal = () => calculateSubtotal() + DELIVERY_CHARGE;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Validate Customer Information
  const validateForm = () => {
    const errors: { name?: string; phone?: string; address?: string } = {};

    if (!customerName.trim()) {
      errors.name = "Please enter your name.";
    }

    const cleanPhone = customerPhone.replace(/[\s\-\+]/g, '');
    const bdPhoneRegex = /^(?:8801|01)[3-9]\d{8}$/;
    if (!cleanPhone) {
      errors.phone = "Please enter your phone number.";
    } else if (!bdPhoneRegex.test(cleanPhone)) {
      errors.phone = "Enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).";
    }

    if (!customerAddress.trim()) {
      errors.address = "Please enter your delivery address.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // WhatsApp Order Generator
  const sendWhatsAppOrder = () => {
    if (cart.length === 0) {
      showToast("Your cart is empty.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    let msg = `*NEW GROCERY ORDER*\n\n`;
    msg += `*Customer:*\n${customerName.trim()}\n\n`;
    msg += `*Phone:*\n${customerPhone.trim()}\n\n`;
    msg += `*Delivery Address:*\n${customerAddress.trim()}\n\n`;
    msg += `*Products:*\n`;

    cart.forEach((item, idx) => {
      const lineSubtotal = item.price * item.quantity;
      msg += `${idx + 1}. *${item.name}*\n`;
      msg += `   Quantity: ${item.quantity} ${item.unit}\n`;
      msg += `   Price: ${CURRENCY_SYMBOL}${item.price}/${item.unit}\n`;
      msg += `   Subtotal: ${CURRENCY_SYMBOL}${lineSubtotal}\n\n`;
    });

    msg += `------------------------\n`;
    msg += `*Subtotal:* ${CURRENCY_SYMBOL}${subtotal}\n`;
    msg += `*Delivery:* ${CURRENCY_SYMBOL}${DELIVERY_CHARGE}\n\n`;
    msg += `*TOTAL:* ${CURRENCY_SYMBOL}${total}\n`;

    if (customerNote.trim()) {
      msg += `\n*Note:*\n${customerNote.trim()}\n`;
    }

    msg += `====================`;

    const encoded = encodeURIComponent(msg);
    const cleanNumber = adminWhatsapp.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;

    showToast("Your order is ready. WhatsApp will open now.");

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setCart([]);
      setIsCartOpen(false);
    }, 800);
  };

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'all' || String(p.category_id) === String(activeCategory);
    const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchCategory && matchSearch;
  });

  const step1Sql = `-- SUPABASE POSTGRESQL SCHEMA FOR FRESHCART
-- 1. Create categories table
CREATE TABLE public.categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create products table
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

-- 3. Indexes for speed
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_available ON public.products(available);
CREATE INDEX idx_products_name ON public.products(name text_pattern_ops);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Public read-only policies
CREATE POLICY "Allow public read access on categories"
ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read access on products"
ON public.products FOR SELECT TO anon, authenticated USING (true);

-- 6. Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Banner / Supabase Step 1 Status Bar */}
      <div className="bg-emerald-900 text-white text-xs px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnectedToSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="font-medium">
            {isConnectedToSupabase 
              ? 'Connected to Live Supabase DB' 
              : 'Supabase DB Ready (Demo Preview Mode)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-700 px-2.5 py-1 rounded text-emerald-100 font-medium transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>View Step 1 SQL & Keys</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <div className="leading-tight">
              <span className="text-lg font-black tracking-tight text-gray-900">Fresh<span className="text-emerald-600">Cart</span></span>
              <p className="text-[10px] text-gray-500 font-medium hidden sm:block">Dhaka Fresh Grocery Express</p>
            </div>
          </div>

          {/* Quick Cart Trigger in Header */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded-xl font-bold text-sm transition cursor-pointer border border-emerald-200"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span className="hidden xs:inline">Basket</span>
            <span className="bg-emerald-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
              {totalCartCount}
            </span>
          </button>
        </div>
      </header>

      {/* Search Input Bar */}
      <div className="max-w-5xl mx-auto px-4 mt-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fresh vegetables, fruits, groceries (e.g. potato, egg, dal)..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Navigation Bar */}
      <div className="max-w-5xl mx-auto px-4 mt-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>🛍️ All</span>
            <span className="text-[10px] opacity-80">({products.length})</span>
          </button>

          {categories.map((cat) => {
            const count = products.filter(p => String(p.category_id) === String(cat.id)).length;
            const isActive = String(activeCategory) === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Section */}
      <main className="max-w-5xl mx-auto px-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>Fresh Groceries</span>
            {searchQuery && (
              <span className="text-xs font-normal text-gray-500">
                matching "{searchQuery}"
              </span>
            )}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Product Grid: Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center my-6">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-800 mb-1">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              We couldn't find any grocery items matching your criteria. Try another search or category.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find(item => String(item.product_id) === String(product.id));
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    {!product.available && (
                      <span className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                        Out of Stock
                      </span>
                    )}
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                        {inCart.quantity} in cart
                      </span>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-base font-extrabold text-emerald-600">
                          {CURRENCY_SYMBOL}{Number(product.price).toFixed(0)}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          / {product.unit}
                        </span>
                      </div>

                      {product.available ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-400 font-medium py-2 px-3 rounded-lg text-xs cursor-not-allowed border border-gray-200"
                        >
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer / Bottom Sheet Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            {/* Cart Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h3 className="font-bold text-gray-900 text-base">Your Grocery Basket</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalCartCount} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List & Checkout Form */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-5xl mb-3">🛒</div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Your cart is empty</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Explore fresh vegetables, fruits, and groceries to get started!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {cart.map((item) => {
                      const itemSubtotal = item.price * item.quantity;
                      return (
                        <div
                          key={item.product_id}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-white"
                        >
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs truncate">{item.name}</h4>
                            <div className="text-gray-500 text-[11px]">
                              {CURRENCY_SYMBOL}{item.price} / {item.unit}
                            </div>
                            <div className="text-emerald-600 font-bold text-xs mt-0.5">
                              Subtotal: {CURRENCY_SYMBOL}{itemSubtotal}
                            </div>
                          </div>

                          {/* Quantity Controls [-] qty [+] */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                            <button
                              onClick={() => decreaseQuantity(item.product_id)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 text-gray-700 transition font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item.product_id)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 text-gray-700 transition font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-800">{CURRENCY_SYMBOL}{calculateSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charge</span>
                      <span className="font-semibold text-emerald-600">
                        {DELIVERY_CHARGE === 0 ? 'FREE (৳0)' : `${CURRENCY_SYMBOL}${DELIVERY_CHARGE}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm font-extrabold text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-emerald-600">{CURRENCY_SYMBOL}{calculateTotal()}</span>
                    </div>
                  </div>

                  {/* Customer Checkout Form */}
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Information</span>
                    </h4>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                          }}
                          placeholder="e.g. Rahim Ahmed"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {formErrors.name && (
                          <p className="text-[11px] text-red-500 mt-0.5">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Bangladeshi Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => {
                            setCustomerPhone(e.target.value);
                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                          }}
                          placeholder="e.g. 01712345678"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {formErrors.phone && (
                          <p className="text-[11px] text-red-500 mt-0.5">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Delivery Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => {
                            setCustomerAddress(e.target.value);
                            if (formErrors.address) setFormErrors({ ...formErrors, address: undefined });
                          }}
                          placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {formErrors.address && (
                          <p className="text-[11px] text-red-500 mt-0.5">{formErrors.address}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Delivery Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={customerNote}
                          onChange={(e) => setCustomerNote(e.target.value)}
                          placeholder="e.g. Please deliver around 6 PM"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Footer: WhatsApp Action */}
            {cart.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5b] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.228-.553-1.849-.764-3.033-2.637-3.125-2.76-.093-.123-.746-.992-.746-1.893 0-.901.472-1.343.64-1.525.168-.182.368-.228.491-.228.123 0 .246.001.353.007.113.006.264-.043.414.318.155.372.532 1.298.579 1.393.047.095.078.207.016.33-.062.123-.093.2-.185.308-.093.108-.195.24-.279.323-.093.093-.19.194-.082.38.108.186.481.794 1.033 1.286.711.634 1.311.83 1.497.923.186.093.294.078.402-.046.108-.124.463-.538.587-.723.123-.185.247-.154.415-.092.169.062 1.066.503 1.25.595.185.093.308.139.354.216.046.077.046.447-.098.852z"/>
                  </svg>
                  <span>Send Order on WhatsApp ({CURRENCY_SYMBOL}{calculateTotal()})</span>
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-2">
                  Sends pre-formatted order message to Admin WhatsApp ({adminWhatsapp})
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supabase Step 1 SQL & Config Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Supabase Step 1: PostgreSQL Schema & Keys</h3>
                  <p className="text-[11px] text-emerald-300">Run this SQL in your Supabase SQL Editor</p>
                </div>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 text-gray-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Instructions */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900">
                <h4 className="font-bold text-xs mb-1">How to execute STEP 1 in Supabase:</h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800">
                  <li>Log in to your <strong>Supabase Dashboard</strong> and open your project.</li>
                  <li>Go to <strong>SQL Editor</strong> in the left sidebar.</li>
                  <li>Click <strong>New query</strong>, paste the complete SQL script below, and click <strong>Run</strong>.</li>
                  <li>Your tables (<code className="bg-emerald-100 px-1 rounded">categories</code>, <code className="bg-emerald-100 px-1 rounded">products</code>), RLS policies, and sample data will be created!</li>
                </ol>
              </div>

              {/* SQL Code Block */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-700">Complete Supabase Schema SQL:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(step1Sql);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded font-semibold transition"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
                <pre className="bg-gray-900 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                  {step1Sql}
                </pre>
              </div>

              {/* Live Connection Config */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-gray-900 text-xs mb-2">Connect Your Supabase Project (Live Sync):</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Supabase Project URL:
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Supabase Anon / Public Key:
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Admin WhatsApp Number (Without '+', e.g. 88017XXXXXXXX):
                    </label>
                    <input
                      type="text"
                      value={adminWhatsapp}
                      onChange={(e) => {
                        setAdminWhatsapp(e.target.value);
                        localStorage.setItem('freshcart_admin_wa', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <button
                    onClick={() => testAndConnectSupabase(supabaseUrl, supabaseAnonKey)}
                    disabled={connectionStatus === 'testing' || !supabaseUrl || !supabaseAnonKey}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {connectionStatus === 'testing' ? 'Testing Connection...' : 'Connect & Sync Live Products'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation (Section 21) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-2 z-30 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setActiveCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer"
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <span className="text-xl">📂</span>
          <span className="text-[10px] font-medium">Categories</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-emerald-600 cursor-pointer"
        >
          <span className="text-xl">🛍️</span>
          <span className="text-[10px] font-bold">Cart</span>
          {totalCartCount > 0 && (
            <span className="absolute -top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </button>
      </nav>

      {/* Floating Toast Notification (Section 10) */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-xs text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce-subtle pointer-events-none">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
