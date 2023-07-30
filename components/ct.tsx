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
  const { wallet, connect, publicKey } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [clicked, setClicked] = useState(false);
  const [fire, setFire] = useState(false);

  let domain: any = null;
  const router = useRouter();

  useEffect(() => {
    const req =
      !publicKey && wallet && wallet.readyState === "Installed" && clicked;
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
  }, [wallet, visible, publicKey, redirectToWelcome, clicked, fire]);

  const handleConnect = async () => {
    setClicked(true);

    if (wallet) {
      toast.loading("disconnecting...", { id: "dis" });
      await wallet.adapter.disconnect();
      setAddress("");
      toast.success("disconnected", { id: "dis" });
      return;
    }
    console.log("Solana Wallet retrieved", wallet, domain);
    setVisible(true);
  };

  return <div onClick={handleConnect}>{children}</div>;
};
