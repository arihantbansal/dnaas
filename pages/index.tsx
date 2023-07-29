import { Button, Col, Loading, Row, Text } from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Message, PublicKey, Transaction } from "@solana/web3.js";
import axios from "axios";
import base58 from "bs58";
import type { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConnectWallet } from "../components/ct";
import ModalComponent from "../components/modal";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [address, setAddress] = useState("");
  const [explorerLink, setExplorerLink] = useState("");
  const wallet = useWallet();
  const [visible, setVisible] = useState(false);
  const handler = () => setVisible(true);
  const [loading, setLoading] = useState(false);
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  const call = async () => {
    if (!wallet || !wallet.publicKey) return;
    setLoading(true);
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);

    try {
      if (wallet.signTransaction) {
        const { data: txnData } = await axios.post("/api/tx", {
          address: wallet.publicKey.toString(),
        });
        const { signatures } = txnData.message;
        console.log(txnData, "signatures");
        const tx = Transaction.populate(
          Message.from(base58.decode(txnData.message.tx))
        );
        const sigs = tx.signatures.map((s) => {
          return {
            key: s.publicKey.toBase58(),
            signature: s.signature ? base58.encode(s.signature) : null,
          };
        });
        console.log(sigs, "sigs", signatures);
        signatures.map((s: { key: string; signature: string }) => {
          console.log(s, "s");
          s.signature &&
            tx.addSignature(
              new PublicKey(s.key),
              Buffer.from(base58.decode(s.signature))
            );
        });

        try {
          const txid = await connection.sendRawTransaction(tx.serialize(), {
            preflightCommitment: "recent",
          });
          console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
          setExplorerLink(
            `https://explorer.solana.com/tx/${txid}?cluster=devnet`
          );
          toast.success(`Success!`, {
            id: "done",
          });
          setVisible(true);
          setLoading(false);
        } catch (e) {
          let error = e as Error;
          console.log(error, "error");
          toast.error(error.message, {
            id: "err",
          });
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Col>
      <ModalComponent
        visible={visible}
        closeHandler={closeHandler}
        setVisible={setVisible}
        explorerLink={explorerLink}
      />
      <Row
        justify="center"
        style={{
          marginTop: "2rem",
        }}
      >
        <Text>
          <Text
            h1
            style={{
              fontSize: "8rem",
              marginBottom: "-2rem",
              textAlign: "center",
            }}
          >
            {"Durable Nonces"}
          </Text>
          <Text
            color="#31d1bf"
            h1
            style={{
              fontSize: "8rem",
              textAlign: "center",
            }}
          >
            {"As a Service"}
          </Text>
        </Text>
      </Row>
      <Row justify="center">
        {" "}
        <Button
          style={{
            margin: "1rem",
            backgroundColor: "white",
            color: "black",
            textAlign: "center",
          }}
          icon={
            <Image src="/phantom.svg" alt="phantom" height={25} width={25} />
          }
        >
          <ConnectWallet setAddress={setAddress} noToast={false}>
            {(address.length > 0 &&
              address.substring(0, 5) +
                "..." +
                address.substring(35, address.length - 5)) ||
              "Connect Wallet"}
          </ConnectWallet>
        </Button>
        {address.length > 0 && (
          <Button
            style={{
              margin: "1rem",
              fontSize: "1rem",
            }}
            onClick={call}
          >
            {loading && (
              <Loading color="currentColor" type="spinner" size="sm" />
            )}
            Testdrive 🪄
          </Button>
        )}
      </Row>
      <Button
        style={{
          margin: "1rem",
          fontSize: "1rem",
        }}
        onClick={async () => {
          const data = await axios.get(`/api/user/${address}`);
          console.log(data);
          toast.success(`Success!`, {
            id: "getUserData",
          });
        }}
      >
        Get Data
      </Button>
      <Text
        style={{
          color: "GrayText",
          margin: "2rem",
          textAlign: "center",
          lineHeight: "1.6rem",
          fontWeight: "400",
          letterSpacing: "-0.02em",
          fontSize: "1.25rem",
        }}
      >
        Allocate nonce accounts now, execute faster transactions later.
        <br />
        Only Possible on Solana.
      </Text>
    </Col>
  );
};

export default Home;
