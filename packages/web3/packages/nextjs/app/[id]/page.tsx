"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const VerificationPage = ({ params }: { params: { verificationId: string } }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  });

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleVerify = async () => {
    if (!imageFile) return;
    
    // Add your verification logic here
    console.log("Verifying Aadhar card...");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}
            ${imageFile ? "border-success" : ""}`}
        >
          <input {...getInputProps()} />
          
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-[300px] mx-auto rounded-lg"
              />
              <p className="mt-2 text-sm text-gray-500">Click or drag to replace</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-lg">Drag and drop your Aadhar card image here</p>
              <p className="text-sm text-gray-500 mt-2">or click to select file</p>
              <p className="text-xs text-gray-400 mt-1">Supported formats: JPEG, JPG, PNG</p>
            </div>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={!imageFile}
          className={`w-full mt-4 py-3 rounded-lg font-medium transition-all
            ${imageFile 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          Verify Aadhar Card
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;