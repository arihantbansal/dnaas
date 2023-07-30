import { Button, Col, Loading, Row, Text } from "@nextui-org/react";
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

const Home: NextPage = () => {
  const [address, setAddress] = useState("");
  const [explorerLink, setExplorerLink] = useState("");
  const wallet = useWallet();
  const [visible, setVisible] = useState(false);
  const handler = () => setVisible(true);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  useEffect(() => {
	const fetchUserData = async () => {
		const userData = await axios.get(`/api/user/${address}`).then((res) => res.data);
		if (userData?.result === "success") {
			setUserData(userData?.message);
		}
	}

	if (wallet.connected) {
		fetchUserData();
	}
  }, [address, wallet.connected]);
  
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
          >
            {loading && (
              <Loading color="currentColor" type="spinner" size="sm" />
            )}
            Add
          </Button>
        )}
      </Row>
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
