import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import { activeChain } from "@/lib/contract";

/**
 * RainbowKit + wagmi configuration.
 * Authors connect a Polygon wallet here to sign registry transactions.
 * Both Polygon mainnet and the Amoy testnet are declared so the modal can
 * prompt a network switch toward whichever chain the contract lives on.
 */

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "MISSING_PROJECT_ID";

const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

export const wagmiConfig = getDefaultConfig({
  appName: "Sıfır Düşüş Protocol",
  projectId,
  chains: [activeChain, polygon, polygonAmoy],
  transports: {
    [polygon.id]: http(activeChain.id === polygon.id ? rpcUrl : undefined),
    [polygonAmoy.id]: http(activeChain.id === polygonAmoy.id ? rpcUrl : undefined),
  },
  ssr: true,
});
