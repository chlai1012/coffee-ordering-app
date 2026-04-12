"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRef } from "react";

interface Order {
  id: string;
  item: string;
  quantity: number;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const enableSound = () => {
    const audio = new Audio("/ding.mp3");
    audio.play().catch(() => {});
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
    audioRef.current = new Audio("/ding.mp3");

    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("New order:", payload.new);

          audioRef.current?.play().catch(() => {});

          setOrders((prev) => [payload.new as Order, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border p-3 mb-2 rounded shadow-sm"
        >
          <p className="font-semibold">{order.item}</p>
          <p>Qty: {order.quantity}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}

      <button
        onClick={enableSound}
        className="mb-4 bg-blue-500 text-white px-3 py-1 rounded"
      >
        🔊 Enable Sound
      </button>
    </div>
  );
}