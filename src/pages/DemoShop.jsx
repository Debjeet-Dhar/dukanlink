import { MapPin, MessageCircle, Phone, ArrowLeft } from "../components/Icons";

const bakeryProducts = [
  {
    name: "Chocolate Truffle Cake",
    price: 550,
    image:
      "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Rich Belgian chocolate, 1kg",
  },
  {
    name: "Fresh Croissants",
    price: 120,
    image:
      "https://images.pexels.com/photos/1070880/pexels-photo-1070880.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Buttery flaky, pack of 4",
  },
  {
    name: "Red Velvet Cupcake",
    price: 90,
    image:
      "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Cream cheese frosting",
  },
  {
    name: "Artisan Bread Loaf",
    price: 180,
    image:
      "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Sourdough, 500g",
  },
  {
    name: "Blueberry Muffin",
    price: 75,
    image:
      "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Fresh blueberries",
  },
  {
    name: "Vanilla Pastry",
    price: 65,
    image:
      "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "Classic vanilla cream",
  },
];

export default function DemoShop({ onBack }) {
  const handleOrder = (productName) => {
    const message = encodeURIComponent(
      `🛍️ *Order Request from Demo Shop*\n\n` +
        `📦 *Product:* ${productName}\n\n` +
        `Hi! I'd like to place an order for this item. Please confirm availability and delivery details. Thank you! 🙏`,
    );
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-surface-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-medium text-surface-400">Demo Shop</span>
        <div className="w-16" />
      </div>

      {/* Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-surface-200 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Bakery Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* Logo + Shop Info */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 sm:-mt-20 mb-6 flex items-end gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl border-4 border-white shadow-elevated overflow-hidden bg-white flex-shrink-0">
            <img
              src="https://images.pexels.com/photos/1070880/pexels-photo-1070880.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Bakery Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
              Bakery Shop
            </h1>
            <div className="flex items-center gap-1.5 text-surface-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Mumbai, India</span>
            </div>
          </div>
        </div>

        <p className="text-surface-600 text-base leading-relaxed mb-6 max-w-2xl">
          Fresh cakes, pastries, and artisan bread baked daily with love. Order
          now and get delivery within 2 hours!
        </p>

        {/* Contact Buttons */}
        <div className="flex gap-3 mb-8 max-w-md">
          <a
            href="tel:+919876543210"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-surface-200 rounded-xl text-surface-700 font-semibold text-sm hover:border-surface-300 transition-all active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <button
            onClick={() => {
              const message = encodeURIComponent(
                "Hi! I want to know about your products.",
              );
              window.open(
                `https://wa.me/919876543210?text=${message}`,
                "_blank",
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all active:scale-[0.98] shadow-soft"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
        </div>

        {/* Products */}
        <h2 className="text-xl font-bold text-surface-900 mb-5">
          Our Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
          {bakeryProducts.map((product) => (
            <div
              key={product.name}
              className="bg-white rounded-2xl shadow-card overflow-hidden group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-36 sm:h-40 lg:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-sm font-semibold text-surface-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-surface-400 mt-0.5 truncate">
                  {product.desc}
                </p>
                <p className="text-base font-bold text-primary-600 mt-1.5">
                  ₹{product.price}
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 text-xs font-semibold text-surface-600 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                    View
                  </button>
                  <button
                    onClick={() => handleOrder(product.name)}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all active:scale-95 shadow-soft"
                  >
                    Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
