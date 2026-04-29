import { cloudinary } from './cloudinary';

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  mimeType: string,
  folder: string,
  transformations?: object[]
): Promise<{ originalUrl: string; transformedUrl: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        ...(transformations && { transformation: transformations }),
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
}
