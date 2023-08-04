// Add data

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type Data = {
  result: "success" | "error";
  message: string | { error: Error };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const address = req.query.address;
    const { numNonces } = req.body;

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

    let { data: userData, error } = await supabase
      .from("nonce_ledger")
      .select("pub_key, num_nonces")
      .eq("pub_key", address)
      .maybeSingle();

    if (error) throw error;

    if (!userData) {
      const { data, error } = await supabase
        .from("nonce_ledger")
        .insert([{ pub_key: address, num_nonces: numNonces }])
        .select();
    } else {
      const { data, error } = await supabase
        .from("nonce_ledger")
        .update({ num_nonces: userData.num_nonces + numNonces })
        .eq("pub_key", address)
        .select();
    }

    res.json({
      result: "success",
      message: "Added data",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: "error",
      message: { error: error as Error },
    });
  }
}
