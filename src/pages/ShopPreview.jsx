import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { MapPin, MessageCircle, Phone, Loader2 } from '../components/Icons';

export default function ShopPreview() {
  const { shop: contextShop, products: contextProducts } = useApp();
  const [publicShop, setPublicShop] = useState(null);
  const [publicProducts, setPublicProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicShop() {
      if (!contextShop?.slug) { setLoading(false); return; }
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', contextShop.slug)
        .eq('status', 'active')
        .maybeSingle();

      if (shopData) {
        setPublicShop({
          id: shopData.id, name: shopData.name, city: shopData.city || '',
          whatsapp: shopData.whatsapp || '', description: shopData.description || '',
          slug: shopData.slug,
          banner: shopData.banner || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200',
          logo: shopData.logo || 'https://images.pexels.com/photos/4226880/pexels-photo-4226880.jpeg?auto=compress&cs=tinysrgb&w=200',
          plan: shopData.plan, status: shopData.status,
        });

        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false });

        setPublicProducts((productData || []).map((p) => ({
          id: p.id, name: p.name, price: Number(p.price),
          image: p.image || '', description: p.description || '',
          category: p.category || '', tags: p.tags || [],
        })));
      }
      setLoading(false);
    }
    fetchPublicShop();
  }, [contextShop?.slug]);

  const shop = publicShop || contextShop;
  const products = publicProducts.length > 0 ? publicProducts : contextProducts;

  const handleOrder = (productName) => {
    if (!shop) return;
    const message = encodeURIComponent(`Hi! I'd like to order: ${productName}`);
    const phone = shop.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (!shop) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50"><div className="text-center"><p className="text-surface-400 font-medium text-lg">Shop not found</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-surface-50 page-enter">
      <div className="relative h-44 sm:h-56 lg:h-72 bg-surface-200 overflow-hidden">
        <img src={shop.banner} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 sm:-mt-18 lg:-mt-20 mb-4 flex items-end gap-4 lg:gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl border-4 border-white shadow-card overflow-hidden bg-white flex-shrink-0">
            <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="pb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900">{shop.name || 'My Shop'}</h1>
            <div className="flex items-center gap-1.5 text-surface-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{shop.city || 'City'}</span>
            </div>
          </div>
        </div>

        {shop.description && <p className="text-surface-600 text-sm lg:text-base leading-relaxed mb-6 max-w-2xl">{shop.description}</p>}

        <div className="flex gap-3 mb-8 max-w-md">
          <a href={`tel:${shop.whatsapp}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-surface-200 rounded-xl text-surface-700 font-semibold text-sm hover:border-surface-300 transition-all active:scale-[0.98]">
            <Phone className="w-4 h-4" /> Call
          </a>
          <button
            onClick={() => {
              const message = encodeURIComponent('Hi! I want to know about your products.');
              const phone = shop.whatsapp.replace(/\D/g, '');
              window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all active:scale-[0.98] shadow-soft"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
        </div>

        <h2 className="text-lg lg:text-xl font-bold text-surface-900 mb-4">Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-12"><p className="text-surface-400 font-medium">No products available yet</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 pb-8">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-card overflow-hidden group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative overflow-hidden flex-1">
                  <img src={product.image} alt={product.name} className="w-full h-32 sm:h-36 lg:h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.tags && product.tags.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-block px-2.5 py-1 bg-primary-600 text-white text-xs font-bold rounded-lg shadow-md">{product.tags[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 lg:p-4 flex flex-col">
                  <p className="text-sm font-semibold text-surface-900 truncate">{product.name}</p>
                  <p className="text-base font-bold text-primary-600 mt-1">₹{product.price}</p>
                  <button onClick={() => handleOrder(product.name)} className="w-full mt-auto pt-3 py-2.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all active:scale-95 shadow-soft">
                    Order on WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-surface-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center gap-2">
          <span className="text-xs text-surface-400 font-medium">Powered by</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center"><span className="text-white font-extrabold text-[8px]">D</span></div>
            <span className="text-xs font-bold text-surface-700">DukanLink</span>
          </div>
        </div>
      </div>
    </div>
  );
}
