import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { Order } from "@/lib/types";
import { insertOrder2Options, extractOptionIds } from "@/lib/order2option";

export async function POST(req: Request) {
  const body = await req.json();
  const items: Order[] = Array.isArray(body) ? body : body.items ?? [];

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "Request body must include an array of items." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("order")
    .insert(
      items.map((item: Order) => ({
        status: "pending",
        menu_fk: item.menu_fk,
        customer_name: item.customer_name || "Guest",
      }))
    )
    .select();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const insertedOrders = data as Order[] | null;
  const createdOrders = Array.isArray(insertedOrders) ? insertedOrders : [];
  const orderOptionRows = createdOrders.flatMap((order, index) => {
    const selectedOptionIds = extractOptionIds(items[index]);
    return selectedOptionIds.map((optionId) => ({
      order_fk: order.id,
      option_fk: optionId,
    }));
  });

  console.log("Created orders:", createdOrders);
  console.log("Order option rows:", orderOptionRows);

  if (orderOptionRows.length > 0) {
    const { error: optionError } = await insertOrder2Options(orderOptionRows);
    if (optionError) {
      return NextResponse.json({ error: optionError }, { status: 500 });
    }
  }

  return NextResponse.json({ data: createdOrders });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  const { error } = await supabase
    .from("order")
    .update({ status })
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const exclude = url.searchParams.get("exclude");

    let query = supabase.from("order").select("*");
    if (exclude) {
      query = query.neq("status", exclude as string);
    } else {
      query = query.neq("status", "completed");
    }

    const { data: ordersData, error: orderError } = await query.order("created_at", {
      ascending: false,
    });

    if (orderError) {
      console.error("Failed to load orders:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orderIds = Array.isArray(ordersData)
      ? ordersData.map((order) => order.id)
      : [];

    const { data: orderOptionsData, error: orderOptionsError } = await supabase
      .from("order2option")
      .select("*, option_item(*)")
      .in("order_fk", orderIds.length > 0 ? orderIds : []);

    if (orderOptionsError) {
      console.error("Failed to load order options:", orderOptionsError);
      return NextResponse.json({ error: orderOptionsError.message }, { status: 500 });
    }

    const ordersWithOptions = Array.isArray(ordersData)
      ? ordersData.map((order) => ({
          ...order,
          order2option: Array.isArray(orderOptionsData)
            ? orderOptionsData.filter((optionRow) => optionRow.order_fk === order.id)
            : [],
        }))
      : [];

    return NextResponse.json({ data: ordersWithOptions });
  } catch (err) {
    console.error("GET /api/order error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
