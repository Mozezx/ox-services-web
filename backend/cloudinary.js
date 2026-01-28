/**
 * Upload de imagens e vídeos para o Cloudinary.
 * Configure no .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !!(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload de um buffer (imagem ou vídeo) para o Cloudinary.
 * @param {Buffer} buffer - Conteúdo do arquivo
 * @param {Object} options - { folder, resourceType: 'image'|'video', publicId? }
 * @returns {Promise<{ secure_url: string, thumbnail_url?: string, public_id: string }>}
 */
function uploadBuffer(buffer, options = {}) {
  if (!isConfigured) {
    return Promise.reject(new Error('Cloudinary não configurado'));
  }

  const folder = options.folder || 'ox-uploads/obras';
  const resourceType = options.resourceType || 'image';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: options.publicId,
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result || !result.secure_url) return reject(new Error('Resposta inválida do Cloudinary'));
        const out = {
          secure_url: result.secure_url,
          public_id: result.public_id,
        };
        // Thumbnail para vídeo: frame inicial em JPG
        if (resourceType === 'video' && result.public_id) {
          out.thumbnail_url = cloudinary.url(result.public_id, {
            resource_type: 'video',
            format: 'jpg',
            start_offset: 0,
          });
        }
        return resolve(out);
      }
    );
    stream.end(buffer);
  });
}

module.exports = {
  isConfigured: () => isConfigured,
  uploadBuffer,
};
