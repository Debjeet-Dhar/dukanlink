import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import useSEO from "../hooks/useSEO";
import { PAGE_SEO } from "../lib/seo";
import {
  FloatingInput,
  FloatingTextarea,
  Modal,
  EmptyState,
} from "../components/UI";
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Search,
  Upload,
  Crown,
  AlertCircle,
  Loader2,
} from "../components/Icons";
import { uploadImage } from "../lib/storage";
import { DEFAULT_PRODUCT_IMAGE, getProductImageUrl } from "../lib/productImage";

export default function Products() {
  const {
    products,
    shop,
    canAddProduct,
    upgradePlan,
    addProduct,
    updateProduct,
    deleteProduct,
    productsLoading,
    FREE_PRODUCT_LIMIT,
  } = useApp();

  // Set SEO metadata for Products page
  useSEO({
    ...PAGE_SEO.products,
    canonicalUrl: "https://dukanlink.com/products",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    category: "",
    tags: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const isPremium = shop?.plan === "premium";
  const atLimit = !canAddProduct();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    if (atLimit) {
      setShowLimitModal(true);
      return;
    }
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      image: "",
      description: "",
      category: "",
      tags: "",
    });
    setImagePreview("");
    setSelectedImageFile(null);
    setImageError("");
    setModalOpen(true);
  };

  const openEdit = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      name: p.name,
      price: String(p.price),
      image: p.image,
      description: p.description,
      category: p.category,
      tags: (p.tags || []).join(", "),
    });
    setImagePreview(p.image);
    setSelectedImageFile(null);
    setImageError("");
    setModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setSelectedImageFile(file);
    setImageError("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) return;
    if (selectedImageFile && !shop?.id) {
      setImageError("Shop is not ready yet. Please try again.");
      return;
    }
    setSaving(true);
    setImageError("");
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    let imageUrl = getProductImageUrl(form.image);

    if (selectedImageFile) {
      try {
        imageUrl = await uploadImage(selectedImageFile, shop.id);
      } catch (error) {
        setImageError(error.message || "Failed to upload image");
        setSaving(false);
        return;
      }
    }

    const data = {
      name: form.name.trim(),
      price: Number(form.price),
      image: imageUrl || DEFAULT_PRODUCT_IMAGE,
      description: form.description.trim(),
      category: form.category.trim(),
      tags,
    };
    const ok = editingId
      ? await updateProduct(editingId, data)
      : await addProduct(data);
    setSaving(false);
    if (ok) {
      setSelectedImageFile(null);
      setModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4 lg:space-y-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-surface-900">
            Products
          </h1>
          {!isPremium && (
            <p className="text-xs text-surface-500 mt-1">
              {products.length}/{FREE_PRODUCT_LIMIT} products used
              {atLimit && (
                <span className="text-amber-600 font-semibold ml-1">
                  {" "}
                  \u00B7 Limit reached
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-all active:scale-95 shadow-soft"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {atLimit && !isPremium && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200/60">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900">
              Product limit reached
            </p>
            <p className="text-xs text-surface-500 mt-0.5">
              Upgrade to Premium for unlimited products
            </p>
          </div>
          <button
            onClick={() => setShowLimitModal(true)}
            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-all"
          >
            Upgrade
          </button>
        </div>
      )}

      {products.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title={
            products.length === 0
              ? "No products yet — add your first item"
              : "No products match your search"
          }
          action={
            products.length === 0 ? (
              <button
                onClick={openAdd}
                className="btn-primary max-w-[200px] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="card card-hover group">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 sm:h-36 lg:h-44 object-contain rounded-xl bg-surface-100 p-2"
                />
                {product.tags && product.tags.length > 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-block px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded shadow-md">
                      {product.tags[0]}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(product.id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft hover:bg-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-surface-600" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-surface-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-primary-600 mt-0.5">
                  ₹{product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <button
          onClick={openAdd}
          className="fixed bottom-24 right-5 sm:hidden w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-elevated flex items-center justify-center hover:bg-primary-700 transition-all active:scale-90 z-30"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <div className="space-y-4">
          <FloatingInput
            label="Product Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <FloatingInput
            label="Price (₹)"
            value={form.price}
            onChange={(v) => setForm((f) => ({ ...f, price: v }))}
            type="number"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-700">
              Product Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative group/img">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-contain rounded-xl border-2 border-surface-200 bg-surface-100 p-2"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <span className="text-white text-sm font-semibold">
                    Change Image
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-surface-300 hover:bg-surface-50 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-surface-400">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm text-surface-500 font-medium">
                  Click to upload product image
                </p>
                <p className="text-xs text-surface-400 mt-1">
                  JPG, PNG up to 5MB
                </p>
              </button>
            )}
            {imageError && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-500 font-medium">{imageError}</p>
              </div>
            )}
          </div>
          <FloatingTextarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          />
          <FloatingInput
            label="Category"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
          />
          <FloatingInput
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
          />
          <p className="text-xs text-surface-400 -mt-2">
            e.g. Best Seller, Festive Special, For Dinner
          </p>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.price.trim() || saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingId ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
      >
        <p className="text-surface-600 mb-5">
          Are you sure you want to delete this product? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </Modal>

      <Modal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Product Limit Reached"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200/60">
            <Crown className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-surface-900">
                Upgrade to Premium
              </p>
              <p className="text-xs text-surface-500 mt-0.5">
                Free plan is limited to {FREE_PRODUCT_LIMIT} products. Premium
                has no limits.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await upgradePlan();
              setShowLimitModal(false);
            }}
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all active:scale-[0.98] shadow-soft flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" /> Upgrade to Premium
          </button>
          <button
            onClick={() => setShowLimitModal(false)}
            className="w-full py-2.5 text-surface-500 font-medium text-sm hover:text-surface-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </Modal>
    </div>
  );
}
