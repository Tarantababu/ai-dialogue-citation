"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { I18nProvider } from "@/lib/i18n";

/**
 * Global client providers. A restrained RainbowKit theme is used so the wallet
 * modal stays within the Academic Modernism palette (bronze accent, ivory
 * surfaces) rather than the default crypto blue.
 */
const academicTheme = lightTheme({
  accentColor: "#9a3412", // burnt bronze
  accentColorForeground: "#fbfbf9",
  borderRadius: "small",
  fontStack: "system",
  overlayBlur: "small",
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={academicTheme} modalSize="compact">
          <I18nProvider>{children}</I18nProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
