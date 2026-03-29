import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { items } = await req.json();

  const { data, error } = await supabase.from("orders").insert(
    items.map((item: any) => ({
      item: item.name,
      quantity: 1,
      status: "pending",
    }))
  );

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}