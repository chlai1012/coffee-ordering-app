"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MenuItem, OptionItem } from "@/lib/types";

interface Props {
  item: MenuItem;
  addToCart: (item: MenuItem, selectedOptionIds: number[], selectedOptions: OptionItem[]) => void;
}

export default function MenuCard({ item, addToCart }: Props) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);

  const selectedOptions = useMemo(
    () => item.options?.filter((option) => selectedOptionIds.includes(option.id)) ?? [],
    [item.options, selectedOptionIds]
  );

  const optionTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);

  const toggleOption = (optionId: number) => {
    setSelectedOptionIds((current) =>
      current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    );
  };

  return (
    <div className="border rounded-xl p-4 shadow-md flex flex-col">
      <div className="relative w-full h-48 overflow-hidden rounded-lg bg-transparent">
        <Image
          src={item.image ?? "/noImage.png"}
          alt={item.name}
          fill
          className="object-contain"
        />
      </div>
      <h2 className="text-xl font-semibold mt-3">{item.name}</h2>
      <p className="text-gray-600">Base price: ${item.price.toFixed(2)}</p>

      {item.options && item.options.length > 0 && (
        <div className="mt-4 text-sm space-y-2">
          <p className="font-medium">Choose options</p>
          <div className="space-y-2">
            {item.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors ${
                  option.is_live
                    ? "bg-slate-50 hover:bg-slate-100 text-slate-900"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed line-through decoration-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptionIds.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    disabled={!option.is_live}
                    className="h-4 w-4 rounded border-gray-300 text-black disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="inline-flex items-center gap-1">
                    {option.name} (+${option.price.toFixed(2)})
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-sm text-gray-700">Total: ${(item.price + optionTotal).toFixed(2)}</p>

      <button
        onClick={() => addToCart(item, selectedOptionIds, selectedOptions)}
        className="mt-4 w-full bg-black text-white p-2 rounded-lg"
      >
        Add to cart
      </button>
    </div>
  );
}
