// Fetch user data

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type Data = {
  result: "success" | "error";
  message:
    | {
        address: string;
        numNonces: number;
        numNoncesUsed: number;
        nonces: string[];
      }
    | { error: Error };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const address = req.query.address;

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

    let { data, error } = await supabase
      .from("nonce_ledger")
      .select("pub_key, num_nonces, num_nonces_used, nonces")
      .eq("pub_key", address)
      .maybeSingle();

    if (error) throw error;

    res.json({
      result: "success",
      message: {
        address: data ? data.pub_key : address,
        numNonces: data ? data.num_nonces : 0,
        numNoncesUsed: data ? data.num_nonces_used : 0,
        nonces: data ? data.nonces : [],
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: "error",
      message: { error: error as Error },
    });
  }
}
