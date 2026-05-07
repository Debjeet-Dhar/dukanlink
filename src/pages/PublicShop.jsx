import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MapPin, MessageCircle, Phone, Loader2, ArrowLeft } from '../components/Icons';
import { getProductImageUrl } from '../lib/productImage';

export default function PublicShop() {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShop() {
      if (!slug) { setLoading(false); return; }
      if (!supabase) { setLoading(false); return; }

      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();

      if (shopData) {
        setShop({
          id: shopData.id,
          name: shopData.name,
          city: shopData.city || '',
          whatsapp: shopData.whatsapp || '',
          description: shopData.description || '',
          slug: shopData.slug,
          banner: shopData.banner || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200',
          logo: shopData.logo || 'https://images.pexels.com/photos/4226880/pexels-photo-4226880.jpeg?auto=compress&cs=tinysrgb&w=200',
          plan: shopData.plan,
        });

        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false });

        setProducts((productData || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: getProductImageUrl(p.image),
          description: p.description || '',
          category: p.category || '',
          tags: p.tags || [],
        })));
      }
      setLoading(false);
    }
    fetchShop();
  }, [slug]);

  const handleOrder = (productName) => {
    if (!shop) return;
    const message = encodeURIComponent(`Hi! I'd like to order: ${productName}`);
    let phone = shop.whatsapp.replace(/\D/g, '');
    if (!phone.startsWith('91')) {
    phone = '+91' + phone;
    }
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const categories = useMemo(() => {
    const categoryNames = products.map((product) => product.category).filter(Boolean);
    return ['All', ...Array.from(new Set(categoryNames))];
  }, [products]);

  const visibleProducts = selectedCategory === 'All'
    ? products
    : products.filter((product) => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-bold text-surface-900 mb-2">Database not configured</h2>
          <p className="text-surface-600 text-sm leading-relaxed mb-6">
            Add <span className="font-mono text-xs">VITE_SUPABASE_URL</span> and <span className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</span> to a <span className="font-mono text-xs">.env</span> file (see <span className="font-mono text-xs">.env.example</span>), then restart the dev server.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-surface-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Shop not found</h2>
          <p className="text-surface-500 text-sm mb-6">This shop may have been removed or the link is incorrect.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] page-enter pb-20 sm:pb-0">
      <div className="relative h-52 sm:h-64 lg:h-80 bg-surface-200 overflow-visible">
        <img src={shop.banner} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute top-4 left-4 right-4 mx-auto flex max-w-5xl items-center justify-between text-white sm:px-2">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-white/25">
            <ArrowLeft className="w-3.5 h-3.5" /> DukanLink
          </Link>
          <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-md">Open now</span>
        </div>
        <div className="absolute left-1/2 bottom-0 h-28 w-28 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white shadow-elevated sm:h-32 sm:w-32 lg:h-36 lg:w-36">
          <img src={shop.logo} alt="Logo" className="h-full w-full rounded-full object-cover" />
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-14 text-center sm:pt-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Verified shop
            </div>
            <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl lg:text-4xl">{shop.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3 text-surface-500">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {shop.city}
              </span>
              <span className="text-sm font-medium">{products.length} products</span>
            </div>

            {shop.description && (
              <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-6 text-surface-600 lg:text-base">{shop.description}</p>
            )}

            <div className="mx-auto mt-3.5 grid max-w-sm grid-cols-2 gap-3">
              <a
                href={`tel:${shop.whatsapp}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-bold text-surface-700 shadow-soft transition-all hover:border-surface-300 hover:shadow-card active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
              <button
                onClick={() => {
                  const message = encodeURIComponent('Hi! I want to know about your products.');
                  const phone = shop.whatsapp.replace(/\D/g, '');
                  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-elevated transition-all hover:bg-green-700 active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" /> Chat
              </button>
            </div>
          </div>
        </section>

        <div className="mb-5 mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary-700">Catalog</p>
            <h2 className="mt-1 text-2xl font-bold text-surface-900 lg:text-3xl">Featured Products</h2>
            <p className="mt-0.5 text-sm font-medium text-surface-500">Choose your item and order directly on WhatsApp.</p>
          </div>
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 sm:max-w-[58%] scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                    selectedCategory === category
                      ? 'border-primary-600 bg-primary-600 text-white shadow-soft'
                      : 'border-surface-200 bg-white text-surface-600 shadow-soft hover:border-surface-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        {products.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-surface-300 bg-white py-16 text-center shadow-soft">
            <p className="text-surface-400 font-medium">No products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-10 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {visibleProducts.map(product => (
              <div key={product.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-surface-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-elevated">
                <div className="relative m-2 overflow-hidden rounded-[20px] bg-[#f3f5ef]">
                  <div className="flex h-56 items-center justify-center min-[420px]:h-44 sm:h-48 lg:h-52">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="absolute left-3 top-3">
                      <span className="inline-block rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-surface-800 shadow-soft backdrop-blur">
                        {product.tags[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col px-4 pb-4 pt-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {product.category && <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-primary-700">{product.category}</p>}
                      <p className="line-clamp-2 text-base font-extrabold leading-5 text-surface-900">{product.name}</p>
                    </div>
                  </div>
                  {product.description && <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-surface-500">{product.description}</p>}
                  <div className="pt-3">
                    <div className="mb-2.5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-surface-400">Price</p>
                        <p className="text-xl font-extrabold text-surface-900">₹{product.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOrder(product.name)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-soft transition-all hover:bg-green-700 hover:shadow-card active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" /> Order on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-surface-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center gap-2">
          <span className="text-xs text-surface-400 font-medium">Powered by</span>
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-extrabold text-[8px]">D</span>
            </div>
            <span className="text-xs font-bold text-surface-700">DukanLink</span>
          </Link>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-200 bg-white/95 p-3 shadow-elevated backdrop-blur sm:hidden">
        <button
          onClick={() => {
            const message = encodeURIComponent('Hi! I want to know about your products.');
            const phone = shop.whatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-elevated active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
        </button>
      </div>
    </div>
  );
}

function Store({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 2v20" /><path d="M20 2v20" /><path d="M4 7h16" /><path d="M4 17h16" />
    </svg>
  );
}
