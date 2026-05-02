import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { handleSupabaseError } from '../lib/errorHandler';

const FREE_PRODUCT_LIMIT = 15;

const defaultShopImages = {
  banner: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200',
  logo: 'https://images.pexels.com/photos/4226880/pexels-photo-4226880.jpeg?auto=compress&cs=tinysrgb&w=200',
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [adminShops, setAdminShops] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const refreshShop = useCallback(async () => {
    if (!user) { setShop(null); setShopLoading(false); return; }
    setShopLoading(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setShop({
          id: data.id,
          name: data.name,
          city: data.city || '',
          whatsapp: data.whatsapp || '',
          description: data.description || '',
          slug: data.slug,
          banner: data.banner || defaultShopImages.banner,
          logo: data.logo || defaultShopImages.logo,
          plan: data.plan,
          status: data.status,
        });
      } else {
        setShop(null);
      }
    } catch (error) {
      console.error(handleSupabaseError(error, 'refreshShop'));
      setShop(null);
    }
    setShopLoading(false);
  }, [user]);

  const refreshProducts = useCallback(async () => {
    if (!shop?.id) { setProducts([]); setProductsLoading(false); return; }
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image || '',
        description: p.description || '',
        category: p.category || '',
        tags: p.tags || [],
      })));
    } catch (error) {
      console.error(handleSupabaseError(error, 'refreshProducts'));
      setProducts([]);
    }
    setProductsLoading(false);
  }, [shop?.id]);

  const refreshAdminShops = useCallback(async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('id, name, slug, city, whatsapp, plan, status, created_at');
    if (error || !data) return;

    const shopsWithCounts = await Promise.all(
      data.map(async (s) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', s.id);
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          owner: 'Owner',
          ownerPhone: s.whatsapp || '',
          city: s.city || '',
          plan: s.plan || 'free',
          productCount: count || 0,
          createdAt: s.created_at,
          status: s.status || 'active',
        };
      })
    );
    setAdminShops(shopsWithCounts);
  }, []);

  useEffect(() => { refreshShop(); }, [refreshShop]);
  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  const updateShop = useCallback(async (data) => {
    if (!shop?.id) return;
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.banner !== undefined) updateData.banner = data.banner;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.plan !== undefined) updateData.plan = data.plan;

    const { error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', shop.id);
    if (!error) await refreshShop();
  }, [shop?.id, refreshShop]);

  const addProduct = useCallback(async (product) => {
    if (!shop?.id) return;
    const { error } = await supabase
      .from('products')
      .insert({
        shop_id: shop.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        tags: product.tags,
      });
    if (!error) await refreshProducts();
  }, [shop?.id, refreshProducts]);

  const updateProduct = useCallback(async (id, data) => {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);
    if (!error) await refreshProducts();
  }, [refreshProducts]);

  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (!error) await refreshProducts();
  }, [refreshProducts]);

  const upgradePlan = useCallback(async () => {
    await updateShop({ plan: 'premium' });
  }, [updateShop]);

  const isSlugAvailable = useCallback(async (slug) => {
    if (!slug || slug.length < 3) return false;
    if (slug === shop?.slug) return true;
    const { data, error } = await supabase
      .from('shops')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (error) return false;
    return !data;
  }, [shop?.slug]);

  const canAddProduct = useCallback(() => {
    if (shop?.plan === 'premium') return true;
    return products.length < FREE_PRODUCT_LIMIT;
  }, [shop?.plan, products.length]);

  const updateAdminShopStatus = useCallback(async (id, status) => {
    const { error } = await supabase
      .from('shops')
      .update({ status })
      .eq('id', id);
    if (!error) await refreshAdminShops();
  }, [refreshAdminShops]);

  return (
    <AppContext.Provider value={{
      shop,
      products,
      adminShops,
      shopLoading,
      productsLoading,
      updateShop,
      addProduct,
      updateProduct,
      deleteProduct,
      upgradePlan,
      isSlugAvailable,
      canAddProduct,
      refreshShop,
      refreshProducts,
      refreshAdminShops,
      updateAdminShopStatus,
      FREE_PRODUCT_LIMIT,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
