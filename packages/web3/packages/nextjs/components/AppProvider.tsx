"use client";
import React, { createContext, useState, useContext } from "react";
import { SessionProvider } from "next-auth/react";
import { OktoProvider, BuildType } from "okto-sdk-react";

// Create context with a default value
export const AppContext = createContext<{
  apiKey: string;
  setApiKey: (key: string) => void;
  buildType: BuildType;
  setBuildType: (type: BuildType) => void;
}>({
  apiKey: "",
  setApiKey: () => {},
  buildType: BuildType.SANDBOX,
  setBuildType: () => {},
});

function AppProvider({ children, session }: { children: React.ReactNode; session: any }) {
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OKTO_APP_ID || "");
  const [buildType, setBuildType] = useState<BuildType>(BuildType.SANDBOX);

  const handleGAuthCallback = async () => {
    // This will be called by Okto SDK when it needs Google authentication
    if (session?.id_token) {
      return session.id_token;
    }
    return "";
  };

  return (
    <SessionProvider session={session}>
      <AppContext.Provider value={{ apiKey, setApiKey, buildType, setBuildType }}>
        <OktoProvider 
          apiKey={apiKey} 
          buildType={buildType}
          gAuthCb={handleGAuthCallback}
        >
          {children}
        </OktoProvider>
      </AppContext.Provider>
    </SessionProvider>
  );
}

export const useAppContext = () => useContext(AppContext);export default AppProvider;
