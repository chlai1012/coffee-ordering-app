"use client";
import Image from "next/image";
import { MenuItemType } from "@/lib/menuData";

interface Props {
  item: MenuItemType;
  addToCart: (item: MenuItemType) => void;
}

export default function MenuCard({ item, addToCart }: Props) {
  return (
    <div className="border rounded-xl p-4 shadow-md">
      <Image
        src={item.image}
        alt={item.name}
        width={300}
        height={200}
        className="rounded-lg"
        />
      <h2 className="text-xl font-semibold mt-2">{item.name}</h2>
      <p className="text-gray-600">${item.price}</p>
      <button
        onClick={() => addToCart(item)}
        className="mt-2 w-full bg-black text-white p-2 rounded-lg"
      >
        Add to Cart
      </button>
    </div>
  );
}