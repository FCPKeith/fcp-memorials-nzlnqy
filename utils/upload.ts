
import { BACKEND_URL } from './api';

/**
 * Upload a file to the backend
 * 
 * @param file - File object (web) or file URI (native)
 * @param fieldName - Form field name (default: 'file')
 * @returns Upload response with URL and filename
 */
export const uploadFile = async (
  file: File | string,
  fieldName: string = 'file'
): Promise<{ url: string; filename: string }> => {
  console.log('[Upload] Uploading file:', file);

  const formData = new FormData();

  if (typeof file === 'string') {
    // Native: file is a URI
    const filename = file.split('/').pop() || 'upload';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append(fieldName, {
      uri: file,
      name: filename,
      type,
    } as any);
  } else {
    // Web: file is a File object
    formData.append(fieldName, file);
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload/media`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type - let the browser set it with boundary
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Upload] Error response:', response.status, text);
      throw new Error(`Upload failed: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log('[Upload] Upload successful:', data);
    return data;
  } catch (error) {
    console.error('[Upload] Upload failed:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 * 
 * @param files - Array of files or URIs
 * @returns Array of upload responses
 */
export const uploadFiles = async (
  files: (File | string)[]
): Promise<Array<{ url: string; filename: string }>> => {
  console.log('[Upload] Uploading multiple files:', files.length);

  const uploadPromises = files.map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
};
