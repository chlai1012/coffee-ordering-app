"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRef } from "react";
import { MenuItem, Order, OptionItem, OptionGroup, Option2Group } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [optionGroupsData, setOptionGroupsData] = useState<OptionGroup[]>([]);
  const [option2groupRows, setOption2groupRows] = useState<Option2Group[]>([]);
  const [optionById, setOptionById] = useState<Record<number, OptionItem>>({});
  const [groupById, setGroupById] = useState<Record<number, OptionGroup>>({});
  const [groupIdsByOption, setGroupIdsByOption] = useState<Record<number, number[]>>({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const goToHistory = () => {
    router.push('/admin/history');
  };

  const attachMenuItem = (order: Order, items: MenuItem[]) => {
    const menuItem = items.find((item) => item.id === order.menu_fk);
    return menuItem ? { ...order, menu_item: { name: menuItem.name } } : order;
  };

  const attachMenuItemsToOrders = (orders: Order[], items: MenuItem[]) => {
    return orders.map((order) => attachMenuItem(order, items));
  };

  const fetchOrders = async (items: MenuItem[], signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/order", { signal });
      const json = await response.json();
      const ordersData = Array.isArray(json?.data) ? json.data : [];

      if (!response.ok) {
        console.error("Failed to load orders:", json.error ?? response.statusText);
        return [];
      }

      const mapped = attachMenuItemsToOrders(ordersData, items);
      setOrders(mapped);
      return mapped;
    } catch (err) {
      if ((err as any)?.name === "AbortError") return [];
      console.error("fetchOrders error", err);
      return [];
    }
  };

  const fetchMenuItems = async (signal?: AbortSignal): Promise<MenuItem[]> => {
    const response = await fetch("/api/menu", { signal });
    const json = await response.json();
    const items: MenuItem[] = Array.isArray(json?.data) ? json.data : [];

    if (!response.ok) {
      console.error("Failed to load menu items:", json.error ?? response.statusText);
      return [];
    }

    setMenuItems(items);
    return items;
  };

  const fetchOptionMetadata = async (signal?: AbortSignal) => {
    try {
      const [optionsResp, groupsResp, option2groupResp] = await Promise.all([
        fetch("/api/option", { signal }),
        fetch("/api/option_group", { signal }),
        fetch("/api/option2group", { signal }),
      ]);

      const [optionsJson, groupsJson, option2groupJson] = await Promise.all([
        optionsResp.json(),
        groupsResp.json(),
        option2groupResp.json(),
      ]);

      const opts: OptionItem[] = Array.isArray(optionsJson.data) ? optionsJson.data : [];
      const groups: OptionGroup[] = Array.isArray(groupsJson.data) ? groupsJson.data : [];
      const opt2grp: Option2Group[] = Array.isArray(option2groupJson.data) ? option2groupJson.data : [];

      setOptions(opts);
      setOptionGroupsData(groups);
      setOption2groupRows(opt2grp);

      const optMap: Record<number, OptionItem> = {};
      opts.forEach((o) => (optMap[o.id] = o));
      setOptionById(optMap);

      const grpMap: Record<number, OptionGroup> = {};
      groups.forEach((g) => (grpMap[g.id] = g));
      setGroupById(grpMap);

      const gidsByOption: Record<number, number[]> = opt2grp.reduce((acc, row) => {
        acc[row.option_fk] = acc[row.option_fk] ?? [];
        acc[row.option_fk].push(row.group_fk);
        return acc;
      }, {} as Record<number, number[]>);

      setGroupIdsByOption(gidsByOption);
    } catch (err) {
      console.error("Failed to load option metadata", err);
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/ding.mp3");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadData = async () => {
      try {
        const items = await fetchMenuItems(controller.signal);
        if (!active) return;
        await fetchOptionMetadata(controller.signal);
        await fetchOrders(items);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("loadData error", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order",
        },
        (payload) => {

          if (payload.eventType === "INSERT") {
            if (soundEnabled) {
              audioRef.current?.play().catch(() => {});
            }
            setOrders((prev) => [attachMenuItem(payload.new as Order, menuItems), ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? attachMenuItem(payload.new as Order, menuItems) : order
              )
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [menuItems, soundEnabled]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/order", {
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
           }>{order.menu_item?.name ?? `Menu #${order.menu_fk}`}</p>

           <p className="text-sm text-gray-700">Customer: {order.customer_name ?? 'Guest'}</p>

           {order.order2option && order.order2option.length > 0 && (
            <div className="text-sm text-gray-600">
              {(() => {
                const groupsMap: Record<number | string, string[]> = {};
                (order.order2option as any[]).forEach((row) => {
                  const optId = row.option_fk ?? row.option_item?.id;
                  const optName = row.option_item?.name ?? optionById[optId]?.name ?? "Unknown";
                  const gIds: number[] = groupIdsByOption[optId] ?? [];
                  if (!gIds || gIds.length === 0) {
                    groupsMap["ungrouped"] = groupsMap["ungrouped"] ?? [];
                    groupsMap["ungrouped"].push(optName);
                  } else {
                    gIds.forEach((gid) => {
                      groupsMap[gid] = groupsMap[gid] ?? [];
                      groupsMap[gid].push(optName);
                    });
                  }
                });

                return Object.entries(groupsMap).map(([gid, names]) => (
                  <p key={gid} className="text-sm text-gray-600">
                    {gid === "ungrouped" ? "Options" : groupById[Number(gid)]?.name ?? "Options"}:
                    {" "}
                    {names.join(", ")}
                  </p>
                ));
              })()}
            </div>
           )}
          <p> Ordered at: {new Date(order.created_at).toLocaleString()}</p>
          <p>Status: {
            order.status === "accepted" ? "👌 Accepted" :
            order.status === "pending" ? "🕐 Pending" :
            order.status === "making" ? "👨‍🍳 Making" :
            order.status === "ready" ? "✅ Ready" :
            order.status
          }</p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => updateStatus(order.id, "accepted")}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            Accept order
          </button>

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

          <button
            onClick={() => updateStatus(order.id, "canceled")}
            className="bg-red-600 text-white px-2 py-1 rounded"
          >
            Cancel order
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