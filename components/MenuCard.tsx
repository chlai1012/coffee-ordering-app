"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MenuItem, OptionItem, OptionGroup } from "@/lib/types";

interface Props {
  item: MenuItem;
  addToCart: (item: MenuItem, selectedOptionIds: number[], selectedOptions: OptionItem[]) => void;
}

export default function MenuCard({ item, addToCart }: Props) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const selectedOptions = useMemo(
    () => item.options?.filter((option) => selectedOptionIds.includes(option.id)) ?? [],
    [item.options, selectedOptionIds]
  );

  const optionTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);

  const optionGroups: OptionGroup[] = item.optionGroups?.length
    ? item.optionGroups
    : item.options
    ? [
        {
          id: -1,
          name: "Options",
          created_at: new Date(),
          multi_select: true,
          required: false,
          options: item.options,
        },
      ]
    : [];

  const getSelectedIdsForGroup = (group: OptionGroup) =>
    selectedOptionIds.filter((optionId) => group.options.some((option) => option.id === optionId));

  const missingRequiredGroups = optionGroups.filter(
    (group) => group.required && getSelectedIdsForGroup(group).length === 0
  );

  const toggleOption = (optionId: number, group: OptionGroup) => {
    if (!group.multi_select) {
      setSelectedOptionIds((current) => {
        const groupOptionIds = group.options.map((option) => option.id);
        const withoutGroup = current.filter((id) => !groupOptionIds.includes(id));
        return [...withoutGroup, optionId];
      });
      return;
    }

    setSelectedOptionIds((current) =>
      current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    );
  };

  const handleAddToCart = () => {
    if (missingRequiredGroups.length > 0) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    addToCart(item, selectedOptionIds, selectedOptions);
  };

  return (
    <div className="border border-slate-700 rounded-xl p-4 shadow-md flex flex-col bg-slate-950 text-slate-100">
      <div className="relative w-full h-48 overflow-hidden rounded-lg bg-transparent">
        <Image
          src={item.image ?? "/noImage.png"}
          alt={item.name}
          fill
          className="object-contain"
        />
      </div>
      <div className="mt-3 flex-1 flex flex-col">
        <h2 className="text-xl font-semibold">{item.name}</h2>
        <div className="mt-1 flex justify-between text-slate-400 text-sm">
          <span>Base price:</span>
          <span>${item.price.toFixed(2)}</span>
        </div>

        {optionGroups.length > 0 && (
          <div className="mt-4 text-sm space-y-4 flex-1">
            {optionGroups.map((group) => (
              <div key={group.id} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-100">{group.name}</p>
                  </div>
                  {group.required && (
                    <span className="text-xs text-red-500" aria-label="required">
                      *
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {group.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors ${
                        option.is_live
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
                          : "bg-slate-800/70 text-slate-500 cursor-not-allowed line-through decoration-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type={group.multi_select ? "checkbox" : "radio"}
                          name={`option-group-${group.id}`}
                          checked={selectedOptionIds.includes(option.id)}
                          onChange={() => toggleOption(option.id, group)}
                          disabled={!option.is_live}
                          className="h-4 w-4 rounded border-slate-500 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-slate-100">{option.name}</span>
                      </div>
                      <span className="text-slate-400">${option.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>

                {showValidation && group.required && getSelectedIdsForGroup(group).length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-red-300">Please select at least one option.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between text-sm text-slate-300">
        <span>Total:</span>
        <span>${(item.price + optionTotal).toFixed(2)}</span>
      </div>

      <button
        onClick={handleAddToCart}
        className="mt-4 w-full bg-black text-white p-2 rounded-lg"
      >
        Add to cart
      </button>
    </div>
  );
}
