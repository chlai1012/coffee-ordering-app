"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Order } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  const goToOrders = () => {
    router.push('/admin');
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

    if (data) setOrders(data || []);
    };

    fetch();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Order History</h1>

      {orders.map((order: any) => (
        <div key={order.id} className="border p-3 mb-2 rounded">
          <p>{order.item}</p>
          <p>${order.quantity}</p>
        </div>
      ))}

      <button
          onClick={goToOrders}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          📋 Orders
      </button>
    </div>
  );
}