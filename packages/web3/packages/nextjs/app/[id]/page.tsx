"use client"
import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import zkeSDK from "@zk-email/sdk";

type HomeProps = {
  setUseTestAadhaar: (state: boolean) => void;
  useTestAadhaar: boolean;
};

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

const VerificationPage = ({ params }: { params: { id: string } }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [proof, setProof] = useState<any>(null);
  const [emailFile, setEmailFile] = useState<File | null>(null);

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

  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log("Logged-in status:", anonAadhaar.status);
      if (latestProof) {
        console.log("Aadhaar Proof:", latestProof);
      }
    }
  }, [anonAadhaar, latestProof]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleEmailVerification = async () => {
    if (!emailFile) {
      setVerificationStatus("Please select an email file first");
      return;
    }

    setIsVerifying(true);
    try {
      const eml = await emailFile.text();
      const sdk = zkeSDK();
      const blueprint = await sdk.getBlueprint("AazimAnish/fromAddress@v2");
      const prover = blueprint.createProver();
      
      const generatedProof = await prover.generateProof(eml);
      const { proofData, publicData } = generatedProof.getProofData();
      setProof({ proofData, publicData });
      setVerificationStatus("Email successfully verified!");
      setCurrentStep(2);
    } catch (error) {
      console.error("Error generating proof:", error);
      setVerificationStatus("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async () => {
    try {
      const roomResponse = await fetch('/api/create-room', {
        method: 'POST'
      });
      const roomData = await roomResponse.json();
      console.log(roomData);
      const roomId = roomData.data.roomId;

      const tokenResponse = await fetch(`/api/get-access-token?roomId=${roomId}`);
      const tokenData = await tokenResponse.json();

      router.push(`/${params.id}/${roomId}?token=${tokenData.token}`);
    } catch (error) {
      console.error("Error setting up video call:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      {/* Progress Bar - Updated colors */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-700 -z-10 rounded-full" />
          <div 
            className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-700 ease-in-out -z-10 rounded-full"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }} 
          />
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                ${step <= currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 border-blue-500 text-white shadow-lg scale-110'
                  : 'bg-gray-800 border-gray-600 text-gray-400'} 
                transform hover:scale-105`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm font-medium">
          {['Email Verification', 'Aadhar Verification', 'Video Call'].map((label, index) => (
            <span
              key={label}
              className={`transition-all duration-300 ${
                index + 1 <= currentStep
                  ? 'text-blue-400'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Cards - Updated styling */}
      {currentStep === 1 && (
        <div className="w-full max-w-2xl animate-fadeIn">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col gap-6">
              <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Verification
              </h3>
              
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".eml"
                  onChange={(e) => setEmailFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90
                    focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    group-hover:shadow-md"
                  disabled={isVerifying}
                />
              </div>

              {isVerifying && (
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="font-medium">Verifying your email...</span>
                </div>
              )}

              {verificationStatus && (
                <div className={`p-4 rounded-lg transition-all duration-300 transform ${
                  verificationStatus.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                    : 'bg-red-50 text-red-700 border-l-4 border-red-500'
                }`}>
                  <span className="font-medium">{verificationStatus}</span>
                </div>
              )}

              <button
                onClick={handleEmailVerification}
                disabled={!emailFile || isVerifying}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full
                  font-semibold hover:shadow-lg transform hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
                  transition-all duration-300"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>

              {proof && (
                <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                  <h4 className="font-semibold text-gray-900 mb-3">Proof Generated:</h4>
                  <pre className="text-sm text-gray-700 overflow-auto bg-white p-4 rounded-lg">
                    {JSON.stringify(proof, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Enhanced Aadhar Verification */}
      {currentStep === 2 && (
        <div className="w-full max-w-2xl animate-fadeIn">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl">
            <main className="flex flex-col items-center gap-8">
              <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Prove Your Identity
              </h3>
              <p className="text-gray-300 text-center max-w-md">
                Verify your identity anonymously using your Aadhaar card. Your privacy is our priority.
              </p>
              <LogInWithAnonAadhaar nullifierSeed={1234} />
              
              
            <div className="text-center">
                {/* <p className="text-green-600 font-semibold mb-4">✅ Verified successfully</p> */}
                <button
                onClick={handleVerify}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full
                    font-semibold hover:shadow-lg transform hover:-translate-y-0.5
                    transition-all duration-300"
                >
                Verify
                </button>
            </div>
              
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;