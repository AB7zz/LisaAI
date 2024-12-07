
"use client";

import {
    LogInWithAnonAadhaar,
    useAnonAadhaar,
    AnonAadhaarProof,
} from '@anon-aadhaar/react';
import { useState } from 'react';

interface Fields {
    revealAgeAbove18: boolean;
    revealGender: boolean;
    revealPinCode: boolean;
    revealState: boolean;
}

interface AnonProps {
    address: string;
}

interface DataMapping {
    [key: string]: string;
}

interface AnonAadhaarProof {
    pcd: string;
}

interface AnonAadhaarState {
    status: 'logged-out' | 'logged-in' | string;
    anonAadhaarProofs: {
        '0': {
            pcd: string;
        };
    };
}

type FieldKey = 'revealAgeAbove18' | 'revealGender' | 'revealState' | 'revealPinCode';

export default function Anon({ address }: AnonProps): JSX.Element {
    const [anonAadhaar] = useAnonAadhaar();
    const [fields, setFields] = useState<Fields>({
        revealAgeAbove18: false,
        revealGender: false,
        revealPinCode: false,
        revealState: false,
    });

    const fieldsToReveal = (): FieldKey[] => {
        const fieldsToReveal: FieldKey[] = [];
        if (fields.revealAgeAbove18) fieldsToReveal.push('revealAgeAbove18' as FieldKey);
        if (fields.revealGender) fieldsToReveal.push('revealGender' as FieldKey);
        if (fields.revealPinCode) fieldsToReveal.push('revealPinCode' as FieldKey);
        if (fields.revealState) fieldsToReveal.push('revealState' as FieldKey);
        return fieldsToReveal;
    };

    const login = (): void => {
        alert('Login successful!');
        window.location.href = 'users/userhuid';
    };

    const dataMapping: DataMapping = {
        revealAgeAbove18: 'ageAbove18',
        revealGender: 'gender',
        revealPinCode: 'pinCode',
        revealState: 'state',
    };

    return (
        <div>
            <div> 
                
                <h2 className='text-md text-yellow-500 mb-3'>
                    Verify your identity using Anon Aadhaar, click login!
                </h2>
                <div className='flex justify-center items-center'>
                    <LogInWithAnonAadhaar
                        nullifierSeed={1234}
                        fieldsToReveal={fieldsToReveal()}
                        signal={address}
                    />
                </div>
                <div className='flex gap-2 items-center text-lg'>
                    Status:{' '}
                    <p
                        className={`py-2 ${
                            anonAadhaar?.status === 'logged-out'
                                ? 'text-red-500'
                                : 'text-green-300'
                        }`}
                    >
                        {anonAadhaar?.status}
                    </p>
                </div>
            </div>
            <div className='w-[60%] max-md:w-[95%] mx-auto backdrop-blur-md px-6 py-2 border-yellow-500 border-dotted border-2 rounded-xl'>
                {anonAadhaar?.status === 'logged-in' && (
                    <div className='mx-auto text-md text-yellow-500'>
                        <h2 className='my-2 text-xl'>✅ Your Proof is valid</h2>
                        <AnonAadhaarProof
                            code={JSON.stringify(anonAadhaar.anonAadhaarProofs, null, 2)}
                            label='- Anon Aadhaar Proof'
                        />
                        <p className='my-2 text-xl'>Fetched Details from ZK proof</p>
                        {Object.keys(fields).map((item) => {
                            const key = item as keyof Fields;
                            if (fields[key])
                                return (
                                    <p key={key}>
                                        {dataMapping[key]} :{' '}
                                        {
                                            JSON.parse(anonAadhaar.anonAadhaarProofs['0'].pcd)
                                                .proof?.[dataMapping[key]]
                                        }
                                    </p>
                                );
                        })}
                        <button
                            type="button"
                            onClick={login}
                            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-300"
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}






