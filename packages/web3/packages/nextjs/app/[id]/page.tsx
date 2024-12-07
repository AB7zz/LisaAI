"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

const mockEmails = [
    {
      id: 1,
      subject: "Interview Invitation - Software Developer Position",
      body: "Dear candidate, we would like to invite you for an interview...",
      from: "abhinavcv007@gmail.com",
      date: "2024-03-20"
    },
    // Add more mock emails as needed
];



const VerificationPage = ({ params }: { params: { verificationId: string } }) => {
    const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();

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
    
    try {
      // Create room
      const roomResponse = await fetch('/api/create-room', {
        method: 'POST'
      });
      const roomData = await roomResponse.json();
      console.log(roomData);
      const roomId = roomData.data.roomId;

      // Get access token
      const tokenResponse = await fetch(`/api/get-access-token?roomId=${roomId}`);
      const tokenData = await tokenResponse.json();
      
      // Redirect to video call page
      router.push(`/${params.id}/${roomId}?token=${tokenData.token}`);
    } catch (error) {
      console.error("Error setting up video call:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between relative">
          {/* Background track */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10" />
          {/* Progress fill - animates with currentStep */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-primary transition-all duration-500 -z-10" 
               style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
          {[1, 2, 3].map((step) => (
            <div 
              key={step} 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${step <= currentStep 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-white border-gray-200 text-gray-500'}`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Email Verification</span>
          <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Aadhar Verification</span>
          <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>Video Call</span>
        </div>
      </div>

      {/* Step 1: Email Verification */}
      {currentStep === 1 && (
        <div className="w-full max-w-xl space-y-4">
          {mockEmails.map((email) => (
            <div key={email.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{email.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">{email.from}</p>
                  <p className="mt-2">{email.body}</p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Aadhar Verification */}
      {currentStep === 2 && (
        <div className="w-full max-w-xl">
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
      )}
    </div>
  );
};

export default VerificationPage;