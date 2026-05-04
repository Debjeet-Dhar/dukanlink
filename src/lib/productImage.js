export const DEFAULT_PRODUCT_IMAGE = 'https://images.pexels.com/photos/42269234/pexels-photo-42269234.jpeg?auto=compress&cs=tinysrgb&w=400';

export function getProductImageUrl(image) {
  if (!image || image.startsWith('blob:')) return DEFAULT_PRODUCT_IMAGE;
  return image;
}
