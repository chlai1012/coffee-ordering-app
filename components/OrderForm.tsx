"use client";
import { useState } from "react";

interface Props {
  setMessage: (msg: string) => void;
}

export const OrderForm: React.FC<Props> = ({ setMessage }) => {
  const [drink, setDrink] = useState("Latte");

  const order = async () => {
    await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ drink }),
    });
    setMessage(`Order for ${drink} sent!`);
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={drink}
        onChange={(e) => setDrink(e.target.value)}
        className="border p-2"
      >
        <option>Latte</option>
        <option>Espresso</option>
        <option>Cappuccino</option>
      </select>
      <button
        onClick={order}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Order
      </button>
    </div>
  );
};