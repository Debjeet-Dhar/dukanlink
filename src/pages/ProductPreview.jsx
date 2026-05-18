import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  MapPin,
  MessageCircle,
  Phone,
  Loader2,
  ArrowLeft,
  Star,
  Eye,
} from "../components/Icons";
import { getProductImageUrl } from "../lib/productImage";
import useSEO from "../hooks/useSEO";
import { PAGE_SEO } from "../lib/seo";

export default function ProductPreview() {
  const { slug, productId } = useParams();
  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!slug || !productId) {
        setLoading(false);
        return;
      }
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Fetch shop
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

      if (shopData) {
        setShop({
          id: shopData.id,
          name: shopData.name,
          city: shopData.city || "",
          whatsapp: shopData.whatsapp || "",
          description: shopData.description || "",
          slug: shopData.slug,
          banner:
            shopData.banner ||
            "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
          logo:
            shopData.logo ||
            "https://images.pexels.com/photos/4226880/pexels-photo-4226880.jpeg?auto=compress&cs=tinysrgb&w=200",
          plan: shopData.plan,
        });

        // Fetch product
        const { data: productData } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq("shop_id", shopData.id)
          .maybeSingle();

        if (productData) {
          setProduct({
            id: productData.id,
            name: productData.name,
            price: Number(productData.price),
            image: getProductImageUrl(productData.image),
            description: productData.description || "",
            category: productData.category || "",
            tags: productData.tags || [],
          });

          // Set SEO for product
          useSEO({
            ...PAGE_SEO.productPreview,
            title: `${productData.name} - ${shopData.name} | DukanHub`,
            description:
              productData.description ||
              `Buy ${productData.name} from ${shopData.name}. Order directly on WhatsApp. AI-powered WhatsApp store builder.`,
            keywords: `${PAGE_SEO.productPreview.keywords}, buy ${productData.name}, ${shopData.name}, ${productData.category}`,
            canonicalUrl: `https://dukanlink.com/shop/${slug}/product/${productId}`,
            ogImage: getProductImageUrl(productData.image),
          });
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [slug, productId]);

  const handleOrder = () => {
    if (!shop || !product) return;
    const productUrl = `${window.location.origin}/shop/${shop.slug}/product/${product.id}`;
    const message = encodeURIComponent(
      `🛍️ *Order Request from ${shop.name}*\n\n` +
        `📦 *Product:* ${product.name}\n` +
        `💰 *Price:* ₹${product.price}\n` +
        `${product.category ? `🏷️ *Category:* ${product.category}\n` : ""}` +
        `${product.description ? `📝 *Description:* ${product.description}\n\n` : "\n"}` +
        `🔗 *View Product:* ${productUrl}\n\n` +
        `Hi! I'd like to place an order for this item. Please confirm availability and delivery details. Thank you! 🙏`,
    );
    let phone = shop.whatsapp.replace(/\D/g, "");
    if (!phone.startsWith("91")) {
      phone = "+91" + phone;
    }
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

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
          <h2 className="text-xl font-bold text-surface-900 mb-2">
            Database not configured
          </h2>
          <p className="text-surface-600 text-sm leading-relaxed mb-6">
            Add <span className="font-mono text-xs">VITE_SUPABASE_URL</span> and{" "}
            <span className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</span> to
            a <span className="font-mono text-xs">.env</span> file (see{" "}
            <span className="font-mono text-xs">.env.example</span>), then
            restart the dev server.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!shop || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-surface-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">
            Product not found
          </h2>
          <p className="text-surface-500 text-sm mb-6">
            This product may have been removed or the link is incorrect.
          </p>
          <Link
            to={`/shop/${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] page-enter pb-20 sm:pb-0">
      {/* Header */}
      <div className="relative h-32 sm:h-40 bg-surface-200">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-700/90" />
        <div className="absolute top-4 left-4 right-4 mx-auto flex max-w-5xl items-center justify-between text-white sm:px-2">
          <Link
            to={`/shop/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-white/25"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>
          <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-md">
            Product Details
          </span>
        </div>
        <div className="absolute left-4 bottom-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-white shadow-elevated">
            <img
              src={shop.logo}
              alt="Logo"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{shop.name}</h1>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {shop.city}
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-[24px] shadow-elevated overflow-hidden">
          {/* Product Image */}
          <div className="relative bg-[#f3f5ef] p-6">
            <div className="flex items-center justify-center h-80 sm:h-96">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="absolute left-6 top-6">
                <span className="inline-block rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-surface-800 shadow-soft backdrop-blur">
                  {product.tags[0]}
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="mb-4">
              {product.category && (
                <p className="text-xs font-extrabold uppercase tracking-wide text-primary-700 mb-2">
                  {product.category}
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 mb-2">
                {product.name}
              </h2>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm text-surface-500 ml-1">(4.8)</span>
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-surface-900 mb-2">
                  Description
                </h3>
                <p className="text-surface-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Price and Actions */}
            <div className="border-t border-surface-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-surface-400">
                    Price
                  </p>
                  <p className="text-3xl font-extrabold text-surface-900">
                    ₹{product.price}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={`tel:${shop.whatsapp}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm font-bold text-surface-700 shadow-soft transition-all hover:border-surface-300 hover:shadow-card active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button
                    onClick={handleOrder}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-extrabold text-white shadow-elevated transition-all hover:bg-green-700 hover:shadow-card active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" /> Order on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="mt-6 bg-white rounded-[24px] p-6 shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={shop.logo}
              alt="Logo"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-bold text-surface-900">
                {shop.name}
              </h3>
              <p className="text-surface-500 text-sm">{shop.city}</p>
            </div>
          </div>
          {shop.description && (
            <p className="text-surface-600 text-sm leading-relaxed mb-4">
              {shop.description}
            </p>
          )}
          <div className="flex gap-3">
            <a
              href={`tel:${shop.whatsapp}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-bold text-surface-700 shadow-soft transition-all hover:border-surface-300 hover:shadow-card active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" /> Call Now
            </a>
            <button
              onClick={() => {
                const message = encodeURIComponent(
                  `Hi! I want to know more about ${product.name}`,
                );
                const phone = shop.whatsapp.replace(/\D/g, "");
                window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-elevated transition-all hover:bg-green-700 active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-200 bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center gap-2">
          <span className="text-xs text-surface-400 font-medium">
            Powered by
          </span>
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-extrabold text-[8px]">D</span>
            </div>
            <span className="text-xs font-bold text-surface-700">
              DukanLink
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-200 bg-white/95 p-3 shadow-elevated backdrop-blur sm:hidden">
        <div className="flex gap-3">
          <a
            href={`tel:${shop.whatsapp}`}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm font-bold text-surface-700 shadow-soft transition-all hover:border-surface-300 hover:shadow-card active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <button
            onClick={handleOrder}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-elevated active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" /> Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
