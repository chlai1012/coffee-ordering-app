"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRef } from "react";
import { Order } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const goToHistory = () => {
    router.push('/admin/history');
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "completed")
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
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {

          if (payload.eventType === "INSERT") {
            if (soundEnabled) {
              audioRef.current?.play().catch(() => {});
            }
            setOrders((prev) => [payload.new as Order, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? (payload.new as Order) : order
              )
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  
  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border p-3 mb-2 rounded shadow-sm"
        >
          <p className={
             order.status === "pending" ? "text-gray-500" :
             order.status === "making" ? "text-yellow-500" :
             "text-green-600"
          }>{order.item}</p>
          <p>Qty: {order.quantity}</p>
          <p>Status: {
            order.status === "pending" ? "🕐 Pending" :
            order.status === "making" ? "👨‍🍳 Making" :
            order.status === "ready" ? "✅ Ready" :
            order.status
          }</p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => updateStatus(order.id, "making")}
            className="bg-yellow-500 text-white px-2 py-1 rounded"
          >
            Making
          </button>

          <button
            onClick={() => updateStatus(order.id, "ready")}
            className="bg-green-600 text-white px-2 py-1 rounded"
          >
            Ready
          </button>

          <button
            onClick={() => updateStatus(order.id, "completed")}
            className="bg-gray-500 text-white px-2 py-1 rounded"
          >
            Complete
          </button>
        </div>

      </div>
      ))}

      <div className="flex gap-4 mt-6 mb-4">
        <button
          onClick={toggleSound}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
        </button>

        <button
          onClick={goToHistory}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          📦 Completed Orders
        </button>
      </div>
    </div>
  );
}