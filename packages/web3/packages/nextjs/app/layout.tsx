import "@rainbow-me/rainbowkit/styles.css";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { ScaffoldEthAppClient } from "./scaffold-eth-app-client.tsx";

export const metadata = getMetadata({ title: "Scaffold-ETH 2 App", description: "Built with 🏗 Scaffold-ETH 2" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ScaffoldEthAppClient>{children}</ScaffoldEthAppClient>;
}
