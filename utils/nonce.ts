import {
  SystemProgram,
  NONCE_ACCOUNT_LENGTH,
  Keypair,
  Transaction,
  Connection,
} from "@solana/web3.js";

const createDurableNonce = async (
  feePayer: Keypair,
  signedSeed: string,
  nonceNum: number
) => {
  const nonceAccountAuth = Keypair.fromSeed(
    new TextEncoder().encode(`${signedSeed}${nonceNum}`)
  );
  if (!process.env.RPC) throw new Error("RPC env var not set");
  const connection = new Connection(process.env.RPC, {
    commitment: "finalized",
  });
  let nonceAccount = Keypair.generate();
  console.log(`nonce account: ${nonceAccount.publicKey.toBase58()}`);
  let tx = new Transaction().add(
    // create nonce account
    SystemProgram.createAccount({
      fromPubkey: feePayer.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        NONCE_ACCOUNT_LENGTH
      ),
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    // init nonce account
    SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey, // nonce account pubkey
      authorizedPubkey: nonceAccountAuth.publicKey, // nonce account authority (for advance and close)
    })
  );

  console.log(
    `nonce txhash: ${await connection.sendTransaction(
      tx,
      [feePayer, nonceAccount],
      {
        preflightCommitment: "finalized",
      }
    )}`
  );
  return { nonceAccount, nonceAccountAuth };
};

export default createDurableNonce;
