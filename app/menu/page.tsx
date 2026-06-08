"use client";
import { useEffect, useState } from "react";
import MenuCard from "@/components/MenuCard";
import { MenuItem, Order, OptionItem, OptionGroup, Option2Group } from "@/lib/types";

type CartItem = Order & {
  selectedOptionIds?: number[];
  selectedOptions?: OptionItem[];
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    item: MenuItem,
    selectedOptionIds: number[] = [],
    selectedOptions: OptionItem[] = []
  ) => {
    const optionTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
    const newOrder: CartItem = {
      id: "",
      menu_fk: item.id,
      status: "pending",
      created_at: new Date(),
      customer_name: "Guest",
      price: item.price + optionTotal,
      selectedOptionIds,
      selectedOptions,
    };

    setCart((prev) => [...prev, newOrder]);
    alert(`${item.name} added to cart!`);
  };

  useEffect(() => {
    async function loadMenu() {
      setLoading(true);

      try {
        const [menuResponse, optionsResponse, option2menuResponse, optionGroupsResponse, option2groupResponse] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/option"),
          fetch("/api/option2menu"),
          fetch("/api/option_group"),
          fetch("/api/option2group"),
        ]);

        const [menuJson, optionsJson, option2menuJson, optionGroupsJson, option2groupJson] = await Promise.all([
          menuResponse.json(),
          optionsResponse.json(),
          option2menuResponse.json(),
          optionGroupsResponse.json(),
          option2groupResponse.json(),
        ]);

        if (
          !menuResponse.ok ||
          !optionsResponse.ok ||
          !option2menuResponse.ok ||
          !optionGroupsResponse.ok ||
          !option2groupResponse.ok
        ) {
          console.error(
            "Failed to load menu or option group data:",
            menuJson.error || optionsJson.error || option2menuJson.error || optionGroupsJson.error || option2groupJson.error
          );
          setMenuItems([]);
          return;
        }

        const allOptions: OptionItem[] = Array.isArray(optionsJson.data) ? optionsJson.data : [];
        const option2MenuRows: { menu_fk: number; option_fk: number }[] = Array.isArray(option2menuJson.data)
          ? option2menuJson.data
          : [];
        const allGroups: OptionGroup[] = Array.isArray(optionGroupsJson.data)
          ? optionGroupsJson.data.map((group: OptionGroup) => ({
              ...group,
              multi_select: group.multi_select ?? false,
              required: group.required ?? false,
            }))
          : [];
        const option2GroupRows: Option2Group[] = Array.isArray(option2groupJson.data)
          ? option2groupJson.data
          : [];

        const optionGallery = new Map<number, OptionItem>(allOptions.map((option) => [option.id, option]));
        const optionGroupsById = new Map<number, OptionGroup>(allGroups.map((group) => [group.id, group]));
        const groupIdsByOption = option2GroupRows.reduce<Record<number, number[]>>((acc, row) => {
          acc[row.option_fk] = acc[row.option_fk] ?? [];
          acc[row.option_fk].push(row.group_fk);
          return acc;
        }, {});

        const optionsByMenu = option2MenuRows.reduce<Record<number, OptionItem[]>>((acc, row) => {
          const option = optionGallery.get(row.option_fk);
          if (!option) return acc;
          acc[row.menu_fk] = acc[row.menu_fk] ?? [];
          acc[row.menu_fk].push(option);
          return acc;
        }, {});

        const menuWithOptions: MenuItem[] = (Array.isArray(menuJson.data) ? menuJson.data : []).map(
          (item: MenuItem) => {
            const menuOptions = optionsByMenu[item.id] ?? [];
            const groupedOptions = new Map<number | "ungrouped", { group: OptionGroup | null; options: OptionItem[] }>();

            menuOptions.forEach((option) => {
              const groupIds = groupIdsByOption[option.id] ?? [];

              if (groupIds.length === 0) {
                const existing = groupedOptions.get("ungrouped");
                groupedOptions.set("ungrouped", {
                  group: existing?.group ?? null,
                  options: [...(existing?.options ?? []), option],
                });
                return;
              }

              groupIds.forEach((groupId) => {
                const group = optionGroupsById.get(groupId);
                if (!group) return;

                const existing = groupedOptions.get(groupId);
                groupedOptions.set(groupId, {
                  group,
                  options: [...(existing?.options ?? []), option],
                });
              });
            });

            const optionGroups = Array.from(groupedOptions.values())
              .map((entry) => ({
                id: entry.group?.id ?? -1,
                name: entry.group?.name ?? "Options",
                created_at: entry.group?.created_at ?? new Date(),
                multi_select: entry.group?.multi_select ?? true,
                required: entry.group?.required ?? false,
                options: entry.options,
              }))
              .sort((a, b) => {
                if (a.id === -1) return 1;
                if (b.id === -1) return -1;
                return a.name.localeCompare(b.name);
              });

            return {
              ...item,
              options: menuOptions,
              optionGroups,
            };
          }
        );

        setMenuItems(menuWithOptions);
      } catch (error) {
        console.error("Error fetching menu or options:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Please add at least one item to your cart.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cart),
      });

      if (response.ok) {
        alert("✅ Order sent!");
        setCart([]);
      } else {
        const json = await response.json();
        console.error("Failed to send cart:", json.error);
        alert("❌ Failed to send order. Please try again.");
      }
    } catch (err) {
      console.error("Error sending order:", err);
      alert("❌ Error sending order. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-base font-bold mb-6 text-center">
        Sheau-Yu & Han's Home Café ☕
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading menu…</div>
        ) : menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuCard key={item.id} item={item} addToCart={addToCart} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">No menu items available.</div>
        )}
      </div>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-semibold">🛒 Cart</h2>
        {cart.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Your cart is empty.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {cart.map((item, index) => (
              <div key={`${item.menu_fk}-${index}`} className="rounded-xl border p-4 bg-white shadow-sm">
                <p className="font-medium">Menu ID: {item.menu_fk}</p>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Options: {item.selectedOptions.map((opt) => opt.name).join(", ")}
                  </p>
                )}
                <p className="text-sm text-gray-700">Price: ${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-lg font-semibold">Total: ${total.toFixed(2)}</p>
        <button
          onClick={checkout}
          disabled={checkoutLoading}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {checkoutLoading ? "Sending order…" : "Send Order"}
        </button>
      </div>
    </div>
  );
}
