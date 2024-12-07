"use client";

import Anon from "../../components/anon";

const HARDCODED_ADDRESS = "0x72b84a11e12c55690806a476ca80Ec2169675b64";

const VerificationPage = ({ params }: { params: { verificationId: string } }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="w-full max-w-xl">
        {/* AnonAadhaar Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-center text-black text-2xl mb-6">Verify with AnonAadhaar</h2>
          <Anon address={HARDCODED_ADDRESS} />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
