import {
  Button,
  Col,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
  Textarea,
} from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModalComponent from "../components/modal";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";
import { Connection } from "@solana/web3.js";

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

const SEED_MESSAGE =
  "Sign this message to generate the nonce seed. This allows the application to generate nonce accounts for you.";

const Home: NextPage = () => {
  const [explorerLink, setExplorerLink] = useState("");
  const wallet = useWallet();
  const [visible, setVisible] = useState(false);
  const handler = () => setVisible(true);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [numNoncesToCreate, setNumNoncesToCreate] = useState(0);
  const [signedSeedMessage, setSignedSeedMessage] = useState<Uint8Array>();
  const [txData, setTxData] = useState("");
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await axios
        .get(`/api/user/${wallet.publicKey?.toBase58()}`)
        .then((res) => res.data);
      if (userData?.result === "success") {
        setUserData(userData?.message);
      }
    };

    if (wallet.connected) {
      fetchUserData();
    }
  }, [wallet, wallet.connected, wallet.publicKey]);

  useEffect(() => {
    const signSeedMessage = async () => {
      if (wallet.signMessage) {
        try {
          const signedSeed = await wallet.signMessage(
            Buffer.from(SEED_MESSAGE)
          );
          setSignedSeedMessage(signedSeed);
        } catch (e) {
          console.log(e);
          toast.error("Error signing message");
        }
      }
    };

    if (wallet.connected && !wallet.disconnecting) {
      signSeedMessage();
    }
  }, [wallet, wallet.connected]);

  const inputHandler = (e: any) => {
    e.preventDefault();
    if (e.target.value > 0) {
      setNumNoncesToCreate(e.target.value);
    }
  };

  const textAreaInputHandler = (e: any) => {
    e.preventDefault();
    setTxData(e.target.value);
  };

  const submitTx = async () => {
    setLoading(true);
    const tx = await axios
      .post("/api/fullTx", {
        serializedTransaction: txData,
        numNonce: userData.numNoncesUsed + 1,
        signedSeed: signedSeedMessage,
        noncePubKey: userData.nonces[userData.numNoncesUsed],
      })
      .then((res) => res.data);
    if (tx.result === "success") {
      toast.success("Tx created successfully");
    }
    const signedTx = await wallet.signTransaction!(tx.message);
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC!,
      "confirmed"
    );
    await wallet.sendTransaction!(signedTx, connection);
  };

  const createNonces = async () => {
    setLoading(true);
    const nonces = await axios
      .post("/api/createBulkNonces", {
        address: wallet.publicKey,
        numNonces: numNoncesToCreate,
      })
      .then((res) => res.data);
    if (nonces.result === "success") {
      toast.success("Nonces created successfully");
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
          <Row justify="center" align="center">
            <Input
              bordered
              label="Number of Nonces"
              initialValue="1"
              type="number"
              value={numNoncesToCreate}
              onChange={inputHandler}
            />
            <Spacer x={1} />
            <Button
              style={{ marginTop: "2em" }}
              disabled={numNoncesToCreate === 0}
			  onClick={createNonces}
            >
              Create {numNoncesToCreate} Nonces
            </Button>
          </Row>
          <Spacer y={2} />
          <Row justify="center">
            <Textarea
              bordered
              label="Encoded Transaction Message"
              placeholder="Paste raw base64 encoded partially signed transaction message"
              value={txData}
              onChange={textAreaInputHandler}
            />
          </Row>
          <Spacer y={1} />
          <Row justify="center">
            <Button disabled={txData.length === 0} onClick={submitTx}>
              Submit Tx
            </Button>
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
