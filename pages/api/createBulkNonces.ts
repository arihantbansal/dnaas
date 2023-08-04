import {
  Connection,
  Keypair,
  NONCE_ACCOUNT_LENGTH,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!process.env.SUPABASE_URL) {
      throw new Error("Missing SUPABASE_URL");
    }
    if (!process.env.SUPABASE_PUBLIC_ANON_KEY) {
      throw new Error("Missing SUPABASE_ANON_KEY");
    }
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLIC_ANON_KEY,
      { auth: { persistSession: false } }
    );

    const { address, amount } = req.body;
    const payer = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.WALLET!))
    );
    const authority = new PublicKey(address);

    const connection = new Connection(process.env.RPC!, "confirmed");

    const nonces = [];

    // Generate nonce accounts
    for (let i = 0; i < amount; i++) {
      const nonceAccount = Keypair.generate();

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: nonceAccount.publicKey,
          lamports: await connection.getMinimumBalanceForRentExemption(
            NONCE_ACCOUNT_LENGTH
          ),
          space: NONCE_ACCOUNT_LENGTH,
          programId: SystemProgram.programId,
        }),
        SystemProgram.nonceInitialize({
          noncePubkey: nonceAccount.publicKey,
          authorizedPubkey: authority,
        })
      );

      await connection.sendTransaction(transaction, [payer, nonceAccount]);
      nonces.push(nonceAccount.publicKey.toString());
    }

    let { data: userData, error } = await supabase
      .from("nonce_ledger")
      .select("pub_key, num_nonces, nonces")
      .eq("pub_key", address)
      .maybeSingle();

    if (error) throw error;

    if (!userData) {
      const { data, error } = await supabase
        .from("nonce_ledger")
        .insert([
          { pub_key: address, num_nonces: nonces.length, nonces: nonces },
        ])
        .select();
    } else {
      const { data, error } = await supabase
        .from("nonce_ledger")
        .update({
          num_nonces: userData.num_nonces + nonces.length,
          nonces: [...userData.nonces, ...nonces],
        })
        .eq("pub_key", address)
        .select();
    }

    res.status(200).json({
      result: "success",
      message: `Successfully created ${amount} nonce accounts`,
      nonces: nonces,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: "error",
      message: { error: error as Error },
    });
  }
}
