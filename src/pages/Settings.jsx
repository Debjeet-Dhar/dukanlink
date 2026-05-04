import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/UI';
import { Store, Phone, Loader2, LogOut, ImageIcon, Upload, ShieldCheck, Crown, Check, AlertCircle } from '../components/Icons';
import { uploadImage } from '../lib/storage';

export default function Settings({ onLogout }) {
  const { shop, products, updateShop, upgradePlan, isSlugAvailable } = useApp();
  const [name, setName] = useState(shop?.name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [whatsapp, setWhatsapp] = useState(shop?.whatsapp || '');
  const [slug, setSlug] = useState(shop?.slug || '');
  const [bannerPreview, setBannerPreview] = useState(shop?.banner || '');
  const [logoPreview, setLogoPreview] = useState(shop?.logo || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [slugError, setSlugError] = useState('');
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const bannerRef = useRef(null);
  const logoRef = useRef(null);

  const isPremium = shop?.plan === 'premium';

  const handleImageUpload = (file, setter, fileSetter) => {
    const url = URL.createObjectURL(file);
    setter(url);
    fileSetter(file);
    setImageError('');
  };

  const checkSlug = async (newSlug) => {
    if (newSlug === shop?.slug) { setSlugAvailable(null); setSlugError(''); return; }
    if (newSlug.length < 3) { setSlugAvailable(false); return; }
    const available = await isSlugAvailable(newSlug);
    setSlugAvailable(available);
    if (!available) setSlugError('This slug is already taken');
    else setSlugError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!shop) return;
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Shop name is required';
    if (whatsapp.trim() && !/^\+?\d{10,15}$/.test(whatsapp.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (slug !== shop.slug) {
      if (!isPremium) { setSlugError('Upgrade to Premium to change your slug'); return; }
      const available = await isSlugAvailable(slug);
      if (!available) { setSlugError('This slug is already taken'); return; }
    }
    setErrors(newErrors);
    setSlugError('');
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setImageError('');
    let savedBanner = bannerPreview;
    let savedLogo = logoPreview;

    try {
      if (bannerFile) savedBanner = await uploadImage(bannerFile, shop.id);
      if (logoFile) savedLogo = await uploadImage(logoFile, shop.id);
    } catch (error) {
      setImageError(error.message || 'Failed to upload image');
      setSaving(false);
      return;
    }

    await updateShop({
      name: name.trim(), description: description.trim(), whatsapp: whatsapp.trim(),
      slug, banner: savedBanner, logo: savedLogo,
    });
    setBannerPreview(savedBanner);
    setLogoPreview(savedLogo);
    setBannerFile(null);
    setLogoFile(null);
    setSaving(false);
  };

  const handleConfirmLogout = () => { setShowLogoutModal(false); onLogout(); };

  const handleUpgrade = async () => {
    await upgradePlan();
    setUpgradeMessage('Payments are not connected yet. Keep this disabled until Stripe or manual billing is ready.');
  };

  if (!shop) return null;

  return (
    <>
      <div className="page-enter max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your shop information and preferences</p>
        </div>

        <div className={`card mb-4 ${isPremium ? 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/60' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-amber-500' : 'bg-surface-100'}`}>
                <Crown className={`w-5 h-5 ${isPremium ? 'text-white' : 'text-surface-400'}`} />
              </div>
              <div>
                <p className="font-semibold text-surface-900">{isPremium ? 'Premium Plan' : 'Free Plan'}</p>
                <p className="text-xs text-surface-500 mt-0.5">
                  {isPremium ? 'Unlimited products, custom slug, premium branding' : `${products.length} of 15 products used \u00B7 Auto-generated slug`}
                </p>
              </div>
            </div>
            {!isPremium && (
              <button onClick={() => setShowUpgradeModal(true)} className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-all active:scale-95 shadow-soft">Upgrade</button>
            )}
          </div>
        </div>

        <div className="card space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Shop cover image</label>
              <button type="button" onClick={() => bannerRef.current?.click()} className="w-full aspect-[16/7] rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50/40 overflow-hidden flex items-center justify-center hover:bg-surface-50 hover:border-surface-300 transition-all relative group">
                {bannerPreview ? (
                  <><img src={bannerPreview} alt="Shop cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-sm font-semibold">Change cover</span></div></>
                ) : (
                  <div className="flex flex-col items-center text-surface-500 p-4 text-center"><ImageIcon className="w-8 h-8 mb-2 opacity-60" /><span className="text-sm font-medium">Upload a cover image</span></div>
                )}
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, setBannerPreview, setBannerFile); }} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button type="button" onClick={() => logoRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-primary-300 bg-primary-50 overflow-hidden flex items-center justify-center shrink-0 hover:bg-primary-100 transition-colors">
                {logoPreview ? <img src={logoPreview} alt="Shop logo" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-primary-600" />}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, setLogoPreview, setLogoFile); }} />
              </button>
              <div className="flex-1"><label className="text-sm font-semibold text-surface-900">Shop logo</label><p className="text-xs text-surface-500 mt-0.5">Tap to upload a new one</p></div>
            </div>

            <div className="space-y-2">
              <label htmlFor="shop-name" className="text-sm font-semibold text-surface-900">Shop name</label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input id="shop-name" type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }} placeholder="My Awesome Shop" className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none ${errors.name ? 'border-red-400' : 'border-surface-200 focus:border-primary-500'}`} />
              </div>
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="shop-slug" className="text-sm font-semibold text-surface-900">Shop URL slug</label>
                {!isPremium && <span className="text-xs text-surface-400 font-medium">Free plan: auto-generated</span>}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-medium">dukanlink.in/</span>
                <input id="shop-slug" type="text" value={slug} onChange={(e) => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''); setSlug(val); setSlugError(''); setSlugAvailable(null); if (isPremium && val !== shop.slug) checkSlug(val); }} disabled={!isPremium} className={`w-full pl-[105px] pr-4 py-3 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none ${slugError ? 'border-red-400' : 'border-surface-200 focus:border-primary-500'} ${!isPremium ? 'bg-surface-50 text-surface-400 cursor-not-allowed' : ''}`} />
                {!isPremium && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <button type="button" onClick={() => setShowUpgradeModal(true)} className="text-xs text-amber-600 font-semibold hover:underline">Unlock</button>
                  </div>
                )}
              </div>
              {slugError && <div className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /><p className="text-xs text-red-500 font-medium">{slugError}</p></div>}
              {slugAvailable === true && !slugError && <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-600 shrink-0" /><p className="text-xs text-primary-600 font-medium">Slug is available</p></div>}
            </div>

            <div className="space-y-2">
              <label htmlFor="shop-desc" className="text-sm font-semibold text-surface-900">Description</label>
              <textarea id="shop-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell customers about your shop..." className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-xl text-base transition-all duration-200 outline-none focus:border-primary-500 resize-none" />
            </div>

            <div className="space-y-2">
              <label htmlFor="shop-phone" className="text-sm font-semibold text-surface-900">WhatsApp number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input id="shop-phone" type="tel" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); setErrors({}); }} placeholder="+91 98765 43210" className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none ${errors.phone ? 'border-red-400' : 'border-surface-200 focus:border-primary-500'}`} />
              </div>
              {errors.phone ? <p className="text-xs text-red-500 font-medium">{errors.phone}</p> : <p className="text-xs text-surface-500">This is also used to log in to your account</p>}
            </div>

            <button type="submit" disabled={saving} className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save changes'}
            </button>
            {imageError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 font-medium">{imageError}</p>
              </div>
            )}
          </form>

          <div className="border-t pt-6">
            <div className="flex items-center gap-3 p-4 bg-primary-50/40 rounded-xl border border-primary-100/60">
              <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">Account secured</p>
                <p className="text-xs text-surface-500 mt-0.5">Your shop is verified via email. Sign in anytime using your registered email.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => setShowLogoutModal(true)} className="w-full py-3 px-4 bg-white border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </div>

      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout">
        <p className="text-surface-600 mb-5">Are you sure you want to logout? You'll need to login again to access your dashboard.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowLogoutModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleConfirmLogout} className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors active:scale-[0.98]">Logout</button>
        </div>
      </Modal>

      <Modal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Upgrade to Premium">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200/60">
            <Crown className="w-6 h-6 text-amber-600 shrink-0" />
            <div><p className="font-semibold text-surface-900">Premium Plan</p><p className="text-xs text-surface-500 mt-0.5">Unlock the full potential of your shop</p></div>
          </div>
          <div className="space-y-3">
            {['Unlimited products (vs 15 on Free)', 'Custom URL slug for your shop', 'Better branding and premium features', 'Priority support'].map(feature => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-primary-600" /></div>
                <span className="text-sm text-surface-700">{feature}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-3">
            {upgradeMessage && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-700 font-medium">{upgradeMessage}</p>
              </div>
            )}
            <button onClick={handleUpgrade} className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all active:scale-[0.98] shadow-soft flex items-center justify-center gap-2"><Crown className="w-4 h-4" /> Billing Coming Soon</button>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2.5 text-surface-500 font-medium text-sm hover:text-surface-700 transition-colors">Maybe later</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
