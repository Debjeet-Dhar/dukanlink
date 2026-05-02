import { Home, Package, Settings, Shield } from '../components/Icons';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function Sidebar({ active, onNavigate, shopName, plan, isAdmin }) {
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white border-r border-surface-200 h-screen sticky top-0">
      <div className="p-5 lg:p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center shadow-soft">
          <span className="text-white font-extrabold text-sm">D</span>
        </div>
        <span className="font-bold text-surface-900 text-lg">DukanLink</span>
      </div>

      <nav className="flex-1 px-3 lg:px-4 py-2 space-y-1">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 lg:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
              {item.label}
              {item.adminOnly && (
                <span className="ml-auto text-[10px] font-bold text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">ADMIN</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 lg:p-5 border-t border-surface-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
            {shopName ? shopName[0].toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">{shopName || 'Shop Owner'}</p>
            <p className="text-xs text-surface-400 truncate">{plan === 'premium' ? 'Premium Plan' : 'Free Plan'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav({ active, onNavigate, isAdmin }) {
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 rounded-t-2xl shadow-elevated">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary-600' : 'text-surface-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-600' : 'text-surface-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
