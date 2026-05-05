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
    const { data, error } = await supabase.rpc('admin_exists');
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

export async function claimFirstAdmin() {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.rpc('claim_first_admin');
    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Claim first admin failed:', error);
    throw error;
  }
}

export async function createUserProfile(userId, profile = {}) {
  if (!supabase) throw new Error('Supabase not configured');

  const insertPayload = { id: userId, is_admin: false };
  if (profile.email) insertPayload.email = profile.email;
  if (profile.fullName) insertPayload.full_name = profile.fullName;
  if (profile.avatarUrl) insertPayload.avatar_url = profile.avatarUrl;
  if (profile.lastSignInAt) insertPayload.last_sign_in_at = profile.lastSignInAt;

  let { error } = await supabase
    .from('user_profiles')
    .upsert([insertPayload], {
      onConflict: 'id',
      ignoreDuplicates: true,
    });

  if (error?.message?.includes('column') && Object.keys(profile).length > 0) {
    const fallback = await supabase
      .from('user_profiles')
      .upsert([{ id: userId, is_admin: false }], {
        onConflict: 'id',
        ignoreDuplicates: true,
      });
    error = fallback.error;
  }

  if (error) {
    if (error.code === '23505') {
      return getUserProfile(userId);
    }
    console.error('Create user profile failed:', error);
    throw error;
  }

  const updatePayload = {};
  if (profile.email) updatePayload.email = profile.email;
  if (profile.fullName) updatePayload.full_name = profile.fullName;
  if (profile.avatarUrl) updatePayload.avatar_url = profile.avatarUrl;
  if (profile.lastSignInAt) updatePayload.last_sign_in_at = profile.lastSignInAt;

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (updateError) {
      console.error('Update user profile failed:', updateError);
    }
  }

  return getUserProfile(userId);
}
