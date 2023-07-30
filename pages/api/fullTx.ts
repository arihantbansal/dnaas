import { Transaction, Keypair, SystemProgram } from "@solana/web3.js";
import base58 from "bs58";
import type { NextApiRequest, NextApiResponse } from "next";
import { retrieveNonce } from "./nftTx";

type Data = {
  result: "success" | "error";
  message: string | { error: Error };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { serializedTransaction, numNonce, signedSeed, noncePubKey } = req.body;

  const nonceAccountAuth = Keypair.fromSeed(
    Uint8Array.from([...Array.from(signedSeed), numNonce])
  );

  // The serialized transaction is a base58 encoded string.
  // It needs to be decoded to bytes and then deserialized into a Transaction object.
  const transactionBytes = base58.decode(serializedTransaction);
  let transaction = Transaction.from(transactionBytes);

  const ix = SystemProgram.nonceAdvance({
    authorizedPubkey: nonceAccountAuth.publicKey,
    noncePubkey: noncePubKey,
  });

  transaction.instructions = [ix, ...transaction.instructions];

  const nonce = await retrieveNonce(noncePubKey);

  transaction.recentBlockhash = nonce;

  // Sign the transaction with the nonce account.
  transaction.partialSign(nonceAccountAuth);

  // Serialize the fully signed transaction and encode it as a base58 string.
  const fullySignedTransaction = base58.encode(transaction.serialize());

  res.json({
    result: "success",
    message: fullySignedTransaction,
  });
}
