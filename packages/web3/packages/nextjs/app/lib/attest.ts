import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers, JsonRpcProvider } from "ethers";

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = "0xd486ea491772175a7d8d0bcb2f27d5743bb93faeb127dfa6db53297c43962730";

// Define the interface for attestation data
interface AttestationData {
  privateKey: string;
  score: number;
}

export async function createAttestation({ privateKey, score }: AttestationData): Promise<string> {
  if (!privateKey || score === undefined) {
    throw new Error("Missing required parameters");
  }

  try {
    // Initialize the Ethereum provider and signer
    const provider = new JsonRpcProvider('https://polygon-amoy.infura.io/v3/9e7b63fa510d492fa94216b306897aef'); 
    const signer = new ethers.Wallet(privateKey, provider);

    // Initialize the Ethereum Attestation Service (EAS)
    const eas = new EAS(easContractAddress);
    await eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("int16 score");

    // Encode the data
    const encodedData = schemaEncoder.encodeData([
      { name: "score", value: score, type: "int16" },
    ]);

    // Send the attestation to the EAS
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: "0x0000000000000000000000000000000000000000",  // Recipient address (could be any valid address)
        expirationTime: 0, // No expiration
        revocable: true,   // Whether the attestation is revocable
        data: encodedData,
      },
    });

    // Wait for the transaction to be confirmed
    const newAttestationUID = await tx.wait();
    return newAttestationUID;  // Return the attestation UID
  } catch (error: any) {
    console.error("Error creating attestation:", error);
    throw new Error(error.message);
  }
}