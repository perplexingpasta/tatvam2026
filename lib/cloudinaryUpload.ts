import { cloudinary } from './cloudinary';

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimeType: string,
  folder: string
): Promise<{ originalUrl: string; transformedUrl: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload to Cloudinary: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload failed: no result returned'));
          return;
        }

        const originalUrl = result.secure_url;
        
        // Transform the URL with f_auto,q_auto,w_800
        const urlParts = originalUrl.split('/upload/');
        const transformedUrl = `${urlParts[0]}/upload/f_auto,q_auto,w_800/${urlParts[1]}`;

        resolve({
          originalUrl,
          transformedUrl,
        });
      }
    );

    // Write the buffer to the upload stream
    uploadStream.end(fileBuffer);
  });
};
