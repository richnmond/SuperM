const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const crypto = require('crypto');
const path = require('path');

const PRODUCT_IMAGE_BUCKET = 'product-images';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};
const IMAGE_MIME_TYPES = Object.keys(IMAGE_EXTENSIONS);

let storageClient;
let bucketSetup;

const getStorageClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the backend environment.');
    error.statusCode = 503;
    throw error;
  }

  if (!storageClient) {
    storageClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: WebSocket }
    });
  }
  return storageClient;
};

const ensureProductImageBucket = async (client) => {
  const { data: existingBucket, error: lookupError } = await client.storage.getBucket(PRODUCT_IMAGE_BUCKET);

  if (lookupError) {
    const { error: createError } = await client.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE,
      allowedMimeTypes: IMAGE_MIME_TYPES
    });
    if (createError && !/already exists/i.test(createError.message || '')) {
      throw new Error(`Unable to create the ${PRODUCT_IMAGE_BUCKET} Supabase bucket: ${createError.message}`);
    }
  } else if (!existingBucket.public) {
    const { error: updateError } = await client.storage.updateBucket(PRODUCT_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE,
      allowedMimeTypes: IMAGE_MIME_TYPES
    });
    if (updateError) {
      throw new Error(`Unable to configure the ${PRODUCT_IMAGE_BUCKET} Supabase bucket: ${updateError.message}`);
    }
  }
};

const ensureBucket = (client) => {
  if (!bucketSetup) {
    bucketSetup = ensureProductImageBucket(client).catch((error) => {
      bucketSetup = null;
      throw error;
    });
  }
  return bucketSetup;
};

const uploadFile = async (file, { bucket = PRODUCT_IMAGE_BUCKET, folder = 'products' } = {}) => {
  if (!file?.buffer || !IMAGE_MIME_TYPES.includes(file.mimetype) || file.size > MAX_IMAGE_SIZE) {
    const error = new Error('Choose a valid JPEG, PNG, GIF, or WebP image no larger than 5 MB.');
    error.statusCode = 400;
    throw error;
  }

  const client = getStorageClient();
  if (bucket === PRODUCT_IMAGE_BUCKET) await ensureBucket(client);

  const objectPath = `${folder}/${crypto.randomUUID()}${IMAGE_EXTENSIONS[file.mimetype] || path.extname(file.originalname)}`;
  const { error: uploadError } = await client.storage.from(bucket).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '3600',
    upsert: false
  });
  if (uploadError) {
    console.error('Supabase image upload failed:', uploadError.message);
    throw new Error('Image upload failed. Check the Supabase Storage configuration and try again.');
  }

  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
};

const getProductImageObjectPath = (imageUrl) => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl || typeof imageUrl !== 'string') return null;

  try {
    const storageOrigin = new URL(supabaseUrl).origin;
    const parsedUrl = new URL(imageUrl);
    const prefix = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    if (parsedUrl.origin !== storageOrigin || !parsedUrl.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(parsedUrl.pathname.slice(prefix.length));
  } catch (_error) {
    return null;
  }
};

const removeProductImages = async (imageUrls = []) => {
  const objectPaths = [...new Set(imageUrls.map(getProductImageObjectPath).filter(Boolean))];
  if (objectPaths.length === 0) return;

  const client = getStorageClient();
  await ensureBucket(client);
  const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).remove(objectPaths);
  if (error) throw new Error(`Unable to remove old product images from Supabase: ${error.message}`);
};

module.exports = {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  PRODUCT_IMAGE_BUCKET,
  uploadFile,
  removeProductImages
};