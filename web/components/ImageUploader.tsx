
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  imageUrl: string | null;
  onImageChange: (base64Image: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onImageChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          onImageChange(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (e.g., PNG, JPG).');
    }
  }, [onImageChange]);

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          handleFile(e.target.files[0]);
      }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Candidate Photo</label>
      <div
        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${
          isDragging ? 'border-dmi-blue-500 bg-dmi-blue-50' : ''
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="space-y-1 text-center">
          {imageUrl ? (
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
              className="relative cursor-pointer bg-white rounded-md font-medium text-dmi-blue-600 hover:text-dmi-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-dmi-blue-500"
            >
              <span>{imageUrl ? 'Change image' : 'Upload a file'}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileSelect} accept="image/*" />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;