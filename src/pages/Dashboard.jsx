import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CopyButton } from '../components/UI';
import { Settings, ExternalLink, Package, ChevronRight, Crown, Loader2, Check, AlertCircle, MessageCircle, Store } from '../components/Icons';

export default function Dashboard() {
  const { shop, products, shopLoading, FREE_PRODUCT_LIMIT } = useApp();
  const shopUrl = `dukanlink.in/${shop?.slug || 'myshop'}`;
  const isPremium = shop?.plan === 'premium';
  const productsWithImages = products.filter(product => Boolean(product.image)).length;
  const productsWithDescriptions = products.filter(product => Boolean(product.description?.trim())).length;
  const catalogCompletion = products.length === 0
    ? 0
    : Math.round(((productsWithImages + productsWithDescriptions) / (products.length * 2)) * 100);
  const isLive = shop?.status === 'active';

  const stats = [
    {
      label: 'Products',
      value: String(products.length),
      sub: isPremium ? 'Unlimited catalog' : `${Math.max(FREE_PRODUCT_LIMIT - products.length, 0)} slots left`,
      icon: <Package className="w-5 h-5" />,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Shop Status',
      value: isLive ? 'Live' : shop?.status || 'Draft',
      sub: isLive ? 'Visible to customers' : 'Hidden from public shop',
      icon: isLive ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />,
      color: isLive ? 'text-primary-600 bg-primary-50' : 'text-red-600 bg-red-50',
    },
    {
      label: 'Catalog Health',
      value: `${catalogCompletion}%`,
      sub: products.length ? `${productsWithImages}/${products.length} images added` : 'Add products to begin',
      icon: <Store className="w-5 h-5" />,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      label: 'Plan',
      value: isPremium ? 'Premium' : 'Free',
      sub: isPremium ? 'Premium tools enabled' : `${products.length}/${FREE_PRODUCT_LIMIT} product limit`,
      icon: <Crown className="w-5 h-5" />,
      color: isPremium ? 'text-amber-600 bg-amber-50' : 'text-surface-600 bg-surface-100',
    },
  ];

  const actionSteps = [
    {
      title: products.length === 0 ? 'Add your first product' : 'Keep catalog fresh',
      detail: products.length === 0 ? 'Create a product so your public shop has something to sell.' : 'Add prices, images, and descriptions for better customer trust.',
      done: products.length > 0,
      to: '/products',
      label: products.length === 0 ? 'Add product' : 'Manage products',
    },
    {
      title: 'Complete WhatsApp contact',
      detail: shop?.whatsapp ? 'Customers can contact you from the shop page.' : 'Add a WhatsApp number so customers can message you.',
      done: Boolean(shop?.whatsapp),
      to: '/settings',
      label: 'Edit settings',
    },
    {
      title: 'Preview customer view',
      detail: 'Open the live shop and check logo, banner, products, and contact button.',
      done: isLive && products.length > 0,
      to: `/shop/${shop?.slug || 'myshop'}`,
      label: 'Preview',
      external: true,
    },
  ];

  const recentProducts = products.slice(0, 3);

  if (shopLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src={shop?.logo} alt={shop?.name} className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl object-cover bg-primary-100 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-bold text-surface-900 truncate">{shop?.name || 'My Shop'}</h1>
            <p className="text-sm text-surface-500">Real shop activity and setup</p>
          </div>
        </div>
        <Link to="/settings" className="p-2.5 rounded-xl hover:bg-surface-100 transition-colors text-surface-500" aria-label="Open settings">
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-surface-900">Your Shop Link</h3>
          <div className="flex items-center gap-2">
            {isPremium && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><Crown className="w-3 h-3" /> Premium</span>}
            <span className={isLive ? 'badge-live' : 'inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-full'}>{isLive ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 lg:p-4 bg-surface-50 rounded-xl border border-surface-200">
          <div className="flex-1 min-w-0"><p className="text-sm lg:text-base font-medium text-surface-700 truncate">{shopUrl}</p></div>
          <CopyButton text={shopUrl} />
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <Link to={`/shop/${shop?.slug || 'myshop'}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Preview Shop
          </Link>
          {shop?.whatsapp && (
            <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> Test WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-2 mb-3"><div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div></div>
            <p className="text-xs lg:text-sm text-surface-500 font-medium">{stat.label}</p>
            <p className="text-xl lg:text-2xl font-bold text-surface-900 mt-0.5 capitalize">{stat.value}</p>
            {stat.sub && <p className="text-xs mt-1 font-medium text-surface-500">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-surface-900 text-lg mb-4">Next Actions</h3>
        <div className="space-y-3">
          {actionSteps.map(step => (
            <div key={step.title} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.done ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600'}`}>
                {step.done ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900">{step.title}</p>
                <p className="text-xs text-surface-500 mt-0.5">{step.detail}</p>
              </div>
              <Link to={step.to} target={step.external ? '_blank' : undefined} className="text-xs text-primary-600 font-semibold shrink-0 mt-1">{step.label}</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 text-lg">Recent Products</h3>
          <Link to="/products" className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        {recentProducts.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No products yet. Add your first real product to publish your catalog.</p>
        ) : (
          <div className="space-y-3">
            {recentProducts.map(product => (
              <div key={product.id} className="flex items-center gap-3 p-2 lg:p-3 rounded-xl hover:bg-surface-50 transition-colors">
                <img src={product.image} alt={product.name} className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl object-cover bg-surface-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm lg:text-base font-semibold text-surface-900 truncate">{product.name}</p>
                  <p className="text-sm text-primary-600 font-medium">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
