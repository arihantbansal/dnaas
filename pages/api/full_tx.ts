import {
    Transaction,
    Keypair,
  } from "@solana/web3.js";
  import base58 from "bs58";
  import type { NextApiRequest, NextApiResponse } from "next";
  
  type Data = {
    result: "success" | "error";
    message: string | { error: Error };
  };
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const { serializedTransaction, nonceAccountPrivateKey } = req.body;
  
    // The serialized transaction is a base58 encoded string.
    // It needs to be decoded to bytes and then deserialized into a Transaction object.
    const transactionBytes = base58.decode(serializedTransaction);
    let transaction = Transaction.from(transactionBytes);
  
    // Create a keypair object from the private key of the nonce account.
    const nonceAccount = Keypair.fromSecretKey(new Uint8Array(nonceAccountPrivateKey));
  
    // Sign the transaction with the nonce account.
    transaction.partialSign(nonceAccount);
  
    // Serialize the fully signed transaction and encode it as a base58 string.
    const fullySignedTransaction = base58.encode(transaction.serialize());
  
    res.json({
      result: "success",
      message: fullySignedTransaction,
    });
  }