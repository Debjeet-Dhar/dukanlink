import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CopyButton } from '../components/UI';
import { Settings, ExternalLink, TrendingUp, ShoppingBag, Package, ChevronRight, Crown, Loader2 } from '../components/Icons';

export default function Dashboard() {
  const { shop, products, shopLoading, FREE_PRODUCT_LIMIT } = useApp();
  const shopUrl = `dukanlink.in/${shop?.slug || 'myshop'}`;
  const isPremium = shop?.plan === 'premium';

  const stats = [
    { label: 'Total Sales', value: '₹4,500.00', icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary-600 bg-primary-50' },
    { label: 'Orders', value: '9', sub: '+12 this week', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-accent-500 bg-accent-50' },
    { label: 'Total Products', value: String(products.length), sub: isPremium ? 'Unlimited' : `${products.length}/${FREE_PRODUCT_LIMIT}`, icon: <Package className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Conversion', value: '12%', sub: 'vs last week', icon: <TrendingUp className="w-5 h-5" />, color: 'text-teal-600 bg-teal-50' },
  ];

  const recentProducts = products.slice(0, 3);

  if (shopLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={shop?.logo} alt={shop?.name} className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl object-cover bg-primary-100" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-surface-900">My Shop Dashboard</h1>
            <p className="text-sm text-surface-500">{shop?.name || 'Shop Owner'}</p>
          </div>
        </div>
        <button className="p-2.5 rounded-xl hover:bg-surface-100 transition-colors text-surface-500"><Settings className="w-5 h-5" /></button>
      </div>

      <div className="card mt-4 lg:mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-surface-900">Your Shop Link</h3>
          <div className="flex items-center gap-2">
            {isPremium && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><Crown className="w-3 h-3" /> Premium</span>}
            <span className="badge-live">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 lg:p-4 bg-surface-50 rounded-xl border border-surface-200">
          <div className="flex-1 min-w-0"><p className="text-sm lg:text-base font-medium text-surface-700 truncate">{shopUrl}</p></div>
          <CopyButton text={shopUrl} />
        </div>
        <Link to={`/shop/${shop?.slug || 'myshop'}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium mt-3 hover:text-primary-700 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Preview Shop
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card card-hover cursor-pointer">
            <div className="flex items-center gap-2 mb-3"><div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div></div>
            <p className="text-xs lg:text-sm text-surface-500 font-medium">{stat.label}</p>
            <p className="text-xl lg:text-2xl font-bold text-surface-900 mt-0.5">{stat.value}</p>
            {stat.sub && <p className="text-xs mt-1 font-medium text-primary-600">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 text-lg">Recent Products</h3>
          <Link to="/products" className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        {recentProducts.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No products yet — add your first item</p>
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
