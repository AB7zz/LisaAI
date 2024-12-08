"use client";

import React from 'react';
import { OktoLoginButton } from '~~/components/OktoLoginButton';
import { useSession } from 'next-auth/react';

const HomePage = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-4">Welcome to LisaAI</h2>
          
          {!session ? (
            <>
              <p className="mb-4">Please sign in to create your wallet</p>
              <OktoLoginButton />
            </>
          ) : (
            <div className="space-y-4">
              <div className="alert alert-success">
                <span>✓ Successfully logged in as {session.user?.email}</span>
              </div>
              
              <div className="divider">Your Wallet</div>
              
              <OktoLoginButton />
              
              <div className="mt-4">
                <p className="text-sm opacity-70">
                  You can now proceed with email verification and other steps
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;