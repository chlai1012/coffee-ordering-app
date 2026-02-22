"use client";
import { useState } from "react";
import { OrderForm } from "../../components/OrderForm";

export default function MenuPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">☕ ABC Home Café</h1>
      <OrderForm setMessage={setMessage} />
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}