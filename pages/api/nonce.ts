import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";
import createDurableNonce from "../../utils/nonce";

type Data = {
  result: "success" | "error";
  message:
    | {
        nonceAccount: string;
        nonceAccountAuth: string;
      }
    | { error: Error };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { userData, signedSeed } = req.body;
    const wallet = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(process.env.WALLET!))
    );
    const { nonceAccount, nonceAccountAuth } = await createDurableNonce(
      wallet,
      signedSeed,
      userData.numNonce + 1
    );
    console.log({
      nonceAccount: nonceAccount.publicKey.toString(),
      nonceAccountAuth: JSON.stringify(nonceAccountAuth),
    });
    res.json({
      result: "success",
      message: {
        nonceAccount: nonceAccount.publicKey.toString(),
        nonceAccountAuth: base58.encode(nonceAccountAuth.secretKey),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ result: "error", message: { error: error as Error } });
  }
}
