import { supabase } from './supabase';

export async function uploadImage(file, shopId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const userId = user.id;
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const path = `${userId}/${shopId}/${filename}`;

    const { data, error } = await supabase.storage
      .from('shop-images')
      .upload(path, file, { upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('shop-images')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

export async function deleteImage(imagePath) {
  try {
    const { error } = await supabase.storage
      .from('shop-images')
      .remove([imagePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Image delete failed:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
}

export function extractPathFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\/storage\/v1\/object\/public\/shop-images\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
