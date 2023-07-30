import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize supabase
const supabaseUrl = "your-supabase-url";
const supabaseKey = "your-supabase-key";
const supabase = createClient(supabaseUrl, supabaseKey);

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
          process.env.SUPABASE_PUBLIC_ANON_KEY
        );
   
  const { address, amount } = req.body;
  const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.WALLET!)));
  const authority = new PublicKey(address);
  const lamports = 5000; // Lamports can be set based as per requirements.

  const connection = new Connection(process.env.RPC!, 'confirmed');

  // Generate nonce accounts
  for (let i = 0; i < amount; i++) {
    const nonceAccount = Keypair.generate();

    const transaction = new Transaction().add(
      SystemProgram.createNonceAccount({
        fromPubkey: payer.publicKey,
        noncePubkey: nonceAccount.publicKey,
        authorizedPubkey: authority,
        lamports,
      })
    );

    await connection.sendTransaction(transaction, [payer, nonceAccount]);

    // Store in Supabase
    const { error } = await supabase
      .from('nonce_accounts')
      .insert([
        { public_key: nonceAccount.publicKey.toBase58(), secret_key: nonceAccount.secretKey.toString() },
      ]);

    if (error) {
      console.error('Error inserting to Supabase:', error);
      res.status(500).json({ error: 'Error inserting to Supabase: ' + error.message });
      return;
    }
  }

  res.status(200).json({ message: `Successfully created ${amount} nonce accounts` });
}

catch (error) {
    console.log(error);
    res.status(500).json({
      result: "error",
      message: { error: error as Error },
    });
  }
}