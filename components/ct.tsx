import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const ConnectWallet = ({
  children,
  redirectToWelcome,
  noToast,
  setAddress,
}: {
  children: React.ReactNode;
  noFullSize?: boolean;
  redirectToWelcome?: boolean;
  noToast?: boolean;
  setAddress: any;
}) => {
  const { wallet: SolanaWallet, connect, publicKey } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [clicked, setClicked] = useState(false);
  const [fire, setFire] = useState(false);

  let domain: any = null;
  const router = useRouter();

  useEffect(() => {
    const req =
      !publicKey &&
      SolanaWallet &&
      SolanaWallet.readyState === "Installed" &&
      clicked;
    if (req) {
      try {
        connect();
      } catch (e) {
        console.error(e);
      }
      return;
    }
    if (publicKey) {
      if (!noToast) toast.success("Connected to Solana wallet", { id: "conn" });

      if (setAddress) setAddress(publicKey.toString());
    }
  }, [SolanaWallet, visible, publicKey, redirectToWelcome, clicked, fire]);

  const handleConnect = async () => {
    setClicked(true);
	
    if (SolanaWallet) {
      toast.loading("disconnecting...", { id: "dis" });
      await SolanaWallet.adapter.disconnect();
      setAddress("");
      toast.success("disconnected", { id: "dis" });
      return;
    }
    console.log("Solana Wallet retrieved", SolanaWallet, domain);
    setVisible(true);
  };

  return <div onClick={handleConnect}>{children}</div>;
};