import {
  Button,
  Col,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Message, PublicKey, Transaction } from "@solana/web3.js";
import axios from "axios";
import base58 from "bs58";
import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ConnectWallet } from "../components/ct";
import ModalComponent from "../components/modal";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";

const WalletDisconnectButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletDisconnectButton,
  { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Home: NextPage = () => {
  const [address, setAddress] = useState("");
  const [explorerLink, setExplorerLink] = useState("");
  const wallet = useWallet();
  const [visible, setVisible] = useState(false);
  const handler = () => setVisible(true);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [numNoncesToCreate, setNumNoncesToCreate] = useState(0);
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await axios
        .get(`/api/user/${address}`)
        .then((res) => res.data);
      if (userData?.result === "success") {
        setUserData(userData?.message);
      }
    };

    if (wallet.connected) {
      fetchUserData();
    }
  }, [address, wallet.connected]);

  const inputHandler = (e: any) => {
    e.preventDefault();
    if (e.target.value > 0) {
      setNumNoncesToCreate(e.target.value);
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
        {!wallet.connected && <WalletMultiButtonDynamic />}
        {wallet.connected && <WalletDisconnectButtonDynamic />}
      </Row>
	  <Spacer y={2} />
      {wallet.connected && (
        <>
          <Row justify="center">
            <Text style={{ textAlign: "center" }}>
              You have{" "}
              <Text b>
                {userData?.numNonces - userData?.numNoncesUsed || 0}
              </Text>{" "}
              nonces left to use.
            </Text>
          </Row>
          <Spacer y={2} />
          <Row justify="center">
            <Input
              clearable
              bordered
              initialValue="1"
              type="number"
              value={numNoncesToCreate}
              onChange={inputHandler}
            />
          </Row>
        </>
      )}
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
