"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useOkto } from "okto-sdk-react";
import type { OktoContextType } from "okto-sdk-react";

export function OktoLoginButton() {
  const { data: session } = useSession();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const okto = useOkto() as OktoContextType;

  useEffect(() => {
    const initializeWallet = async () => {
      if (session && !walletAddress && okto) {
        setIsLoading(true);
        setError(null);
        try {
          // First authenticate with Okto
          await new Promise((resolve, reject) => {
            // Get token from session
            const token = (session as any).token;
            if (!token) {
              reject(new Error("No authentication token found"));
              return;
            }

            okto.authenticate(token, (result, error) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
          });

          // Check for existing wallets
          const walletData = await okto.getWallets();
          console.log("Wallet data:", walletData);

          if (walletData?.wallets?.length > 0) {
            setWalletAddress(walletData.wallets[0].address);
          } else {
            // Create new wallet
            console.log("Creating new wallet...");
            const newWalletData = await okto.createWallet();
            console.log("New wallet data:", newWalletData);
            
            if (newWalletData?.wallets?.length > 0) {
              setWalletAddress(newWalletData.wallets[0].address);
            } else {
              throw new Error("Failed to create wallet");
            }
          }
        } catch (err) {
          console.error("Wallet initialization error:", err);
          setError(err instanceof Error ? err.message : "Failed to initialize wallet");
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeWallet();
  }, [session, okto, walletAddress]);

  const handleLogin = async () => {
    if (session) {
      await okto.logOut();
      await signOut({ redirect: true, callbackUrl: "/" });
    } else {
      await signIn("google", { redirect: true, callbackUrl: "/" });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleLogin}
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : session ? "Sign Out" : "Sign In with Google"}
      </button>

      {error && (
        <div className="text-error text-sm">
          {error}
        </div>
      )}

      {walletAddress && (
        <div className="card bg-base-200 p-4">
          <h3 className="text-lg font-bold mb-2">Your Wallet</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono">
              {walletAddress}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(walletAddress)}
              className="btn btn-ghost btn-xs"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>
      )}

      {okto?.isLoggedIn && (
        <div className="text-success text-sm">
          Connected to Okto
        </div>
      )}
    </div>
  );
}