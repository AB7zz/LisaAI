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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10" />
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
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".eml"
                  onChange={(e) => setEmailFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-white
                    hover:file:cursor-pointer hover:file:bg-primary/90
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isVerifying}
                />
              </div>

              {isVerifying && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Verifying email...</span>
                </div>
              )}

              {verificationStatus && (
                <div className={`p-4 rounded-lg ${verificationStatus.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span>{verificationStatus}</span>
                </div>
              )}

              <button
                onClick={handleEmailVerification}
                disabled={!emailFile || isVerifying}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                Verify Email
              </button>

              {proof && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Proof Generated:</h4>
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(proof, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Aadhar Verification */}
      {currentStep === 2 && (
        <div className="w-full max-w-xl border rounded-lg p-4">
          <main className="flex flex-col items-center  gap-8 bg-white rounded-2xl max-w-screen-sm mx-auto h-[24rem] md:h-[20rem] p-8">
            <p className="font-bold ">Prove your Identity anonymously using your Aadhaar card.</p>
            <LogInWithAnonAadhaar nullifierSeed={1234} />
          </main>
          {anonAadhaar.status === "logged-in" && (
            <>
              <p>✅ Verified successfully</p>
            </>
          )}
          <button onClick={handleVerify}>Verify</button>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;