import { NextResponse } from 'next/server';
import { createAttestation } from '../../lib/attest';  // Import the function from the service

// Define the request body type
interface AttestationRequestBody {
  privateKey: string;
  score: number;
}

export async function POST(request: Request) {
    const { privateKey, score }: AttestationRequestBody = await request.json();

    // Check if all required fields are provided
    if (!privateKey || score === undefined) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        // Call the helper function to create the attestation
        const attestationUID = await createAttestation({ privateKey, score });

        // Send the successful response with the attestation UID
        return NextResponse.json({ attestationUID });
    } catch (error: any) {
        // Send error response if something went wrong
        console.error('Error creating attestation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}