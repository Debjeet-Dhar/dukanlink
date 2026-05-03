import { supabase } from './supabase';

export async function isAdmin() {
  try {
    if (!supabase) return false;
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
    if (!supabase) return null;
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
    if (!supabase) return null;
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

export async function checkIfAnyAdminExists() {
  try {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export async function createUserProfile(userId, isAdmin = false) {
  if (!supabase) throw new Error('Supabase not configured');

  // First admin must be able to set is_admin true even if a row was already inserted
  // with false. Regular users use ignoreDuplicates so we never overwrite is_admin
  // on later logins (ensureUserProfile passes isAdmin false when any admin exists).
  if (isAdmin) {
    const { error } = await supabase
      .from('user_profiles')
      .upsert([{ id: userId, is_admin: true }], { onConflict: 'id' });

    if (error) {
      if (error.code === '23505') {
        return getUserProfile(userId);
      }
      console.error('Create user profile failed:', error);
      throw error;
    }
    return getUserProfile(userId);
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert([{ id: userId, is_admin: false }], {
      onConflict: 'id',
      ignoreDuplicates: true,
    });

  if (error) {
    if (error.code === '23505') {
      return getUserProfile(userId);
    }
    console.error('Create user profile failed:', error);
    throw error;
  }

  return getUserProfile(userId);
}

export async function setAdminStatus(userId, isAdmin) {
  try {
    if (!supabase) throw new Error('Supabase not configured');
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
