"use client";

import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { ReactNode } from "react";

interface AnonProviderProps {
  children: ReactNode;
}

export default function AnonProvider({ children }: AnonProviderProps) {
  return (
    <AnonAadhaarProvider
      _useTestAadhaar={true}
      _artifactslinks={{
        zkey_url: "/circuit_final.zkey",
        vkey_url: "/vkey.json",
        wasm_url: "/aadhaar-verfier.wasm",
      }}
    >
      {children}
    </AnonAadhaarProvider>
  );
}
  
