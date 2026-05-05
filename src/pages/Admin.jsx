import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/UI';
import { Search, Store, Crown, Shield, AlertTriangle, Ban, Check, Package, ChevronRight, Eye, Loader2, ExternalLink, Mail, MessageCircle } from '../components/Icons';
import { isAdmin } from '../lib/auth';

export default function Admin() {
  const { adminShops, actionError, refreshAdminShops, updateAdminShopStatus, updateAdminShopPlan, clearActionError } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
  const emptyCatalogCount = adminShops.filter(s => s.productCount === 0).length;
  const needsAttention = adminShops
    .filter(s => s.status !== 'active' || s.productCount === 0 || !s.ownerPhone)
    .slice(0, 4);

  const handleAction = async () => {
    if (!actionModal) return;
    const { shop, action } = actionModal;
    setActionLoading(true);
    let ok = false;
    if (action === 'flag') ok = await updateAdminShopStatus(shop.id, 'flagged');
    else if (action === 'suspend') ok = await updateAdminShopStatus(shop.id, 'suspended');
    else if (action === 'activate') ok = await updateAdminShopStatus(shop.id, 'active');
    else if (action === 'premium') ok = await updateAdminShopPlan(shop.id, 'premium');
    else if (action === 'free') ok = await updateAdminShopPlan(shop.id, 'free');
    setActionLoading(false);
    if (ok !== false) setActionModal(null);
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

  const actionTitle = (action) => {
    switch (action) {
      case 'flag': return 'Flag Shop';
      case 'suspend': return 'Suspend Shop';
      case 'activate': return 'Reactivate Shop';
      case 'premium': return 'Move to Premium';
      case 'free': return 'Move to Free';
      default: return 'Confirm Action';
    }
  };

  const actionCopy = (modal) => {
    if (!modal) return '';
    const { shop, action } = modal;
    if (action === 'flag') return `Flag "${shop.name}" for review. Customers can still view it while admins investigate.`;
    if (action === 'suspend') return `Suspend "${shop.name}" and take the public shop offline.`;
    if (action === 'activate') return `Reactivate "${shop.name}" and make it visible again.`;
    if (action === 'premium') return `Enable Premium for "${shop.name}" immediately. This is an admin override, not a payment flow.`;
    if (action === 'free') return `Move "${shop.name}" back to the Free plan.`;
    return '';
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
        <div className="card card-hover"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><Store className="w-4 h-4 text-primary-600" /></div></div><p className="text-xs text-surface-500 font-medium">Total Shops</p><p className="text-2xl font-bold text-surface-900">{totalShops}</p></div>
        <div className="card card-hover"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Crown className="w-4 h-4 text-amber-600" /></div></div><p className="text-xs text-surface-500 font-medium">Premium Shops</p><p className="text-2xl font-bold text-surface-900">{totalPremium}</p><p className="text-xs text-surface-400 mt-0.5">{totalFree} free</p></div>
        <div className="card card-hover"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Package className="w-4 h-4 text-emerald-600" /></div></div><p className="text-xs text-surface-500 font-medium">Total Products</p><p className="text-2xl font-bold text-surface-900">{totalProducts}</p></div>
        <div className="card card-hover"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-500" /></div></div><p className="text-xs text-surface-500 font-medium">Needs Action</p><p className="text-2xl font-bold text-surface-900">{flaggedCount + suspendedCount + emptyCatalogCount}</p><p className="text-xs text-surface-400 mt-0.5">{emptyCatalogCount} empty, {flaggedCount} flagged</p></div>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium flex-1">{actionError}</p>
          <button onClick={clearActionError} className="text-xs font-semibold text-red-700">Dismiss</button>
        </div>
      )}

      {needsAttention.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-surface-900">Action Queue</h3>
            <span className="text-xs text-surface-400 font-semibold">{needsAttention.length} priority shops</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {needsAttention.map(shop => (
              <div key={shop.id} className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate">{shop.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {shop.status !== 'active' ? `Status: ${shop.status}` : shop.productCount === 0 ? 'No products added' : 'Missing WhatsApp contact'}
                    </p>
                  </div>
                  {statusBadge(shop.status)}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {shop.status !== 'active' && <button onClick={() => setActionModal({ shop, action: 'activate' })} className="px-2.5 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg">Activate</button>}
                  <button onClick={() => setSelectedShop(shop)} className="px-2.5 py-1.5 bg-white border border-surface-200 text-surface-700 text-xs font-semibold rounded-lg">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-surface-900 mb-3">Plan Distribution</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1"><div className="h-3 bg-surface-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: totalShops > 0 ? `${(totalPremium / totalShops) * 100}%` : '0%' }} /></div></div>
          <div className="flex items-center gap-4 text-sm shrink-0">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-surface-600 font-medium">Premium {totalPremium}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-surface-200" /><span className="text-surface-600 font-medium">Free {totalFree}</span></div>
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
                  <td className="px-5 py-3.5"><p className="text-sm text-surface-700 font-medium">{shop.owner}</p><p className="text-xs text-surface-400">{shop.ownerEmail || shop.ownerPhone || 'No contact'}</p></td>
                  <td className="px-5 py-3.5">{planBadge(shop.plan)}</td>
                  <td className="px-5 py-3.5"><span className="text-sm font-semibold text-surface-700">{shop.productCount}</span></td>
                  <td className="px-5 py-3.5">{statusBadge(shop.status)}</td>
                  <td className="px-5 py-3.5"><span className="text-sm text-surface-500">{new Date(shop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedShop(shop)} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600" title="View details"><Eye className="w-4 h-4" /></button>
                      <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600" title="Open public shop"><ExternalLink className="w-4 h-4" /></a>
                      {shop.plan !== 'premium' && <button onClick={() => setActionModal({ shop, action: 'premium' })} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors text-surface-400 hover:text-amber-600" title="Move to premium"><Crown className="w-4 h-4" /></button>}
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
                <div className="text-xs text-surface-500"><span className="font-medium text-surface-700">{shop.owner}</span> &middot; {shop.city || 'No city'} &middot; {shop.productCount} products</div>
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
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Email</p><p className="text-sm font-semibold text-surface-900 mt-0.5 break-all">{selectedShop.ownerEmail || 'Not captured yet'}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">WhatsApp</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.ownerPhone || 'Not added'}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">City</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.city}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Created</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{new Date(selectedShop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Plan</p><div className="mt-1">{planBadge(selectedShop.plan)}</div></div>
              <div className="p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Products</p><p className="text-sm font-semibold text-surface-900 mt-0.5">{selectedShop.productCount}</p></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl"><p className="text-xs text-surface-500 font-medium">Status</p>{statusBadge(selectedShop.status)}</div>
            <div className="flex flex-wrap gap-2">
              <a href={`/shop/${selectedShop.slug}`} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border border-surface-200 text-surface-700 text-sm font-semibold rounded-lg hover:bg-surface-50 transition-colors flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Open Shop</a>
              {selectedShop.ownerEmail && <a href={`mailto:${selectedShop.ownerEmail}`} className="px-3 py-2 bg-white border border-surface-200 text-surface-700 text-sm font-semibold rounded-lg hover:bg-surface-50 transition-colors flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Owner</a>}
              {selectedShop.ownerPhone && <a href={`https://wa.me/${selectedShop.ownerPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border border-surface-200 text-surface-700 text-sm font-semibold rounded-lg hover:bg-surface-50 transition-colors flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>}
            </div>
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs text-surface-500 font-semibold uppercase tracking-wide">Admin Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedShop.plan !== 'premium' && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'premium' }); setSelectedShop(null); }} className="px-3 py-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" /> Make Premium</button>}
                {selectedShop.plan === 'premium' && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'free' }); setSelectedShop(null); }} className="px-3 py-2 bg-surface-100 text-surface-700 text-sm font-semibold rounded-lg hover:bg-surface-200 transition-colors flex items-center gap-1.5">Move to Free</button>}
                {selectedShop.status === 'active' && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'flag' }); setSelectedShop(null); }} className="px-3 py-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Flag Shop</button>}
                {(selectedShop.status === 'active' || selectedShop.status === 'flagged') && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'suspend' }); setSelectedShop(null); }} className="px-3 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> Suspend Shop</button>}
                {selectedShop.status !== 'active' && <button onClick={() => { setActionModal({ shop: selectedShop, action: 'activate' }); setSelectedShop(null); }} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Reactivate</button>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionTitle(actionModal?.action)}>
        {actionModal && (
          <div className="space-y-4">
            <p className="text-surface-600">{actionCopy(actionModal)}</p>
            {actionError && <p className="text-sm text-red-600 font-medium">{actionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} disabled={actionLoading} className="btn-secondary flex-1">Cancel</button>
              <button disabled={actionLoading} onClick={handleAction} className={`flex-1 py-2.5 font-semibold rounded-xl transition-colors active:scale-[0.98] disabled:opacity-60 ${actionModal.action === 'flag' || actionModal.action === 'premium' ? 'bg-amber-500 text-white hover:bg-amber-600' : actionModal.action === 'suspend' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : actionTitle(actionModal.action)}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
