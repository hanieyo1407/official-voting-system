// web/components/ImageUploader.tsx

import React, { useState, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios'; // Need axios for the direct Cloudinary upload

// --- UTILITY FUNCTION: Image Compression via Canvas ---
/**
 * Compresses an image file using HTML Canvas.
 * @param file The original image file.
 * @param maxWidth Max width for the compressed image (e.g., 500px).
 * @param quality JPEG quality (0.0 to 1.0).
 * @returns A Promise that resolves to the compressed image as a base64 string.
 */
const compressImage = (file: File, maxWidth: number = 500, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error("Could not get canvas context."));
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (error) => {
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// --- UTILITY FUNCTION: Full Cloudinary Upload Pipeline ---
/**
 * Executes the full Cloudinary signed upload pipeline: 
 * 1. Fetches a signature from the backend.
 * 2. Uploads the file directly to Cloudinary using the signature.
 * @param file The original image file.
 * @returns A Promise that resolves to the public URL of the uploaded image.
 */
const uploadToCloudinary = async (file: File): Promise<string> => {
    // 1. Compress Image
    const compressedBase64 = await compressImage(file);
    
    // 2. Fetch Signature from Backend
    const signatureResponse = await sjbuApi.getCloudinarySignature();
    
    // CRITICAL FIX: Destructure snake_case keys (cloud_name, api_key) and assign to camelCase variables (cloudName, apiKey)
    const { signature, timestamp, cloud_name, api_key, folder } = signatureResponse.data;
    
    const cloudName = cloud_name;
    const apiKey = api_key;

    // Check against the expected variables (cloudName/apiKey)
    if (!signature || !cloudName || !apiKey) {
        throw new Error("Missing Cloudinary signature, API key, or cloud name from backend response.");
    }

    // 3. Prepare Upload Data
    const formData = new FormData();
    formData.append('file', compressedBase64); // Compressed base64 string
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder); // The target folder defined on the backend
    
    // The official Cloudinary upload URL (uses the cloud name)
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // 4. Execute Direct Upload to Cloudinary CDN
    const uploadResponse = await axios.post(url, formData, {
        headers: {
            // Content-Type is typically not required for FormData/Axios, but can be useful
            'Content-Type': 'multipart/form-data', 
        },
    });

    // Check for upload success and return the public URL
    if (uploadResponse.data && uploadResponse.data.secure_url) {
        return uploadResponse.data.secure_url;
    }

    throw new Error('Cloudinary upload failed: Missing secure URL in response.');
};


interface ImageUploaderProps {
  // imageUrl now represents the publicly accessible URL from Cloudinary
  imageUrl: string | null; 
  // onUploadSuccess will now pass the final Cloudinary URL to the parent form
  onUploadSuccess: (cloudinaryUrl: string) => void; 
  // Optional: For displaying progress/error to the user
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onUploadSuccess, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
        setError(null);
        setIsLoading(true);
        try {
            // The public URL is returned from the pipeline
            const publicUrl = await uploadToCloudinary(file);
            
            // Pass the final Cloudinary URL to the parent component
            onUploadSuccess(publicUrl); 

        } catch (e: any) {
            console.error("Upload failed:", e);
            // Display a user-friendly error message
            setError(`Upload failed: ${e.message || 'An unknown error occurred.'}`);
            onUploadSuccess(''); // Clear the image state in the parent on failure

        } finally {
            setIsLoading(false);
        }
    } else {
        alert('Please upload a valid image file (e.g., PNG, JPG).');
        setError('Invalid file type selected.');
    }
  }, [onUploadSuccess]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && !isLoading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && !isLoading && e.target.files && e.target.files.length > 0) {
          handleFile(e.target.files[0]);
          // Important: clear the file input value so that the onChange event fires 
          // again if the user selects the same file after a previous success/failure.
          e.target.value = ''; 
      }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Candidate Photo</label>
      <div
        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 rounded-md transition-colors ${
          (isDragging && !disabled) ? 'border-dmi-blue-500 bg-dmi-blue-50 border-dashed' : 'border-dashed'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="space-y-1 text-center">
          {isLoading ? (
             // Assuming a Spinner component exists based on the file list
            <div className="flex flex-col items-center">
                {/* Placeholder for the Spinner component */}
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-dmi-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-500 mt-2">Uploading and compressing...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Candidate preview" className="mx-auto h-40 w-40 rounded-full object-cover shadow-md" />
          ) : (
            <svg
              className="mx-auto h-20 w-20 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex text-sm text-gray-600 justify-center">
            <label
              htmlFor="file-upload"
              className={`relative cursor-pointer bg-white rounded-md font-medium text-dmi-blue-600 hover:text-dmi-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-dmi-blue-500 ${disabled || isLoading ? 'pointer-events-none text-gray-400' : ''}`}
            >
              <span>{isLoading ? 'Processing...' : imageUrl ? 'Change image' : 'Upload a file'}</span>
              {/* Disable the input if disabled or loading */}
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                onChange={onFileSelect} 
                accept="image/jpeg,image/png" 
                disabled={disabled || isLoading}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
             (Recommended: PNG/JPG up to 500px, compressed for speed)
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
};

export default ImageUploader;