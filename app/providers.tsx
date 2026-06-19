"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";

/**
 * Global client providers. DeCite is wallet-free: all blockchain signing happens
 * server-side via the custodial relayer, so no Wagmi/RainbowKit context is
 * needed in the browser. Only the i18n provider remains client-global.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
