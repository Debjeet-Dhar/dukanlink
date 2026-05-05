import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { handleSupabaseError } from '../lib/errorHandler';
import { getProductImageUrl } from '../lib/productImage';

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
  const [actionError, setActionError] = useState(null);

  const refreshShop = useCallback(async () => {
    if (!user || !supabase) { setShop(null); setShopLoading(false); return; }
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
    if (!shop?.id || !supabase) { setProducts([]); setProductsLoading(false); return; }
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
        image: getProductImageUrl(p.image),
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
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, owner_id, name, slug, city, whatsapp, description, banner, logo, plan, status, created_at, updated_at');
      if (error || !data) return;

      const ownerIds = [...new Set(data.map(shop => shop.owner_id).filter(Boolean))];
      let profilesById = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, avatar_url, last_sign_in_at')
          .in('id', ownerIds);

        profilesById = Object.fromEntries((profiles || []).map(profile => [profile.id, profile]));
      }

      const shopsWithCounts = await Promise.all(
        data.map(async (s) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', s.id);
          const profile = profilesById[s.owner_id] || {};
          return {
            id: s.id,
            ownerId: s.owner_id,
            name: s.name,
            slug: s.slug,
            description: s.description || '',
            banner: s.banner || '',
            logo: s.logo || '',
            owner: profile.full_name || profile.email || 'Unknown owner',
            ownerEmail: profile.email || '',
            ownerAvatar: profile.avatar_url || '',
            ownerLastSeen: profile.last_sign_in_at || null,
            ownerPhone: s.whatsapp || '',
            city: s.city || '',
            plan: s.plan || 'free',
            productCount: count || 0,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            status: s.status || 'active',
          };
        })
      );
      setAdminShops(shopsWithCounts);
    } catch (error) {
      console.error(handleSupabaseError(error, 'refreshAdminShops'));
    }
  }, []);

  useEffect(() => { refreshShop(); }, [refreshShop]);
  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  const updateShop = useCallback(async (data) => {
    if (!shop?.id || !supabase) return;
    setActionError(null);
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.banner !== undefined) updateData.banner = data.banner;
    if (data.logo !== undefined) updateData.logo = data.logo;

    const { error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', shop.id);
    if (error) {
      setActionError(handleSupabaseError(error, 'updateShop'));
    } else {
      await refreshShop();
    }
  }, [shop?.id, refreshShop]);

  const addProduct = useCallback(async (product) => {
    if (!shop?.id || !supabase) return false;
    setActionError(null);
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
    if (error) {
      setActionError(handleSupabaseError(error, 'addProduct'));
      return false;
    }
    await refreshProducts();
    return true;
  }, [shop?.id, refreshProducts]);

  const updateProduct = useCallback(async (id, data) => {
    if (!supabase) return false;
    setActionError(null);
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
    if (error) {
      setActionError(handleSupabaseError(error, 'updateProduct'));
      return false;
    }
    await refreshProducts();
    return true;
  }, [refreshProducts]);

  const deleteProduct = useCallback(async (id) => {
    if (!supabase) return;
    setActionError(null);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      setActionError(handleSupabaseError(error, 'deleteProduct'));
    } else {
      await refreshProducts();
    }
  }, [refreshProducts]);

  const upgradePlan = useCallback(async () => {
    setActionError('Payments are not connected yet. Premium upgrades must be enabled through billing.');
    return false;
  }, []);

  const isSlugAvailable = useCallback(async (slug) => {
    if (!slug || slug.length < 3 || !supabase) return false;
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
    if (!supabase) return;
    setActionError(null);
    const { error } = await supabase
      .from('shops')
      .update({ status })
      .eq('id', id);
    if (error) {
      setActionError(handleSupabaseError(error, 'updateAdminShopStatus'));
      return false;
    }
    await refreshAdminShops();
    return true;
  }, [refreshAdminShops]);

  const updateAdminShopPlan = useCallback(async (id, plan) => {
    if (!supabase) return false;
    setActionError(null);
    const { error } = await supabase
      .from('shops')
      .update({ plan })
      .eq('id', id);
    if (error) {
      setActionError(handleSupabaseError(error, 'updateAdminShopPlan'));
      return false;
    }
    await refreshAdminShops();
    return true;
  }, [refreshAdminShops]);

  const clearActionError = useCallback(() => setActionError(null), []);

  return (
    <AppContext.Provider value={{
      shop,
      products,
      adminShops,
      shopLoading,
      productsLoading,
      actionError,
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
      updateAdminShopPlan,
      clearActionError,
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
