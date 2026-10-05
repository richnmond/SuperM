import { API_BASE_URL } from '../config';

export const getProductImagePaths = (product) => {
  const galleryImages = Array.isArray(product?.images)
    ? product.images.filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim())
    : [];
  const legacyImage = typeof product?.image === 'string' ? product.image.trim() : '';
  return [...new Set([...galleryImages, legacyImage].filter(Boolean))];
};

export const getProductImageUrl = (imagePath) => {
  const path = String(imagePath || '').trim();
  if (!path) return '';
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};