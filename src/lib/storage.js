import { supabase } from './supabase';

const BUCKET_NAME = 'shop-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadImage(file, shopId) {
  try {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image must be smaller than 5MB');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
    }

    const userId = user.id;
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const path = `${userId}/${shopId}/${filename}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

export async function deleteImage(imagePath) {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const path = extractPathFromUrl(imagePath) || imagePath;
    if (!path) throw new Error('Invalid image path');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Image delete failed:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
}

export function extractPathFromUrl(url) {
  try {
    if (!url) return null;
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/storage\/v1\/object\/public\/shop-images\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function getImagePublicUrl(path) {
  if (!supabase) return '';
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return publicUrl;
}
