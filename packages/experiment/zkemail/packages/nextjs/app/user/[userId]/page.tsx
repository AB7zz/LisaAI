"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import zkeSDK from "@zk-email/sdk";

const UserPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [proof, setProof] = useState<any>(null);

  const handleEmailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    try {
      // Read the email file
      const eml = await file.text();

      // Initialize ZK Email SDK
      const sdk = zkeSDK();
      const blueprint = await sdk.getBlueprint("AazimAnish/fromAddress@v2");
      const prover = blueprint.createProver();
      
      // Generate the proof
      const generatedProof = await prover.generateProof(eml);
      const { proofData, publicData } = generatedProof.getProofData();
      setProof({ proofData, publicData });
      setVerificationStatus("Email successfully verified!");
    } catch (error) {
      console.error("Error generating proof:", error);
      setVerificationStatus("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Email Verification Portal</span>
        </h1>
        
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-8">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <input 
            type="file" 
            accept=".eml"
            onChange={handleEmailUpload}
            disabled={isVerifying}
            className="file-input file-input-bordered w-full max-w-xs"
          />

          {isVerifying && <p className="text-gray-600">Generating proof...</p>}

          {verificationStatus && (
            <div className={`alert ${verificationStatus.includes('successfully') ? 'alert-success' : 'alert-error'} shadow-lg max-w-md`}>
              <div>
                <span>{verificationStatus}</span>
              </div>
            </div>
          )}

          {proof && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Proof Generated:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(proof, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;