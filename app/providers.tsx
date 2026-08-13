"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { http } from "viem";

const queryClient = new QueryClient();

// 나중에 체인 정보 수정할 예정
const config = getDefaultConfig({
  appName: "RHGods Mint",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // 나중에 바꿀 예정
  chains: [], // 나중에 추가
  transports: {},
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
