import { supabase } from './supabase';

export async function isAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Admin check failed:', error);
      return false;
    }

    return data?.is_admin === true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get user failed:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get user profile failed:', error);
    return null;
  }
}

export async function createUserProfile(userId, isAdmin = false) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ id: userId, is_admin: isAdmin }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create user profile failed:', error);
    throw error;
  }
}

export async function setAdminStatus(userId, isAdmin) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Set admin status failed:', error);
    throw error;
  }
}
