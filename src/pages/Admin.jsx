import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/UI';
import { Search, Store, Crown, Shield, AlertTriangle, Ban, Check, Package, ChevronRight, Eye, Loader2 } from '../components/Icons';
import { isAdmin } from '../lib/auth';

export default function Admin() {
  const { adminShops, refreshAdminShops, updateAdminShopStatus } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setLoading(false);
        return;
      }
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
      if (adminStatus) {
        await refreshAdminShops();
      }
      setLoading(false);
    }
    checkAdmin();
  }, [user, refreshAdminShops]);

  const filtered = adminShops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase()) ||
      shop.owner.toLowerCase().includes(search.toLowerCase()) ||
      shop.slug.toLowerCase().includes(search.toLowerCase()) ||
      shop.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
    const matchesPlan = planFilter === 'all' || shop.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalShops = adminShops.length;
  const totalPremium = adminShops.filter(s => s.plan === 'premium').length;
  const totalFree = adminShops.filter(s => s.plan === 'free').length;
  const totalProducts = adminShops.reduce((sum, s) => sum + s.productCount, 0);
  const flaggedCount = adminShops.filter(s => s.status === 'flagged').length;
  const suspendedCount = adminShops.filter(s => s.status === 'suspended').length;
  const activeCount = adminShops.filter(s => s.status === 'active').length;
  
  // Calculate additional statistics
  const totalCities = [...new Set(adminShops.map(s => s.city).filter(Boolean))].length;
  const avgProductsPerShop = totalShops > 0 ? Math.round(totalProducts / totalShops) : 0;
  const recentShops = adminShops.filter(s => {
    const createdAt = new Date(s.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
  }).length;

  const handleAction = async () => {
    if (!actionModal) return;
    const { shop, action } = actionModal;
    if (action === 'flag') await updateAdminShopStatus(shop.id, 'flagged');
    else if (action === 'suspend') await updateAdminShopStatus(shop.id, 'suspended');
    else if (action === 'activate') await updateAdminShopStatus(shop.id, 'active');
    setActionModal(null);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full"><Check className="w-3 h-3" /> Active</span>;
      case 'flagged': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><AlertTriangle className="w-3 h-3" /> Flagged</span>;
      case 'suspended': return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full"><Ban className="w-3 h-3" /> Suspended</span>;
    }
  };

  const planBadge = (plan) => {
    if (plan === 'premium') return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><Crown className="w-3 h-3" /> Premium</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 text-surface-600 text-xs font-semibold rounded-full">Free</span>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  if (!isAdminUser) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20 text-center">
        <Shield className="w-12 h-12 text-surface-300 mb-4" />
        <h2 className="text-xl font-bold text-surface-900 mb-2">Access Denied</h2>
        <p className="text-surface-500">You don't have permission to access the admin panel</p>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-surface-900">Platform Admin</h1>
          <p className="text-sm text-surface-500">Manage all shops, plans, and abuse reports</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-surface-500 font-medium">Total Shops</p>
          <p className="text-2xl font-bold text-surface-900">{totalShops}</p>
          <p className="text-xs text-surface-400 mt-0.5">{recentShops} new (30d)</p>
        </div>
        <div className="card card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-surface-500 font-medium">Premium Shops</p>
          <p className="text-2xl font-bold text-surface-900">{totalPremium}</p>
          <p className="text-xs text-surface-400 mt-0.5">{totalFree} free</p>
        </div>
        <div className="card card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-surface-500 font-medium">Total Products</p>
          <p className="text-2xl font-bold text-surface-900">{totalProducts}</p>
          <p className="text-xs text-surface-400 mt-0.5">Avg: {avgProductsPerShop}/shop</p>
        </div>
        <div className="card card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-surface-500 font-medium">Issues</p>
          <p className="text-2xl font-bold text-surface-900">{flaggedCount + suspendedCount}</p>
          <p className="text-xs text-surface-400 mt-0.5">{flaggedCount} flagged, {suspendedCount} suspended</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-surface-900 mb-3">Plan Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: totalShops > 0 ? `${(totalPremium / totalShops) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-surface-600 font-medium">Premium {totalPremium}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-surface-200" />
                <span className="text-surface-600 font-medium">Free {totalFree}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-surface-900 mb-3">Status Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-surface-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                  style={{ width: totalShops > 0 ? `${(activeCount / totalShops) * 100}%` : '0%' }}
                  title={`Active: ${activeCount}`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: totalShops > 0 ? `${(flaggedCount / totalShops) * 100}%` : '0%' }}
                  title={`Flagged: ${flaggedCount}`}
                />
                <div
                  className="h-full bg-red-500 rounded-r-full transition-all duration-500"
                  style={{ width: totalShops > 0 ? `${(suspendedCount / totalShops) * 100}%` : '0%' }}
                  title={`Suspended: ${suspendedCount}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-surface-600 font-medium">Active {activeCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-surface-600 font-medium">Flagged {flaggedCount}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-surface-600 font-medium">Suspended {suspendedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
              <span className="text-surface-600 font-medium">Cities {totalCities}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shops, owners, cities..." className="input-field pl-10" />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-white border-2 border-surface-200 rounded-xl text-sm font-medium text-surface-700 outline-none focus:border-primary-500 transition-colors">
              <option value="all">All Status</option><option value="active">Active</option><option value="flagged">Flagged</option><option value="suspended">Suspended</option>
            </select>
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="px-3 py-2.5 bg-white border-2 border-surface-200 rounded-xl text-sm font-medium text-surface-700 outline-none focus:border-primary-500 transition-colors">
              <option value="all">All Plans</option><option value="free">Free</option><option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Shop</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Products</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Created</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(shop => (
                <tr key={shop.id} className="border-b border-surface-50 hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">{shop.name[0]}</div><div className="min-w-0"><p className="text-sm font-semibold text-surface-900 truncate">{shop.name}</p><p className="text-xs text-surface-400 truncate">dukanlink.in/{shop.slug}</p></div></div></td>
                  <td className="px-5 py-3.5"><p className="text-sm text-surface-700 font-medium">{shop.owner}</p><p className="text-xs text-surface-400">{shop.ownerPhone}</p></td>
                  <td className="px-5 py-3.5">{planBadge(shop.plan)}</td>
                  <td className="px-5 py-3.5"><span className="text-sm font-semibold text-surface-700">{shop.productCount}</span></td>
                  <td className="px-5 py-3.5">{statusBadge(shop.status)}</td>
                  <td className="px-5 py-3.5"><span className="text-sm text-surface-500">{new Date(shop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedShop(shop)} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600" title="View details"><Eye className="w-4 h-4" /></button>
                      {shop.status === 'active' && <button onClick={() => setActionModal({ shop, action: 'flag' })} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors text-surface-400 hover:text-amber-600" title="Flag shop"><AlertTriangle className="w-4 h-4" /></button>}
                      {(shop.status === 'active' || shop.status === 'flagged') && <button onClick={() => setActionModal({ shop, action: 'suspend' })} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-surface-400 hover:text-red-500" title="Suspend shop"><Ban className="w-4 h-4" /></button>}
                      {shop.status !== 'active' && <button onClick={() => setActionModal({ shop, action: 'activate' })} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors text-surface-400 hover:text-emerald-600" title="Reactivate shop"><Check className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-surface-100">
          {filtered.map(shop => (
            <div key={shop.id} className="p-4 hover:bg-surface-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">{shop.name[0]}</div>
                  <div className="min-w-0"><p className="text-sm font-semibold text-surface-900 truncate">{shop.name}</p><p className="text-xs text-surface-400 truncate">dukanlink.in/{shop.slug}</p></div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">{planBadge(shop.plan)}{statusBadge(shop.status)}</div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-surface-500"><span className="font-medium text-surface-700">{shop.owner}</span> \u00B7 {shop.city} \u00B7 {shop.productCount} products</div>
                <button onClick={() => setSelectedShop(shop)} className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">Details <ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="py-12 text-center"><p className="text-surface-400 font-medium">No shops match your filters</p></div>}
      </div>

      <Modal open={!!selectedShop} onClose={() => setSelectedShop(null)} title="Shop Details">
        {selectedShop && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold shrink-0">{selectedShop.name[0]}</div>
              <div className="min-w-0"><h3 className="text-lg font-bold text-surface-900">{selectedShop.name}</h3><p className="text-sm text-surface-500">dukanlink.in/{selectedShop.slug}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Owner</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.owner}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Phone</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.ownerPhone}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">City</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.city}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Created</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{new Date(selectedShop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Plan</p><div className="mt-1">{planBadge(selectedShop.plan)}</div></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Products</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.productCount}</p></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Status</p>{statusBadge(selectedShop.status)}</div>
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs text-surface-500 font-semibold uppercase tracking-wide">Admin Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedShop.status === 'active' && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'flag' }); setSelectedShop(null); }} className="px-3 py-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Flag Shop</button>}
                {(selectedShop.status === 'active' || selectedShop.status === 'flagged') && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'suspend' }); setSelectedShop(null); }} className="px-3 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> Suspend Shop</button>}
                {selectedShop.status !== 'active' && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'activate' }); setSelectedShop(null); }} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Reactivate</button>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal?.action === 'flag' ? 'Flag Shop' : actionModal?.action === 'suspend' ? 'Suspend Shop' : 'Reactivate Shop'}>
        {actionModal && (
          <div className="space-y-4">
            <p className="text-surface-600">
              {actionModal.action === 'flag' && `Are you sure you want to flag "${actionModal.shop.name}"? This marks the shop for review.`}
              {actionModal.action === 'suspend' && `Are you sure you want to suspend "${actionModal.shop.name}"? The shop will be taken offline.`}
              {actionModal.action === 'activate' && `Are you sure you want to reactivate "${actionModal.shop.name}"? The shop will be back online.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAction} className={`flex-1 py-2.5 font-semibold rounded-xl transition-colors active:scale-[0.98] ${actionModal.action === 'flag' ? 'bg-amber-500 text-white hover:bg-amber-600' : actionModal.action === 'suspend' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                {actionModal.action === 'flag' ? 'Flag Shop' : actionModal.action === 'suspend' ? 'Suspend Shop' : 'Reactivate'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
