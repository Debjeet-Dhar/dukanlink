import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Store, Package, MessageCircle, Smartphone, Zap, BarChart3, Globe, Shield, ChevronRight, Star, Eye, Menu, X } from '../components/Icons';

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, className = '', delay = 0 }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const demoProducts = [
  { name: 'Chocolate Truffle Cake', price: 550, image: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Fresh Croissants', price: 120, image: 'https://images.pexels.com/photos/1070880/pexels-photo-1070880.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Red Velvet Cupcake', price: 90, image: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Artisan Bread Loaf', price: 180, image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const socialProofCards = [
  { name: 'Bakery Shop', tagline: 'Fresh cakes & pastries daily', image: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=600', banner: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Clothing Store', tagline: 'Trendy fashion at best prices', image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600', banner: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Street Food Stall', tagline: 'Authentic local flavors', image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600', banner: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const steps = [
  { icon: <Store className="w-6 h-6" />, title: 'Create your shop', desc: 'Enter your shop name and go live in seconds. No coding, no setup fees.' },
  { icon: <Package className="w-6 h-6" />, title: 'Add your products', desc: 'Upload photos, set prices, and organize your catalog effortlessly.' },
  { icon: <MessageCircle className="w-6 h-6" />, title: 'Get orders on WhatsApp', desc: 'Customers browse your shop and order directly to your WhatsApp.' },
];

const features = [
  { icon: <Zap className="w-6 h-6" />, title: 'No coding required', desc: 'If you can use WhatsApp, you can run your online shop.' },
  { icon: <MessageCircle className="w-6 h-6" />, title: 'WhatsApp ordering', desc: 'Orders land straight on your WhatsApp — no extra app needed.' },
  { icon: <Smartphone className="w-6 h-6" />, title: 'Mobile optimized', desc: 'Your shop looks perfect on every phone and screen size.' },
  { icon: <Zap className="w-6 h-6" />, title: 'Fast setup', desc: 'Go from zero to live shop in under 60 seconds.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Free to start', desc: 'No credit card, no trial. Start free, upgrade when ready.' },
  { icon: <Globe className="w-6 h-6" />, title: 'Share anywhere', desc: 'One link — share on WhatsApp, Instagram, Facebook, anywhere.' },
];

const benefits = [
  { icon: <BarChart3 className="w-7 h-7" />, title: 'Increase sales', desc: 'Reach customers beyond your local area and sell 24/7.' },
  { icon: <Globe className="w-7 h-7" />, title: 'Reach more customers', desc: 'Share your shop link everywhere and grow your audience.' },
  { icon: <Zap className="w-7 h-7" />, title: 'Simple and fast', desc: 'No learning curve. Set up once, sell forever.' },
];

const trustItems = [
  { icon: <Zap className="w-4 h-4" />, text: 'No coding required' },
  { icon: <Smartphone className="w-4 h-4" />, text: 'Works on any phone' },
  { icon: <Shield className="w-4 h-4" />, text: 'Setup in under 2 minutes' },
];

export default function Landing({ onGetStarted, onDemo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-surface-900 overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center shadow-soft">
              <span className="text-white font-extrabold text-base">D</span>
            </div>
            <span className="font-bold text-lg text-surface-900">DukanLink</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600">
            <a href="#how" className="hover:text-surface-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-surface-900 transition-colors">Features</a>
            <a href="#demo" className="hover:text-surface-900 transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-surface-900 transition-colors">Pricing</a>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Device preview icon */}
            <button
              onClick={onDemo}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
              title="Preview Demo"
            >
              <Eye className="w-[18px] h-[18px]" />
            </button>

            {/* CTA */}
            <button onClick={onGetStarted} className="hidden sm:inline-flex px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all active:scale-95 shadow-soft">
              Get Started
            </button>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-surface-600 hover:bg-surface-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-surface-100 px-4 py-4 space-y-1 animate-[fadeIn_150ms_ease-out]">
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50">How it works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50">Features</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50">Demo</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50">Pricing</a>
            <div className="pt-2 border-t border-surface-100 mt-2">
              <button onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} className="w-full py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40 overflow-hidden bg-surface-50">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-surface-50 to-surface-50" />
        <div className="absolute top-10 -left-40 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-xs font-semibold mb-6 sm:mb-8">
              <Zap className="w-3.5 h-3.5" />
              Free to start — No credit card needed
            </div>
          </FadeIn>

          <FadeIn delay={50}>
            <h1 className="text-[2rem] sm:text-5xl lg:text-7xl font-extrabold leading-[1.15] sm:leading-[1.1] tracking-tight text-surface-900 mb-4">
              Open Your Online Shop in{' '}
              <span className="text-primary-500">2 Minutes</span>
            </h1>
          </FadeIn>

          <FadeIn delay={100}>
            <p className="text-base sm:text-lg lg:text-xl text-surface-500 leading-relaxed mt-4 sm:mt-6 mb-8 sm:mb-10 max-w-lg mx-auto">
              Stop losing orders in chats. Get your own shop link and receive orders directly on WhatsApp.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
              <button
                onClick={onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-primary-500 text-white font-bold text-base sm:text-lg rounded-full hover:bg-primary-600 hover:shadow-elevated transition-all active:scale-[0.98] shadow-soft w-full sm:w-auto"
              >
                Get Early Access — Free
              </button>
              <button
                onClick={onDemo}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-surface-900 font-semibold text-base sm:text-lg rounded-full border-2 border-surface-300 hover:border-surface-400 hover:shadow-soft transition-all active:scale-[0.98] w-full sm:w-auto"
              >
                View Live Demo
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-surface-400 font-medium">
              {trustItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 sm:py-20 lg:py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary-600 mb-2">TRUSTED BY 500+ SHOPS</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">Businesses already growing with DukanLink</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-5 lg:gap-8">
            {socialProofCards.map((card, i) => (
              <FadeIn key={card.name} delay={i * 100}>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden group hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                  <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
                    <img src={card.banner} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-bold text-white text-lg">{card.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-surface-500">{card.tagline}</p>
                    <div className="flex items-center gap-0.5 mt-2">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14 lg:mb-20">
              <p className="text-sm font-semibold text-primary-600 mb-2">HOW IT WORKS</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">Three simple steps to your online shop</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {steps.map((step, i) => (
              <FadeIn key={step.title} delay={i * 150}>
                <div className="relative text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-5">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                      {step.icon}
                    </div>
                    {i < 2 && (
                      <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-surface-200 to-transparent" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-primary-600 mb-2 tracking-wider">STEP {i + 1}</div>
                  <h3 className="text-xl font-bold text-surface-900 mb-3">{step.title}</h3>
                  <p className="text-surface-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14 lg:mb-20">
              <p className="text-sm font-semibold text-primary-600 mb-2">FEATURES</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">Everything you need to sell online</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">{f.title}</h3>
                  <p className="text-surface-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10 lg:mb-14">
              <p className="text-sm font-semibold text-primary-600 mb-2">LIVE DEMO</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">See how your shop will look</h2>
              <p className="text-surface-500 mt-3">Click "View Full Demo" to explore the complete shop experience</p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-elevated overflow-hidden border border-surface-200">
                {/* Banner */}
                <div className="h-40 sm:h-48 lg:h-56 relative overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Bakery Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl border-4 border-white shadow-card overflow-hidden bg-white">
                    <img src="https://images.pexels.com/photos/1070880/pexels-photo-1070880.jpeg?auto=compress&cs=tinysrgb&w=200" alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="pt-14 px-6 pb-2">
                  <h3 className="text-xl font-bold text-surface-900">Bakery Shop</h3>
                  <p className="text-sm text-surface-500 mt-1">Fresh cakes & pastries daily</p>
                </div>
                <div className="px-5 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {demoProducts.map(p => (
                    <div key={p.name} className="bg-surface-50 rounded-xl overflow-hidden group hover:shadow-card transition-all duration-200">
                      <img src={p.image} alt={p.name} className="w-full h-24 sm:h-28 object-cover" />
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-surface-900 truncate">{p.name}</p>
                        <p className="text-xs font-bold text-primary-600 mt-0.5">₹{p.price}</p>
                        <button className="w-full mt-2 py-1.5 text-[10px] font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all active:scale-95">
                          Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <button onClick={onDemo} className="w-full py-3 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    View Full Demo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 sm:py-24 lg:py-32 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14 lg:mb-20">
              <p className="text-sm font-semibold text-primary-600 mb-2">WHY DUKANLINK</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">Built for real businesses</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8 lg:gap-16">
            {benefits.map((b, i) => (
              <FadeIn key={b.title} delay={i * 120}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-6">
                    {b.icon}
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 mb-3">{b.title}</h3>
                  <p className="text-surface-500 leading-relaxed max-w-sm mx-auto">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14 lg:mb-20">
              <p className="text-sm font-semibold text-primary-600 mb-2">PRICING</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">Simple, transparent pricing</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <FadeIn>
              <div className="bg-white rounded-2xl shadow-card p-7 lg:p-10 border border-surface-200 h-full flex flex-col">
                <h3 className="text-xl font-bold text-surface-900">Free</h3>
                <p className="text-4xl font-extrabold text-surface-900 mt-4">₹0<span className="text-base font-medium text-surface-400">/month</span></p>
                <ul className="mt-8 space-y-4 text-surface-600 flex-1">
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> Up to 10 products</li>
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> WhatsApp ordering</li>
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> Mobile-optimized shop</li>
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-surface-100 rounded-full flex items-center justify-center text-surface-400 text-xs flex-shrink-0">—</span><span className="text-surface-400">Analytics</span></li>
                </ul>
                <button onClick={onGetStarted} className="w-full mt-8 py-3.5 bg-surface-100 text-surface-700 font-semibold rounded-xl hover:bg-surface-200 transition-all active:scale-[0.98]">
                  Get Started Free
                </button>
              </div>
            </FadeIn>
            {/* Pro */}
            <FadeIn delay={100}>
              <div className="bg-white rounded-2xl shadow-elevated p-7 lg:p-10 border-2 border-primary-500 relative sm:scale-[1.03] h-full flex flex-col">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full shadow-soft">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold text-surface-900">Pro</h3>
                <p className="text-4xl font-extrabold text-surface-900 mt-4">₹199<span className="text-base font-medium text-surface-400">/month</span></p>
                <ul className="mt-8 space-y-4 text-surface-600 flex-1">
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> Unlimited products</li>
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> WhatsApp ordering</li>
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> Mobile-optimized shop</li>
                  <li className="flex items-center gap-3"><span className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">✓</span> Analytics dashboard</li>
                </ul>
                <button onClick={onGetStarted} className="w-full mt-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all active:scale-[0.98] shadow-soft">
                  Start Pro Trial
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-surface-900 to-surface-800 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5">Start your shop today</h2>
            <p className="text-lg sm:text-xl text-surface-400 mb-10">It takes less than 2 minutes</p>
            <button onClick={onGetStarted} className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 transition-all active:scale-95 shadow-elevated">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-900 text-surface-400 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-extrabold text-base">D</span>
              </div>
              <span className="font-bold text-white text-lg">DukanLink</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-surface-800 rounded-lg flex items-center justify-center hover:bg-surface-700 transition-colors" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 rounded-lg flex items-center justify-center hover:bg-surface-700 transition-colors" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 rounded-lg flex items-center justify-center hover:bg-surface-700 transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-800 text-center text-xs text-surface-500">
            &copy; 2026 DukanLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
