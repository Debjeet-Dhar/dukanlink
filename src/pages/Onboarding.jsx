import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Store, ArrowRight, Loader2, AlertCircle } from '../components/Icons';

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
}

export default function Onboarding() {
  const { user } = useAuth();
  const { refreshShop } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');

  const slug = generateSlug(name);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Shop name is required';
    if (!city.trim()) e.city = 'City is required';
    if (!whatsapp.trim()) e.whatsapp = 'WhatsApp number is required';
    else if (!/^\+?\d{10,15}$/.test(whatsapp.replace(/\s/g, ''))) e.whatsapp = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    if (!supabase) {
      setSlugError('Supabase is not configured. Add .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.');
      return;
    }
    setSlugError('');
    setLoading(true);

    let finalSlug = slug || generateSlug(name);
    let suffix = 0;
    let slugAvailable = false;

    while (!slugAvailable && suffix < 100) {
      const candidate = suffix === 0 ? finalSlug : `${generateSlug(name)}${suffix}`;
      const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle();
      if (!data) {
        finalSlug = candidate;
        slugAvailable = true;
      } else {
        suffix++;
      }
    }

    if (!slugAvailable) {
      setSlugError('Could not generate a unique slug. Try a different shop name.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('shops').insert({
      owner_id: user.id,
      name: name.trim(),
      slug: finalSlug,
      city: city.trim(),
      whatsapp: whatsapp.trim(),
      description: description.trim(),
      plan: 'free',
      status: 'active',
    });

    if (error) {
      if (error.code === '23505') {
        setSlugError('This slug is already taken. Try a different shop name.');
      } else {
        setSlugError(error.message);
      }
      setLoading(false);
      return;
    }

    await refreshShop();
    setLoading(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] page-enter">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">DukanLink</h1>
          <p className="text-surface-500 mt-1">Create your shop in seconds</p>
        </div>

        <div className="card">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Shop Name</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setErrors({}); }}
                placeholder="My Awesome Shop"
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none ${errors.name ? 'border-red-400' : 'border-surface-200 focus:border-primary-500'}`}
              />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            {name.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-50 rounded-lg border border-surface-200">
                <span className="text-surface-400 text-sm">dukanlink.in/</span>
                <span className="text-primary-600 text-sm font-semibold">{slug}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">City</label>
              <input
                type="text"
                value={city}
                onChange={e => { setCity(e.target.value); setErrors({}); }}
                placeholder="Mumbai"
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none ${errors.city ? 'border-red-400' : 'border-surface-200 focus:border-primary-500'}`}
              />
              {errors.city && <p className="text-xs text-red-500 font-medium">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => { setWhatsapp(e.target.value); setErrors({}); }}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-base transition-all duration-200 outline-none ${errors.whatsapp ? 'border-red-400' : 'border-surface-200 focus:border-primary-500'}`}
              />
              {errors.whatsapp && <p className="text-xs text-red-500 font-medium">{errors.whatsapp}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-900">Description (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell customers about your shop..."
                className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-xl text-base transition-all duration-200 outline-none focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          {slugError && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 font-medium">{slugError}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary mt-6 flex items-center justify-center gap-2 w-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Create My Shop <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-xs text-surface-400 mt-4 font-medium">
            Your shop will be live instantly
          </p>
        </div>
      </div>
    </div>
  );
}
