// ImageKit Configuration - Only URL endpoint is needed on client
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  size: number;
  versionInfo: {
    id: string;
    name: string;
  };
  fileType: string;
  mime: string;
  width?: number;
  height?: number;
  duration?: number;
  hasAlpha?: boolean;
  isPrivateFile: boolean;
  customMetadata?: Record<string, any>;
  embeddedMetadata: {
    DateCreated?: string;
    DateModified?: string;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  AITags?: any;
  searchTags?: string[];
  isPublished: boolean;
  folder: string;
  permanentDelete: boolean;
  checksumValue: string;
  polaroidUrl?: string;
  videoThumbnailUrl?: string;
  isArchived: boolean;
  customCoordinates?: string;
  densityInfo?: {
    density: number;
  };
}

/**
 * Upload image to ImageKit
 * Used for visitor selfies
 */
export async function uploadToImageKit(
  file: Blob,
  fileName: string,
  folder: string = '/visitors'
): Promise<ImageKitUploadResponse | null> {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'true');
    formData.append('tags', 'gatepass,visitor');

    // Convert blob to base64 for easier transmission
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          
          // Call the server endpoint to upload to ImageKit
          const response = await fetch('/api/imagekit/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64String,
              fileName,
              folder,
              tags: ['gatepass', 'visitor'],
            }),
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          if (data.success) {
            resolve(data.data);
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (error) {
          console.error('[v0] ImageKit upload error:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('[v0] ImageKit upload error:', error);
    return null;
  }
}

/**
 * Get ImageKit URL with transformations
 */
export function getImageKitUrl(filePath: string, width?: number, height?: number, quality: number = 80): string {
  if (!IMAGEKIT_URL_ENDPOINT || !filePath) return '';
  
  let url = `${IMAGEKIT_URL_ENDPOINT}${filePath}`;
  
  // Add query parameters for transformations
  const params = new URLSearchParams();
  
  if (width) params.append('w', String(width));
  if (height) params.append('h', String(height));
  params.append('q', String(quality));
  
  return params.toString() ? `${url}?${params.toString()}` : url;
}

/**
 * Delete image from ImageKit (requires private key - server-side only)
 */
export async function deleteFromImageKit(fileId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/imagekit/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('[v0] ImageKit delete error:', error);
    return false;
  }
}

/**
 * Get secure upload token from server
 * Returns a token for client-side direct uploads to ImageKit
 */
export async function getImageKitUploadToken(): Promise<string> {
  try {
    const response = await fetch('/api/imagekit/auth', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get upload token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('[v0] Failed to get ImageKit token:', error);
    throw error;
  }
}
