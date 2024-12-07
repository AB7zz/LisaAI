"use client"
import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

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

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleVerify = async () => {
    // if (!imageFile) return;

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