"use client";

import { HuddleClient, HuddleProvider } from "@huddle01/react";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  options: {
    activeSpeakers: {
      size: 12,
    },
  },
});

export const ScaffoldEthAppClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <HuddleProvider client={huddleClient}>
            <ScaffoldEthAppWithProviders>
              {children}
            </ScaffoldEthAppWithProviders>
          </HuddleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};