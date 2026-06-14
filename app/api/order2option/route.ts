import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { insertOrder2Options } from "@/lib/order2option";

interface Order2Option {
  order_fk: string;
  option_fk: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: Order2Option[] = Array.isArray(body) ? body : body.items ?? [];

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Request body must include an array of items." },
        { status: 400 }
      );
    }

    const { error } = await insertOrder2Options(items);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/order2option error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderFk = url.searchParams.get("order_fk");
    const optionFk = url.searchParams.get("option_fk");

    let query = supabase.from("order2option").select("*");

    if (orderFk) {
      query = query.eq("order_fk", orderFk);
    }

    if (optionFk) {
      query = query.eq("option_fk", optionFk);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Failed to load order2option:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/order2option error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
