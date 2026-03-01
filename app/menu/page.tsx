"use client";
import { useState } from "react";
import MenuCard from "@/components/MenuCard";
import { menuItems, MenuItemType } from "@/lib/menuData";

export default function MenuPage() {
  const [cart, setCart] = useState<MenuItemType[]>([]);

  const addToCart = (item: MenuItemType) => {
    setCart([...cart, item]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-base font-bold mb-6 text-center">
        Sheau-Yu & Han's Home Café ☕
      </h1>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <MenuCard key={item.id} item={item} addToCart={addToCart} />
        ))}
      </div>

      {/* Cart */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-semibold">🛒 Cart</h2>
        <p>Total: ${total}</p>
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
          Send Order
        </button>
      </div>
    </div>
  );
}