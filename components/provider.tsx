import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  GlowWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export const WalletContextProvider: FC<any> = ({ children }) => {
  // If window exists and is on localhost, choose devnet, else choose mainnet
  //   const network =
  //     typeof window !== "undefined" && process.env.NEXT_PUBLIC_ENV === "dev"
  //       ? (process.env.NEXT_PUBLIC_ALCHEMY as string)
  //       : (process.env.NEXT_PUBLIC_ALCHEMY as string);
  const network = process.env.NEXT_PUBLIC_RPC;
  const endpoint = useMemo(() => network, [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
	  new BackpackWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint!}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <WalletContextProvider>{children}</WalletContextProvider>;
};
